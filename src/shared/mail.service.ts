import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { IResetPasswordMail, IResetPasswordSuccessMail, IVerificationMail } from './shared.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetPasswordMail(input: IResetPasswordMail) {
    try {
      await this.resendService.send({
        from: this.configService.get('RESEND_EMAIL'),
        to: input.email,
        subject: 'Reset Password',
        html: `<p>Hi ${input.firstName},</p><p>To reset your password, please click on this link: <a href="${this.configService.get('FRONTEND_URL')}/reset-password?token=${input.token}">Reset Password</a></p><p>If you did not request a password reset, please ignore this email.</p><p>Best,</p><p>Your Team</p>`,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendResetPasswordSuccessMail(input: IResetPasswordSuccessMail) {
    await this.resendService.send({
      from: this.configService.get('RESEND_EMAIL'),
      to: input.email,
      subject: 'Reset Password',
      html: `<p>Hi ${input.firstName},</p><p>Your password has been successfully reset.</p><p>Best,</p><p>Your Team</p>`,
    });
  }

  async sendVerificationMail(input: IVerificationMail) {
    await this.resendService.send({
      from: this.configService.get('RESEND_EMAIL'),
      to: input.email,
      subject: 'Verify Your Email',
      html: `
          <p>Hi ${input.firstName},</p>
          <p>Welcome! Please verify your email address by clicking the link below:</p>
          <p><a href="${this.configService.get('FRONTEND_URL')}/verify-email?token=${input.token}">Verify Email</a></p>
          <p>This link will expire in 10 min.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>Best,</p>
          <b>Scrape Smart</b>
        `,
    });
  }
}
