import { comparePassword, generatePasswordHash } from '@/common/utils/bcrypt';
import { MailService } from '@/shared/mail.service';
import { UserService } from '@/user/user.service';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { EmailVerificationInput, LoginInput, RegistrationInput, RequestResetPasswordInput, ResetPasswordInput, ValidateEmailInput, VerifyEmailInput } from './dto/auth.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) { }

  async register(input: RegistrationInput) {
    const userExist = await this.userService.findByEmail(input.email);
    if (userExist && userExist.isEmailVerified) {
      throw new ConflictException('Email already in use');
    }

    if (!userExist?.isEmailVerified) {
      await this.userService.deleteUserByFilters({ email: input.email });
    }

    const user = await this.userService.createUser(input);
    const emailVerificationToken = await this.tokenService.signEmailVerificationToken(user.email);
    await this.mailService.sendVerificationMail({ email: user.email, firstName: user.firstName, token: emailVerificationToken });
  }

  async login(input: LoginInput) {
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    if (!comparePassword(user.password, input.password)) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokens = await this.tokenService.signAuthTokens(user, input.rememberMe);

    delete user.password;
    return { ...tokens, user };
  }

  async requestResetPassword(input: RequestResetPasswordInput) {
    const user = await this.userService.getByEmail(input.email);

    const token = await this.tokenService.signResetPasswordToken(input.email);
    await this.mailService.sendResetPasswordMail({ email: input.email, firstName: user.firstName, token });
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = await this.tokenService.verifyResetPasswordToken(input.token);
    const user = await this.userService.getByEmail(email);

    user.password = generatePasswordHash(input.password);
    await user.save();

    await this.mailService.sendResetPasswordSuccessMail({ email, firstName: user.firstName });
  }

  async validateEmail(input: ValidateEmailInput) {
    const user = await this.userService.findByEmail(input.email);

    return { exist: !!user };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const email = await this.tokenService.verifyEmailVerificationToken(input.token);
    await this.userService.updateUserByFilters({ email }, { isEmailVerified: true });

    return { message: 'Congratulation, your email verified successfully' };
  }

  async sendEmailVerification(input: EmailVerificationInput) {
    const user = await this.userService.getByEmail(input.email);
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.tokenService.signEmailVerificationToken(user.email);
  }
}
