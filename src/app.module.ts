import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from "./app.controller";
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { AuthTokenSubscriber } from "./common/subscribers/AuthToken.subscriber";
import { ScrapingModule } from './scraping/scraping.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          name: 'default',
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          subscribers: [AuthTokenSubscriber],
          entities: [`dist/**/entities/*.js`],
          synchronize: true, // TODO: for development purpose
          logging: true,
          migrations: [`dist/**/migrations/*.js`],
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid DB credentials specified');
        }

        return new DataSource(options);
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    SharedModule,
    ScrapingModule,
    ChatModule,
  ],
})
export class AppModule { }
