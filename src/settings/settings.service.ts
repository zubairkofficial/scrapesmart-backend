import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings } from "./entities/settings.entity";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>,
  ) { }

  async save(createConfigDto: CreateSettingsDto) {
    const existingConfig = (await this.settingsRepository.find())?.[0];
    if (existingConfig) {
      Object.assign(existingConfig, createConfigDto);
      await existingConfig.save()
      return existingConfig;
    } else {
      return this.settingsRepository.save(createConfigDto);
    }
  }

  async get() {
    const config = await this.settingsRepository.find({
      select: ["openAIAPIKey", "adAccountID"],
    });
    return config?.[0] || {};
  }
}
