import { Settings } from "@/settings/entities/settings.entity";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import * as chr from "cheerio";
import { DataSource, Repository } from "typeorm";
import { AutoPartService } from "./auto-part.service";
import { ScrapeInput, ScrapeSourceInput } from './dto/scraping.dto';

function extractNumber(text: string) {
  // Matches:
  // - Optional negative sign
  // - Digits (with optional commas between)
  // - Optional decimal point and digits
  if (typeof text !== "string") return null;

  const regex = /-?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)/g;

  const matches = text.match(regex);
  if (!matches) return null;

  const numbers = matches.map(num => parseFloat(num.replace(/,/g, '')));
  return numbers.length > 0 ? Number(Number(numbers[0]).toFixed(2)) : null;
}

@Injectable()
export class ScrapingService {
  constructor(
    @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
    private dataSource: DataSource,
    private autoPartAPI: AutoPartService,
    @Inject('PGVectorStore') private pgVectorStore: PGVectorStore,
  ) { }

  private async scrapeProducts(secondLayout: boolean, $: chr.CheerioAPI) {
    const products = [];

    const tableRows = secondLayout ? $('body > center:nth-child(4) > font:nth-child(1) > table:nth-child(3) tr') : $('body > center:nth-child(4) > font:nth-child(1) > table:nth-child(2) tr');

    if (tableRows.length === 0) {
      return products;
    }

    const mappedTds: Record<string, number | null> = {
      miles: null,
      damageCode: null,
      partGrade: null,
      price: null,
      dealerInfo: null,
      distKM: null,
      stockID: null
    }

    await Promise.all($(tableRows).map((i, row) => (async (i, row) => {
      const tds = $(row).find('td');
      // if (tds.length !== 7) return;

      // Extract basic info from first column
      const firstCol = $(tds[0]).html()?.split('<br>') || [];

      // Skip header rows
      if (firstCol.length > 1 && (firstCol[1] || '').trim() === "Part") {
        tds.each((j, td) => {
          if (j <= 1) return;
          const tableHeadText = $(td).text().trim()
          $(td).text().trim();
          if (tableHeadText.indexOf("Part") !== -1) {
            mappedTds['partGrade'] = j;
            return;
          }
          if (tableHeadText.indexOf("Miles") !== -1) {
            mappedTds['miles'] = j;
            return;
          }
          if (tableHeadText.indexOf("Damage") !== -1) {
            mappedTds['damageCode'] = j;
            return;
          }
          if (tableHeadText.indexOf("Price") !== -1) {
            mappedTds['price'] = j;
            return;
          }
          if (tableHeadText.indexOf("Dealer") !== -1) {
            mappedTds['dealerInfo'] = j;
            return;
          }
          if (tableHeadText.indexOf("Dist") !== -1) {
            mappedTds['distKM'] = j;
            return;
          }
          if (tableHeadText.indexOf("Stock") !== -1) {
            mappedTds['stockID'] = j;
            return;
          }
        })
        return;
      };

      const year = parseInt(firstCol[0], 10) || null;
      const partName = (firstCol[1] || '').trim() || null;
      const model = (firstCol[2] || '').trim() || null;

      // Extract description and image
      const descTd = $(tds[1]);
      const imageElement = descTd.find('img');
      const imagePageParams = imageElement.attr("onclick")?.match(/return popupImg\('(.*)'\)/)?.[1] || null;
      const imagesPage = "https://imageappoh.car-part.com/image?" + imagePageParams;

      const $imagePage = await chr.fromURL(imagesPage);
      const thumbs = $imagePage('#thumbs a');
      const images = [];
      thumbs.each((i, thumb) => {
        const link = $imagePage(thumb).attr('onclick')?.match(/switchImg\('(.*)'\)/)?.[1] || null;
        images.push(link);
      });

      const imageURL = imageElement.attr('src') || null;
      const description = descTd.clone().children().remove().end().text().trim() || null;

      // Extract part grade (first character before <br>)
      let partGrade = "X"
      if (mappedTds["partGrade"]) {
        const gradeText = $(tds[mappedTds["partGrade"]]).text().trim();
        partGrade = gradeText.match(/^[ABC]/)?.[0] || 'X';
      }

      // Extract price
      let price = null;
      if (mappedTds['price']) {
        const priceText = $(tds[mappedTds['price']]).text().split('\n')[0];
        price = priceText.match(
          /^\$.*/g
        )?.[0]?.replace(/(actual|undmg)$/, "") || null;
      }

      // Extract dealer info
      const dealer = {
        website: null,
        address: null,
        email: null,
        phone: null
      };
      if (mappedTds['dealerInfo']) {
        const dealerTd = $(tds[mappedTds['dealerInfo']]);
        dealer.website = dealerTd.find('a').first().attr('href') || null
        // Extract address from text after first link
        const addressMatch = dealerTd.html()?.split('</a>')[1]?.split(/<a/)[0];
        dealer.address = addressMatch.trim().replace(/\s+/g, ' ') || null;

        // Extract email from query params
        dealerTd.find('a[href*="sEmail="]').each((i, link) => {
          const href = $(link).attr('href');
          const emailParam = new URLSearchParams(href.split('?')[1]).get('sEmail');
          if (emailParam) dealer.email = emailParam;
        });
        if (!dealer.email) {
          // look for a href starting with mailto=
          dealerTd.find('a[href*="mailto:"]').each((i, link) => {
            const href = $(link).attr('href');
            const email = href.split("?")[0].replace("mailto:", "")
            if (email) dealer.email = email;
          })
        }

        // Extract phone numbers
        const phoneMatches = dealerTd.text().match(/(\d{3}-\d{3}-\d{4})/g);
        dealer.phone = phoneMatches?.join(' / ') || null;
      }

      let miles = null;
      if (mappedTds['miles']) {
        miles = $(tds[mappedTds['miles']]).text().trim().split("--km--")?.[1] || null;
      }

      let distKM = null;
      if (mappedTds['distKM']) {
        distKM = $(tds[mappedTds['distKM']]).text().trim().split("--km--")?.[1] || null;
      }

      let stockID = null;
      if (mappedTds['stockID']) {
        stockID = $(tds[mappedTds['stockID']]).clone().html().split("<br>")?.[0] || null;
      }

      products.push({
        year,
        partName,
        model,
        miles,
        stockID,
        images,
        distKM,
        description,
        imageURL,
        partGrade,
        price,
        dealer
      });
    })(i, row)));

    return products;
  }

