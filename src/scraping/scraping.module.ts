import { Module } from '@nestjs/common';
import { PGVectorStoreProvider } from "../common/providers/pg-vector-store.provider";
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';

@Module({
  imports: [],
  controllers: [ScrapingController],
  providers: [ScrapingService, PGVectorStoreProvider],
})
export class ScrapingModule { }
