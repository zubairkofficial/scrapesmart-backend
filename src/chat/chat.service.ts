import { ChatOpenAI } from "@langchain/openai";
import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { z } from "zod";
import { ChatInfoDTO } from "./dto/chatInfo.dto";
import { Chat } from "./entities/chat.entity";

@Injectable()
export class ChatService {
  private model: ChatOpenAI;

  constructor(private configService: ConfigService, @InjectRepository(Chat)
  private chatsRepository: Repository<Chat>) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = new ChatOpenAI({
      model: "gpt-3.5-turbo",
      openAIApiKey: apiKey,
      temperature: 0.7, // Adjust creativity
      maxTokens: 100, // Adjust length of response
    });
  }

  async getChatList(userID: string): Promise<Chat[]> {
    return this.chatsRepository.find({
      where: { user: { ID: userID } },
      order: { createdAt: 'DESC' },
      select: ['ID', 'title', 'createdAt'],
    });
  }

  async chat(message: string, userID: string, chatID?: string): Promise<string> {
    let chat: Chat;
    if (chatID) {
      chat = await this.chatsRepository.findOne({
        where: {
          ID: chatID, user: {
            ID: userID,
          }
        }
      });
    }

    if (!chat || !chatID) {
      const titleSchema = z.object({
        title: z.string(),
      });
      const titleModel = this.model.withStructuredOutput(titleSchema);
      const titleResponse = await titleModel.invoke(
        [{
          role: 'system',
          content: "generate a title for chat history by using the first message",
        }, {
          role: 'user',
          content: message,
        }]
      );

      chat = this.chatsRepository.create({
        title: titleResponse?.title || "Untitled Chat",
        messages: [],
        user: {
          ID: userID
        }
      })
    }

    chat.messages.push({ role: 'user', content: message });
    const response = await this.model.invoke(
      chat.messages as { role: 'user' | 'assistant'; content: string }[]
    );
    chat.messages.push({ role: 'assistant', content: response.content as string });

    await this.chatsRepository.save(chat);
    return chatID;
  }

  async getChatInfo(userID: string, info: ChatInfoDTO): Promise<Chat> {
    return this.chatsRepository.findOne({
      where: {
        ID: info.chatID,
        user: {
          ID: userID,
        }
      }
    });
  }
}
