import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
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
  saveSettings(@Body() createConfigDto: CreateSettingsDto, @CurrentUser() user: CurrentUserType) {
    return this.settingsService.save(createConfigDto, user.ID);
  }

  @Get()
  getSettings(@CurrentUser() user: CurrentUserType) {
    return this.settingsService.get(user.ID);
  }

}
