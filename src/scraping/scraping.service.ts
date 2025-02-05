import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as chr from "cheerio";
import { z } from "zod";
import { ScrapeSourceInput } from './dto/scraping.dto';


function extractNumber(text: string) {
  // Matches:
  // - Optional negative sign
  // - Digits (with optional commas between)
  // - Optional decimal point and digits
  const regex = /-?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)/g;

  const matches = text.match(regex);
  if (!matches) return null;

  const numbers = matches.map(num => parseFloat(num.replace(/,/g, '')));
  return numbers.length > 0 ? numbers[0] : null;

}

const productSchema = z.object({
  products: z.array(z.object({
    year: z.number().nullable(),
    partName: z.string().nullable(),
    model: z.string().nullable(),
    description: z.string().nullable(),
    imageURL: z.string().nullable(),
    partGrade: z.enum(["A", "B", "C", "X"]).optional().default("X"),
    price: z.number().nullable(),
    dealer: z.object({
      website: z.string().nullable(),
      address: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
    })
  }))
});

@Injectable()
export class ScrapingService {
  constructor(
    @Inject('PGVectorStore') private pgVectorStore: PGVectorStore,
  ) { }

  private scrapeProducts(address: string, $: chr.CheerioAPI) {
    if (!URL.canParse(address)) {
      throw new BadRequestException()
    }
    const url = URL.parse(address);
    const searchParams = url.searchParams;

    const products = [];

    const isEngine = searchParams.get("userPart") === "Engine";

    const tableRows = isEngine ? $('body > center:nth-child(4) > font:nth-child(1) > table:nth-child(3) tr') : $('body > center:nth-child(4) > font:nth-child(1) > table:nth-child(2) tr');

    const mappedTds: Record<string, number | null> = {
      miles: null,
      damageCode: null,
      partGrade: null,
      stockNumber: null,
      price: null,
      dealerInfo: null,
      distMiles: null,
    }

    $(tableRows).each((i, row) => {
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
          if (tableHeadText.indexOf("Stock") !== -1) {
            mappedTds['stockNumber'] = j;
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
            mappedTds['distMiles'] = j;
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
      const imageURL = descTd.find('img').attr('src') || null;
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

      products.push({
        year,
        partName,
        model,
        description,
        imageURL,
        partGrade,
        price,
        dealer
      });
    });

    return products;
  }

  async scrapeSource(input: ScrapeSourceInput, user: CurrentUserType) {
    const pageURLs = [];
    if (!URL.canParse(input.source)) {
      throw new BadRequestException()
    }
    const url = URL.parse(input.source);
    const searchParams = url.searchParams;
    searchParams.set("userPage", "1");
    const isEngine = searchParams.get("userPart") === "Engine";


    const $ = await chr.fromURL(url)

    // body > center > font > div:nth-child(5) > table
    const totalPages = extractNumber(
      isEngine ? $("body > center > font > div:nth-child(5) > table > tbody:nth-child(1) > tr:last-child > td:last-child").text().trim() : $("body > center:nth-child(4) > font:nth-child(1) > div:nth-child(4) > table:nth-child(3) > tbody:nth-child(1) > tr:last-child > td:last-child").text().trim());

    pageURLs.push(url.toString());
    const products = this.scrapeProducts(input.source, $);

    const productPromises = [];
    if (typeof totalPages == "number") {
      for (let i = 2; i <= totalPages; i++) {
        searchParams.set("userPage", i.toString());
        productPromises.push(new Promise(async (resolve, reject) => {
          try {
            const $ = await chr.fromURL(url)
            products.push(...this.scrapeProducts(url.toString(), $));
            resolve(0);
          } catch (e) {
            reject(e);
          }
        }))
      }
    }

    await Promise.all(productPromises);

    const documents = products.map((product) => ({
      pageContent: JSON.stringify(product),
      metadata: {
        source: input.source,
        user: user.ID,
        createdAt: new Date(),
      }
    }));

    this.pgVectorStore.addDocuments(documents);
  }
}