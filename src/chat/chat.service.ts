import { ChatOpenAI } from "@langchain/openai";
import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ChatService {
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = new ChatOpenAI({
      model: "gpt-3.5-turbo",
      openAIApiKey: apiKey,
      temperature: 0.7, // Adjust creativity
      maxTokens: 100, // Adjust length of response
    });
  }


  async chat(message: string): Promise<string> {
    const response = await this.model.invoke(message);
    return response.content as string;
  }

}
