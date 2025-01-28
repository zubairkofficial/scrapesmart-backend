import { AuthGuard } from "@/auth/guards/auth.guard";
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatService } from "./chat.service";
import { MessageDTO } from "./dto/message.dto";

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('message')
  async generateResponse(@Body() messageBody: MessageDTO) {
    const response = await this.chatService.chat(messageBody.message);
    return { response };
  }
}
