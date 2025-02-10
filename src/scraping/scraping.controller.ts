import { AuthGuard } from '@/auth/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/currentUser.decorator';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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

  @Get("list")
  async getProducts(@CurrentUser() user: CurrentUserType,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("query") query?: string,
  ) {
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 1;
    return this.scrapingService.getProducts(user, pageNumber, limitNumber, query);
  }
}
