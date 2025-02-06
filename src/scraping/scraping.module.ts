import { Settings } from "@/settings/entities/settings.entity";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PGVectorStoreProvider } from "../common/providers/pg-vector-store.provider";
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [ScrapingController],
  providers: [ScrapingService, PGVectorStoreProvider],
})
export class ScrapingModule { }
