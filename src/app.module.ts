import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UserModule } from './user/user.module';
import { RedisModule as NRedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { SharedModule } from './shared/shared.module';
import { ScrapingModule } from './scraping/scraping.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    NRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<RedisModuleOptions> => ({
        config: { url: configService.get<string>('REDIS_URI') },
      }),
      inject: [ConfigService],
    }),
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
export class AppModule {}
