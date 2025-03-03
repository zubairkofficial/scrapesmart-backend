import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import OpenAI from "openai";
import { Repository } from "typeorm";
import { CreateSettingsDto } from "./dto/create-settings.dto";
import { Settings } from "./entities/settings.entity";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async save(newConfig: CreateSettingsDto, userID: string) {
    const existingConfig = await this.settingsRepository.findOne({
      where: { user: { ID: userID } },
    });
    if (existingConfig) {
      await this.settingsRepository.update(
        {
          ID: existingConfig.ID,
        },
        newConfig,
      );
      return existingConfig;
    } else {
      return this.settingsRepository.save({
        ...newConfig,
        user: { ID: userID },
      });
    }
  }

  async get(userID: string) {
    const config = await this.settingsRepository.findOne({
      where: { user: { ID: userID } },
      select: {
        createdAt: false,
        updatedAt: false,
      },
    });

    if (config) {
      let modelsList;
      try {
        const client = new OpenAI({
          apiKey: config.openAIAPIKey,
        });
        modelsList = await client.models.list();
      } catch (e) {
        console.error(e);
      }
      const models = [];
      if (modelsList?.data && modelsList?.data?.length) {
        for (const model of modelsList.data) {
          if (model.id.startsWith("gpt") || model.id.startsWith("o")) {
            models.push(model.id);
          }
        }
      }
      return {
        ...config,
        models,
      };
    }

    return {};
  }
}
