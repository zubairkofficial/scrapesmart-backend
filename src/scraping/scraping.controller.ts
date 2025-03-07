import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Observable } from "rxjs";
import {
  ScrapeInput,
  ScrapeSourceInput,
  WordpressUploadInput,
} from "./dto/scraping.dto";
import { ScrapingService } from "./scraping.service";

@ApiBearerAuth("access-token")
@Controller("scraping")
@UseGuards(AuthGuard)
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Sse()
  async scrapeSource(
    @Query() input: ScrapeSourceInput,
    @CurrentUser() user: CurrentUserType,
  ) {
    try {
      const productsObservable = await this.scrapingService.scrapeSource(
        input,
        user,
      );
      return productsObservable;
    } catch (error) {
      return new Observable((observer) => {
        observer.next({
          data: {
            type: "error",
            message: error.message,
          },
        });
        observer.error(error);
      });
    }
  }

  @Sse("/form")
  async scrape(
    @Query() input: ScrapeInput,
    @CurrentUser() user: CurrentUserType,
  ) {
    try {
      const productsObservable = await this.scrapingService.scrapeForm(
        input,
        user,
      );
      return productsObservable;
    } catch (error) {
      return new Observable((observer) => {
        observer.next({
          data: {
            type: "error",
            message: error.message,
          },
        });
        observer.error(error);
      });
    }
  }

  @Post("/check-inter")
  async checkInter(
    @Body() input: ScrapeInput,
    @CurrentUser() user: CurrentUserType,
  ) {
    const options = await this.scrapingService.checkInterchange(input);
    return options;
  }

  @Get("list")
  async getProducts(
    @CurrentUser() user: CurrentUserType,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("query") query?: string,
  ) {
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 1;
    return this.scrapingService.getProducts(
      user,
      pageNumber,
      limitNumber,
      query,
    );
  }

  @Post("/uploadToWordpress")
  async uploadProductToWordpress(
    @Body() body: WordpressUploadInput,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.scrapingService.uploadProductToWordpress(body, user);
  }
}
