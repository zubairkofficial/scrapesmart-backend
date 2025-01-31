import { AuthGuard } from '@/auth/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ScrapeSourceInput } from './dto/scraping.dto';
import { ScrapingService } from './scraping.service';

@ApiBearerAuth('access-token')
@Controller('scraping')
@UseGuards(AuthGuard)
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) { }

  @Post()
  async scrapeSource(@Body() input: ScrapeSourceInput, @CurrentUser() user: CurrentUserType) {
    await this.scrapingService.scrapeSource(input, user);
  }
}
