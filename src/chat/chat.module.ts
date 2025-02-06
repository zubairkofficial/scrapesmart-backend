import { PGVectorStoreProvider } from "@/common/providers/pg-vector-store.provider";
import { Settings } from "@/settings/entities/settings.entity";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from "./entities/chat.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Settings])],
  controllers: [ChatController],
  providers: [ChatService, PGVectorStoreProvider],
})
export class ChatModule { }
