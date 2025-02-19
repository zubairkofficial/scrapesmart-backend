import { Settings } from "@/settings/entities/settings.entity";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatOpenAI } from "@langchain/openai";
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { Repository } from "typeorm";
import { z } from "zod";
import { Chat } from "./entities/chat.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatsRepository: Repository<Chat>,
    @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
    @Inject('PGVectorStore') private pgVectorStore: PGVectorStore
  ) { }

  async getChatList(userID: string): Promise<Chat[]> {
    return this.chatsRepository.find({
      where: { user: { ID: userID } },
      order: { createdAt: 'DESC' },
      select: ['ID', 'title', 'createdAt'],
    });
  }

  async chat(message: string, userID: string, chatID?: string) {
    const settings = await this.settingsRepository.find();
    if (!settings.length) {
      throw new BadRequestException('Please set OpenAI API Key');
    }

    const apiKey = settings[0].openAIAPIKey;
    if (!apiKey) {
      throw new BadRequestException('Please set OpenAI API Key');
    }

    const modelID = settings[0].model;
    if (!modelID) {
      throw new BadRequestException('Please set OpenAI Model ID in settings');
    }

    const model = new ChatOpenAI({
      model: modelID,
      apiKey
    });

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
      const titleModel = model.withStructuredOutput(titleSchema);
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

    const docs = await this.pgVectorStore.similaritySearch(message, 10, {
      user: {
        ID: userID,
      },
    });

    chat.messages.unshift({
      role: 'system',
      content: `
        if listing products: 1. increase product price by 30% 2. response should be in markdown not wrapped in markdown code block. 3. products should have exact values from context. 4. products should not be listed in plain text. 5. products should be listed in a table format. 6. don't respond to any other queries beside the context.
        Use the following context to generate a response:
        ${docs.map((doc) => doc.pageContent).join('\n\n')} ')}
      `,
    });

    chat.messages.push({ role: 'user', content: message });

    return new Observable((subscriber) => {
      (async () => {
        try {
          const response = await model.stream(
            chat.messages as { role: 'user' | 'assistant'; content: string }[]
          );

          let fullMsg = "";

          for await (const message of response) {
            subscriber.next({
              data: { content: message.content }
            } as MessageEvent);
            fullMsg += message.content;
          }

          chat.messages.push({ role: 'assistant', content: fullMsg });
          chat.messages.shift()
          await this.chatsRepository.save(chat);

          // Send end event and complete the stream
          subscriber.next({
            data: { type: 'end' }
          } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }

  async getChatInfo(userID: string, chatID: string): Promise<Chat> {
    return this.chatsRepository.findOne({
      where: {
        ID: chatID,
        user: {
          ID: userID,
        }
      }
    });
  }
}
