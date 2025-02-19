import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import OpenAI from "openai";
import { Repository } from "typeorm";
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings } from "./entities/settings.entity";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>,
  ) { }

  async save(newConfig: CreateSettingsDto) {
    const existingConfig = (await this.settingsRepository.find())?.[0];
    if (existingConfig) {
      existingConfig.model = newConfig.model;
      existingConfig.adAccountID = newConfig.adAccountID;
      existingConfig.openAIAPIKey = newConfig.openAIAPIKey;
      await existingConfig.save()
      return existingConfig;
    } else {
      return this.settingsRepository.save(newConfig);
    }
  }

  async get() {
    const config = await this.settingsRepository.find({
      select: ["openAIAPIKey", "adAccountID", "model"],
    });

    if (config?.[0]) {
      const client = new OpenAI({
        apiKey: config?.[0]?.openAIAPIKey
      });
      const modelsList = await client.models.list();
      const models = [];
      if (modelsList?.data && modelsList?.data?.length) {
        for (const model of modelsList.data) {
          if (model.id.startsWith("gpt") || model.id.startsWith("o")) {
            models.push(model.id);
          }
        }
      }
      return {
        ...config[0],
        models
      }
    }
    return {};
  }
}
