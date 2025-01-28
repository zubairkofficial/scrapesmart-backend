import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailVerificationInput, LoginInput, RegistrationInput, RequestResetPasswordInput, ResetPasswordInput, ValidateEmailInput, VerifyEmailInput } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() input: RegistrationInput) {
    await this.authService.register(input);

    return { message: 'Check your mailbox to verify email' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginInput) {
    return this.authService.login(loginDto);
  }

  @Get('request-reset-password')
  async requestResetPassword(@Query() input: RequestResetPasswordInput) {
    await this.authService.requestResetPassword(input);

    return { message: 'Check your mailbox' };
  }

  @Post('reset-password')
  async resetPassword(@Body() input: ResetPasswordInput) {
    await this.authService.resetPassword(input);
    return { message: 'Password reset successfully' };
  }

  @Get('validate-email')
  async validateEmail(@Query() input: ValidateEmailInput) {
    return this.authService.validateEmail(input);
  }

  @Get('verify-email')
  async verifyEmail(@Query() input: VerifyEmailInput) {
    return this.authService.verifyEmail(input);
  }

  @Get('send-email-verification')
  async sendEmailVerification(@Query() input: EmailVerificationInput) {
    await this.authService.sendEmailVerification(input);

    return { message: 'Check your mailbox to verify email' };
  }
}
