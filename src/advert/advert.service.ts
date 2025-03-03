import { Settings } from "@/settings/entities/settings.entity";
import { ChatOpenAI } from "@langchain/openai";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import * as adsSdk from "facebook-nodejs-business-sdk";
import { DataSource, Repository } from "typeorm";
import { z } from "zod";
import { CreateAdvertInput, CreateProductDescription } from "./dto/advert.dto";
import { EAdCreative } from "./entities/ad-creative.entity";
import { EAd } from "./entities/ad.entity";
import { EAdset } from "./entities/adset.entity";
import { ECampaign } from "./entities/campaign.entity";
import { Description } from "./entities/description.entity";
import { BudgetType } from "./types";

@Injectable()
export class AdvertService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(Description)
    private readonly descriptionRepository: Repository<Description>,
    @InjectRepository(ECampaign)
    private readonly ecampaignRepository: Repository<ECampaign>,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(EAdset)
    private readonly eAdSetRepository: Repository<EAdset>,
    @InjectRepository(EAdCreative)
    private readonly eAdCreativeRepository: Repository<EAdCreative>,
    @InjectRepository(EAd)
    private readonly eAdRepository: Repository<EAd>,
  ) {}

  async generateProductDescription(
    createProductDescription: CreateProductDescription,
    userID: string,
  ) {
    const settings = await this.settingsRepository.findOne({
      where: {
        user: {
          ID: userID,
        },
      },
    });

    if (!settings || !settings.openAIAPIKey) {
      throw new BadRequestException("Please set OpenAI API Key");
    }

    const product = await this.dataSource.query(
      `SELECT * FROM scraping_vector_store WHERE "ID" = $1 LIMIT 1`,
      [createProductDescription.productID],
    );

    if (!product || !product.length) {
      throw new BadRequestException("Product not found");
    }

    const existingDescription = await this.descriptionRepository.findOne({
      where: {
        productID: createProductDescription.productID,
      },
    });

    if (existingDescription) {
      return existingDescription;
    }

    const modelID = settings.model;
    if (!modelID) {
      throw new BadRequestException("Please set OpenAI Model ID in settings");
    }

    const model = new ChatOpenAI({
      apiKey: settings.openAIAPIKey,
      model: modelID,
    });

    const descSchema = z.object({
      description: z.string(),
    });
    const descModel = model.withStructuredOutput(descSchema);

    const productData = JSON.parse(JSON.stringify(product?.[0]?.metadata));
    delete productData["product"]["dealer"];
    delete productData["product"]["images"];
    delete productData["product"]["stockID"];
    delete productData["product"]["imageURL"];
    delete productData["user"];
    delete productData["source"];
    const res = await descModel.invoke([
      {
        role: "system",
        content:
          "generate product description of 100 words. response should be HTML code.",
      },
      {
        role: "user",
        content: JSON.stringify(productData),
      },
    ]);

    const description = this.descriptionRepository.create({
      productID: createProductDescription.productID,
      description: res.description,
      user: {
        ID: userID,
      },
    });
    const desc = await this.descriptionRepository.save(description);
    return desc;
  }

  async createAd(createAdvertDto: CreateAdvertInput, userID: string) {
    const settings = await this.settingsRepository.findOne({
      where: {
        user: {
          ID: userID,
        },
      },
    });

    if (!settings || !settings.metaAccessToken) {
      throw new BadRequestException(
        "Please set up your Meta Access Token in settings",
      );
    }

    const product = await this.dataSource.query(
      `SELECT * FROM scraping_vector_store WHERE "ID" = $1 LIMIT 1`,
      [createAdvertDto.productID],
    );

    if (!product || !product.length) {
      throw new BadRequestException("Product not found");
    }

    const imageURL = product?.[0].metadata.product.images?.[0];
    if (!imageURL) {
      throw new BadRequestException("Product image not found");
    }

    // Initialize Facebook Ads API
    adsSdk.FacebookAdsApi.init(settings.metaAccessToken);

    try {
      const AdAccount = adsSdk.AdAccount;
      const Campaign = adsSdk.Campaign;
      const AdSet = adsSdk.AdSet;
      const AdCreative = adsSdk.AdCreative;
      const AdImage = adsSdk.AdImage;
      const Ad = adsSdk.Ad;

      const {
        data: { data: adAccounts },
      } = await axios.get(
        `https://graph.facebook.com/v22.0/me/adaccounts?access_token=${settings.metaAccessToken}`,
      );
      const adAccount = new AdAccount(adAccounts[0].id);
      const campaign = await adAccount.createCampaign([Campaign.Fields.id], {
        [Campaign.Fields.name]: "Autogenerated My Campaign",
        [Campaign.Fields.special_ad_categories]:
          Campaign.SpecialAdCategory.none,
        [Campaign.Fields.status]: Campaign.Status.paused,
        [Campaign.Fields.objective]: adsSdk.Campaign.Objective.outcome_traffic,
      });

      const ecampaign = this.ecampaignRepository.create({
        metaID: campaign._data.id,
        name: "Autogenerated My Campaign",
        objective: adsSdk.Campaign.Objective.outcome_traffic,
        status: Campaign.Status.paused,
        special_ad_categories: Campaign.SpecialAdCategory.none,
        user: {
          ID: userID,
        },
      });

      await this.ecampaignRepository.save(ecampaign);

      const { data: imgBuffer } = await axios.get(imageURL, {
        responseType: "arraybuffer",
      });
      const adImage = await adAccount.createAdImage([AdImage.Fields.hash], {
        bytes: imgBuffer.toString("base64"),
      });

      // const allAdSetFields = Object.values(AdSet.Fields).filter((field) => {
      //   const others = ["instagram_actor_id", "full_funnel_exploration_mode"];
      //   if (others.indexOf(field) === -1) {
      //     return true;
      //   }
      //   return false;
      // });
      const adSet = await adAccount.createAdSet([], {
        [AdSet.Fields.name]: "My AdSet",
        [createAdvertDto.budgetType === BudgetType.DAILY
          ? AdSet.Fields.daily_budget
          : AdSet.Fields.lifetime_budget]: createAdvertDto.budget * 100,
        [AdSet.Fields.campaign_id]: campaign._data.id,
        [AdSet.Fields.bid_amount]: createAdvertDto.bidAmount * 100,
        [AdSet.Fields.start_time]: createAdvertDto.startDate,
        [AdSet.Fields.end_time]: createAdvertDto.endDate,
        [AdSet.Fields.billing_event]: AdSet.BillingEvent.impressions,
        [AdSet.Fields.optimization_goal]: AdSet.OptimizationGoal.link_clicks,
        [AdSet.Fields.targeting]: {
          geo_locations: {
            countries: ["CA"],
          },
        },
        [AdSet.Fields.status]: AdSet.Status.paused,
      });

      const eAdSet = this.eAdSetRepository.create({
        metaID: adSet._data.id,
        name: "My AdSet",
        budgetType: createAdvertDto.budgetType,
        budget: createAdvertDto.budget,
        bidAmount: createAdvertDto.bidAmount,
        startTime: createAdvertDto.startDate,
        endTime: createAdvertDto.endDate,
        billingEvent: AdSet.BillingEvent.impressions,
        optimizationGoal: AdSet.OptimizationGoal.link_clicks,
        targeting: {
          geo_locations: {
            countries: ["CA"],
          },
        },
        status: AdSet.Status.paused,
        user: {
          ID: userID,
        },
        campaign: {
          ID: ecampaign.ID,
        },
      });
      await this.eAdSetRepository.save(eAdSet);

      const {
        data: { data: pages },
      } = await axios.get(
        `https://graph.facebook.com/v22.0/me/accounts?access_token=${settings.metaAccessToken}`,
      );
      const pageID = pages[0].id;
      const adCreativePayload = {
        name: "Sample Creative",
        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-object-story-spec/
        object_story_spec: {
          page_id: pageID,
          link_data: {
            image_hash: adImage._data.images.bytes.hash,
            link: "https://google.com",
            message: createAdvertDto.description,
            call_to_action: {
              type: "LEARN_MORE",
              value: {
                link: "https://google.com",
              },
            },
          },
        },
      };

      const adCreative = await adAccount.createAdCreative(
        Object.values(AdCreative.Fields),
        adCreativePayload,
      );

      const eAdCreative = this.eAdCreativeRepository.create({
        metaID: adCreative._data.id,
        ...adCreativePayload,
        campaign: {
          ID: ecampaign.ID,
        },
        user: {
          ID: userID,
        },
      });
      await this.eAdCreativeRepository.save(eAdCreative);

      const ad = await adAccount.createAd([Ad.Fields.id], {
        name: "My Ad",
        adset_id: adSet._data.id,
        creative: {
          creative_id: adCreative._data.id,
        },
        [Ad.Fields.status]: Ad.Status.paused,
      });

      const eAd = this.eAdRepository.create({
        metaID: ad._data.id,
        name: "My Ad",
        status: Ad.Status.paused,
        adSet: {
          ID: eAdSet.ID,
        },
        adCreative: {
          ID: eAdCreative.ID,
        },
        user: {
          ID: userID,
        },
      });

      await this.eAdRepository.save(eAd);

      return ad._data;
    } catch (error) {
      throw new BadRequestException(
        error.response.error_user_msg || "Error creating ad",
      );
    }
  }

  async authCallback(query: any) {
    const code = query?.code;
    const userID = query?.state;

    if (!code || !userID) {
      throw new BadRequestException("Invalid code");
    }
    const {
      data: { access_token },
    } = await axios.get<
      any,
      {
        data: {
          access_token: string;
        };
      }
    >(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=https://165f-154-192-207-87.ngrok-free.app/advert/auth/callback&client_secret=${process.env.META_APP_SECRET}&code=${code}`,
    );

    const settings = await this.settingsRepository.findOne({
      where: {
        user: {
          ID: userID,
        },
      },
    });

    if (!settings) {
      const newSettings = this.settingsRepository.create({
        user: {
          ID: userID,
        },
        metaAccessToken: access_token,
      });
      await this.settingsRepository.save(newSettings);
    } else {
      settings.metaAccessToken = access_token;
      await this.settingsRepository.save(settings);
    }

    return "Successfully authenticated";
  }
}
