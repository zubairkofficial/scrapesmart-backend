import { Page, PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Inject, Injectable } from '@nestjs/common';
import { ScrapeSourceInput } from './dto/scraping.dto';

@Injectable()
export class ScrapingService {
  constructor(
    @Inject('PGVectorStore') private pgVectorStore: PGVectorStore
  ) { }

  async scrapeSource(input: ScrapeSourceInput, user: CurrentUserType) {
    const loader = new PlaywrightWebBaseLoader(input.source, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page: Page) => {
        const content = page.innerText("body")
        return content;
      }
    });
    const docs = await loader.load();

    const vectorDocs = docs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: {
        source: doc.metadata?.source,
        user: user,
        createdAt: new Date(),
      }
    }));

    this.pgVectorStore.addDocuments(vectorDocs);
  }
}
