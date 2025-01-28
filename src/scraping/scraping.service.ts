import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapeSourceInput } from './dto/scraping.dto';
import { ScrapingDocument } from './entities/scraping.entity';

@Injectable()
export class ScrapingService {
  constructor(
    @InjectRepository(ScrapingDocument)
    private scrapingDocumentRepository: Repository<ScrapingDocument>,
  ) { }

  async scrapeSource(input: ScrapeSourceInput, user: CurrentUserType) {
    const loader = new PlaywrightWebBaseLoader(input.source, {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        // use firefox
      },
      gotoOptions: {
        // waitUntil: "domcontentloaded",
        // timeout: 30000,
        // referer: input.source,
      },
    });
    const docs = await loader.load();

    // Save documents to database
    const scrapingDocuments = docs.map((doc) =>
      this.scrapingDocumentRepository.create({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
        source: doc.metadata?.source,
        user: user,
      }),
    );

    await this.scrapingDocumentRepository.save(scrapingDocuments);
  }

  async scrapeSourceWithCheerio(input: ScrapeSourceInput, user: CurrentUserType) {
    const loader = new CheerioWebBaseLoader(
      input.source,
      {
        // optional params: ...
      }
    );
    const docs = await loader.load();

    // Save documents to database
    const scrapingDocuments = docs.map((doc) =>
      this.scrapingDocumentRepository.create({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
        source: doc.metadata?.source,
        user: user,
      }),
    );

    await this.scrapingDocumentRepository.save(scrapingDocuments);
  }
}
