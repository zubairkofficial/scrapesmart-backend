import { Settings } from "@/settings/entities/settings.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PGVectorStoreProvider } from "../common/providers/pg-vector-store.provider";
import { AutoPartService } from "./auto-part.service";
import { Product } from "./entities/product.entity";
import { ScrapingController } from "./scraping.controller";
import { ScrapingService } from "./scraping.service";
import { ShopifyService } from "./shopify.service";
import { WooCommerceService } from "./woocommerce.service";

@Module({
  imports: [TypeOrmModule.forFeature([Settings, Product])],
  controllers: [ScrapingController],
  providers: [
    ScrapingService,
    AutoPartService,
    PGVectorStoreProvider,
    ShopifyService,
    WooCommerceService,
  ],
  exports: [WooCommerceService],
})
export class ScrapingModule {}
