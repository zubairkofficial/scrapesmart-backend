import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResendModule } from 'nestjs-resend';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ResendModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('RESEND_APIKEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class SharedModule {}
