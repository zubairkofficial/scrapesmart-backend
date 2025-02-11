import { Settings } from "@/settings/entities/settings.entity";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { PGVectorStoreProvider } from "../common/providers/pg-vector-store.provider";
import { AutoPartService } from "./auto-part.service";
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [ScrapingController],
  providers: [ScrapingService, AutoPartService, PGVectorStoreProvider],
})
export class ScrapingModule { }
