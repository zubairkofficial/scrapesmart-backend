import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import { Controller, Get, Param, ParseUUIDPipe, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from "@nestjs/swagger";
import { ChatService } from "./chat.service";

@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Sse('message')
  async message(@Query("msg") msg: string, @Query("chatID") chatID: string, @CurrentUser() user: CurrentUserType) {
    const response = await this.chatService.chat(msg, user.ID, chatID);

    return response;
  }

  @Get('list')
  async chatList(@CurrentUser() user: CurrentUserType) {
    return this.chatService.getChatList(user.ID);
  }

  @Get(':id')
  async chat(@CurrentUser() user: CurrentUserType, @Param('id', new ParseUUIDPipe()) chatID: string) {
    return this.chatService.getChatInfo(user.ID, chatID);
  }
}
