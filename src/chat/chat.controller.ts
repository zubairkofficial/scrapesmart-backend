import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { MessageDTO } from "./dto/message.dto";

@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('message')
  async message(@Body() messageBody: MessageDTO, @CurrentUser() user: CurrentUserType) {
    const response = await this.chatService.chat(messageBody.message, user.ID, messageBody.chatID);
    return { response };
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
