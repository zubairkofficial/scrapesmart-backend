import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { StatsService } from "./stats.service";

@UseGuards(AuthGuard)
@ApiBearerAuth("access-token")
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@CurrentUser() user: CurrentUserType) {
    return this.statsService.getStats(user.ID);
  }
}
