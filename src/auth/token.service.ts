import { InvalidTokenException } from '@/common/exceptions';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { AuthToken } from "./entities/AuthToken.entity";
import { AuthTokenType } from "./types";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(AuthToken) private readonly authTokenRepository: Repository<AuthToken>
  ) { }

  async signAuthTokens(user: User, rememberME: boolean) {
    const tokens = {
      accessToken: "",
      refreshToken: ""
    }

    tokens.accessToken = this.signAccessToken(user);
    rememberME && (tokens.refreshToken = await this.signRefreshToken(user))

    return tokens
  }

  signAccessToken(user: User) {
    return this.jwtService.sign({ email: user.email, ID: user.ID }, { expiresIn: `${this.configService.get('ACCESS_TOKEN_EXPIRATION')}s` });
  }

  async signRefreshToken(user: User) {
    const token = this.jwtService.sign({ ID: user.ID }, { expiresIn: `${this.configService.get('REFRESH_TOKEN_EXPIRATION')}s` });

    await this.authTokenRepository.save(this.authTokenRepository.create({
      identifier: user.ID, token, type: AuthTokenType.refreshToken, TTL: new Date(Date.now() + this.configService.get('REFRESH_TOKEN_EXPIRATION') * 1000)
    }));

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const storedToken = await this.authTokenRepository.findOne({ where: { identifier: decoded.ID, token: refreshToken, type: AuthTokenType.refreshToken } });

      if (!storedToken) {
        throw new InvalidTokenException('Invalid refresh token');
      }

      const user = await this.userService.getById(decoded.ID);

      return {
        accessToken: this.signAccessToken(user),
        refreshToken: await this.signRefreshToken(user),
      };
    } catch (error) {
      throw new InvalidTokenException('Failed to refresh token');
    }
  }

  async signResetPasswordToken(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: `${this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION')}s` });
    await this.authTokenRepository.save(this.authTokenRepository.create({
      identifier: email, token, type: AuthTokenType.resetPassword, TTL: new Date(Date.now() + this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION') * 1000)
    }));

    return token;
  }

  async verifyResetPasswordToken(token: string) {
    const decodedToken = await this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.authTokenRepository.findOne({ where: { identifier: decodedToken.email, token, type: AuthTokenType.resetPassword, TTL: MoreThan(new Date()) } });
    if (!storedToken) {
      throw new InvalidTokenException('Token not found/expired');
    }

    await this.authTokenRepository.delete({ type: AuthTokenType.resetPassword, identifier: decodedToken.email, token });

    return decodedToken.email;
  }

  async signEmailVerificationToken(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: `${this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION')}s` });

    await this.authTokenRepository.save(this.authTokenRepository.create({
      identifier: email, token, type: AuthTokenType.emailVerification, TTL: new Date(Date.now() + this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION') * 1000)
    }));

    return token;
  }

  async verifyEmailVerificationToken(token: string): Promise<string> {
    let decodedToken;
    try {
      decodedToken = this.jwtService.verify(token);
    } catch (error) {
      throw new InvalidTokenException('Token not found/expired');
    }

    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.authTokenRepository.findOne({ where: { identifier: decodedToken.email, token, type: AuthTokenType.emailVerification, TTL: MoreThan(new Date()) } });

    if (!storedToken) {
      throw new InvalidTokenException('Token not found/expired');
    }

    await storedToken.remove();

    return decodedToken.email;
  }
}
