import { Settings } from "@/settings/entities/settings.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdvertController } from "./advert.controller";
import { AdvertService } from "./advert.service";
import { EAdCreative } from "./entities/ad-creative.entity";
import { EAd } from "./entities/ad.entity";
import { EAdset } from "./entities/adset.entity";
import { ECampaign } from "./entities/campaign.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, ECampaign, EAdset, EAdCreative, EAd]),
  ],
  controllers: [AdvertController],
  providers: [AdvertService],
})
export class AdvertModule {}
