import { AuthGuard } from "@/auth/guards/auth.guard";
import { CurrentUser } from "@/common/decorators/currentUser.decorator";
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { MessageDTO } from "./dto/message.dto";

@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('message')
  async generateResponse(@Body() messageBody: MessageDTO, @CurrentUser() user: CurrentUserType) {
    const response = await this.chatService.chat(messageBody.message, user.ID);
    return { response };
  }

  @Get('list')
  async getChatList(@CurrentUser() user: CurrentUserType) {
    console.log(user);
    return this.chatService.getChatList(user.ID);
  }
}