  private async addProductsToStore(source, user, products) {
    const documents = products.map((product) => ({
      pageContent: JSON.stringify(product),
      metadata: {
        source,
        product,
        user: user.ID,
        createdAt: new Date(),
      }
    }));

    this.pgVectorStore.addDocuments(documents);
  }

  async scrapeSource(input: ScrapeSourceInput, user: CurrentUserType) {
    const settings = await this.settingsRepository.find();
    if (!settings.length || !settings?.[0]?.openAIAPIKey) {
      throw new BadRequestException('Please set OpenAI API Key');
    }

    // const pageURLs = [];
    if (!URL.canParse(input.source)) {
      throw new BadRequestException()
    }
    let url = URL.parse(input.source);

    const searchParams = url.searchParams;

    const isZip = searchParams.get("userZip");
    if (isZip && searchParams.get("userPreference") !== "zip") {
      url = new URL(url.toString().replace(/userPreference=[^&]+/, "userPreference=zip"));
    }

    const $ = await chr.fromURL(url);

    const co2Div = $('body > center > font > div:nth-child(2)').text();
    const isSecondLayout = co2Div.indexOf("CO2e") !== -1;

    const totalPages = extractNumber(
      isSecondLayout ? $("body > center > font > div:nth-child(5) > table > tbody:nth-child(1) > tr:last-child > td:last-child").text().trim() : $("body > center:nth-child(4) > font:nth-child(1) > div:nth-child(4) > table:nth-child(3) > tbody:nth-child(1) > tr:last-child > td:last-child").text().trim());
    if (totalPages) {
      searchParams.set("userPage", "1");
    }

    const products = await this.scrapeProducts(isSecondLayout, $);

    await this.addProductsToStore(input.source, user, products);

    return products.length;
  }

  async scrape(input: ScrapeInput, user: CurrentUserType) {
    const page = await this.autoPartAPI.getProductsPage(input);

    const $ = chr.load(page.data);

    const co2Div = $('body > center > font > div:nth-child(2)').text();
    const isSecondLayout = input.partName == "Engine" || co2Div.indexOf("CO2e") !== -1;

    const products = await this.scrapeProducts(isSecondLayout, $);

    await this.addProductsToStore(page.config.url, user, products);

    return products.length;
  }

  async getProducts(user: CurrentUserType, page: number, limit: number, query?: string) {
    let count;

    let products;

    if (query) {
      count = await this.dataSource.query("SELECT COUNT(*) FROM scraping_vector_store WHERE metadata->>'user' = $1 AND (metadata->'product'->>'partName') ILike $2 OR (metadata->'product'->>'model') ILike $2", [user.ID, `%${query}%`]);
    } else {
      count = await this.dataSource.query("SELECT COUNT(*) FROM scraping_vector_store WHERE metadata->>'user' = $1", [user.ID]);
    }
    const totalPages = Math.ceil(count[0].count / limit);
    const isNextPage = page < totalPages;

    const pageNumber = Math.min(page, totalPages)

    const OFFSET = (pageNumber - 1) * limit;

    if (query) {
      products = await this.dataSource.query("SELECT metadata FROM scraping_vector_store WHERE metadata->>'user' = $1 AND ((metadata->'product'->>'partName') ILIKE '%' || $2 || '%' OR (metadata->'product'->>'model') ILIKE '%' || $2 || '%') LIMIT $3 OFFSET $4", [user.ID, query, limit, OFFSET]);
    } else {
      products = await this.dataSource.query("SELECT metadata FROM scraping_vector_store WHERE metadata->>'user' = $1 LIMIT $2 OFFSET $3", [user.ID, limit, OFFSET]);
    }

    const productsWithUpdatedPrice = products.map((product) => {
      const price = extractNumber(product.metadata.product.price);
      const isNumber = typeof price === 'number';
      return {
        metadata: {
          ...product.metadata,
          product: {
            ...product.metadata.product,
            price: isNumber ? `$${Number(price * 1.3).toFixed(2)}` : product.metadata.product.price
          }
        }
      }
    })

    return {
      products: productsWithUpdatedPrice,
      currentPage: pageNumber,
      totalPages,
      isNextPage
    }
  }
}