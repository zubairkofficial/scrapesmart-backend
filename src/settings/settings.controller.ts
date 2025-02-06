import { AuthGuard } from "@/auth/guards/auth.guard";
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateSettingsDto } from './dto/create-settings.dto';
import { SettingsService } from "./settings.service";

@Controller('settings')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  saveSettings(@Body() createConfigDto: CreateSettingsDto) {
    return this.settingsService.save(createConfigDto);
  }

  @Get()
  getSettings() {
    return this.settingsService.get();
  }

}
