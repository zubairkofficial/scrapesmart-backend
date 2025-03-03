import { ECampaign } from "@/advert/entities/campaign.entity";
import { WooCommerceService } from "@/scraping/woocommerce.service";
import { Settings } from "@/settings/entities/settings.entity";
import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class StatsService {
  constructor(
    private readonly wooCommerceService: WooCommerceService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(ECampaign)
    private readonly ecampaignRepository: Repository<ECampaign>,
  ) {}

  async getStats(userID: string) {
    try {
      const productsCount = await this.dataSource.query(
        `SELECT COUNT(*) FROM scraping_vector_store WHERE metadata->>'user' = $1;`,
        [userID],
      );

      const settings = await this.settingsRepository.findOne({
        where: {
          user: {
            ID: userID,
          },
        },
      });

      if (!settings) {
        return {
          productsCount: parseInt(productsCount[0].count),
        };
      }

      const wooCoomerce = this.wooCommerceService.init(
        settings.siteURL,
        settings.consumerKey,
        settings.consumerSecret,
      );

      const wpProductsCount = await wooCoomerce.getProductsCount();

      const campaignsCount = await this.ecampaignRepository.count({
        where: {
          user: {
            ID: userID,
          },
        },
      });

      return [
        {
          type: "products",
          title: "Total Products",
          value: parseInt(productsCount[0].count),
          difference: "-5%",
        },
        {
          type: "uploadedProducts",
          title: "Uploaded Products",
          value: wpProductsCount,
          difference: "+5%",
        },
        {
          type: "campaigns",
          title: "Total Campaigns",
          value: campaignsCount,
          difference: "+15%",
        },
      ];
    } catch {
      return [];
    }
  }
}
