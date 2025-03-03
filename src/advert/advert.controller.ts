import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import { Public } from "@/common/decorators/public.decorator";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdvertService } from "./advert.service";
import { CreateAdvertInput, CreateProductDescription } from "./dto/advert.dto";

@UseGuards(AuthGuard)
@Controller("advert")
@ApiBearerAuth("access-token")
export class AdvertController {
  constructor(
    private readonly advertService: AdvertService,
    private readonly configService: ConfigService,
  ) {}

  @Post("meta-ads")
  async create(
    @Body() createAdvertDto: CreateAdvertInput,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.advertService.createAd(createAdvertDto, user.ID);
  }

  @Post("gen-product-desc")
  async generateProductDescription(
    @Body() createProductDescription: CreateProductDescription,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.advertService.generateProductDescription(
      createProductDescription,
      user.ID,
    );
  }

  @Get("auth")
  async authRedirect(@CurrentUser() user: CurrentUserType) {
    const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=https://165f-154-192-207-87.ngrok-free.app/advert/auth/callback&state=${user.ID}&response_type=code&config_id=${process.env.META_APP_CONFIG}`;
    return {
      url,
    };
  }

  @Get("auth/callback")
  @Public()
  @Redirect()
  async authCallback(@Query() query: any) {
    try {
      await this.advertService.authCallback(query);
    } catch (err) {
      return {
        url: `${this.configService.get("FRONTEND_URL")}/configuration?error=true`,
        statusCode: 302,
      };
    }
    return {
      url: `${this.configService.get("FRONTEND_URL")}/configuration`,
      statusCode: 302,
    };
  }
}
