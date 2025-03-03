import { ECampaign } from "@/advert/entities/campaign.entity";
import { ScrapingModule } from "@/scraping/scraping.module";
import { Settings } from "@/settings/entities/settings.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  imports: [TypeOrmModule.forFeature([Settings, ECampaign]), ScrapingModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
