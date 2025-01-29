import { InvalidTokenException } from '@/common/exceptions';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { RedisService } from "@liaoliaots/nestjs-redis";
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@Injectable()
export class TokenService {
  private readonly redisClient: Redis | null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,

    private readonly redisService: RedisService
  ) {
    this.redisClient = this.redisService.getOrThrow();
  }

  signAuthTokens(user: User) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  signAccessToken(user: User) {
    return this.jwtService.sign({ email: user.email, ID: user.ID }, { expiresIn: `${this.configService.get('ACCESS_TOKEN_EXPIRATION')}s` });
  }

  async signRefreshToken(user: User) {
    const token = this.jwtService.sign({ ID: user.ID }, { expiresIn: `${this.configService.get('REFRESH_TOKEN_EXPIRATION')}s` });

    await this.redisClient.setex(`refresh_token:${user.ID}`, this.configService.get('REFRESH_TOKEN_EXPIRATION'), token);

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const storedToken = await this.redisClient.get(`refresh_token:${decoded.ID}`);

      if (!storedToken || storedToken !== refreshToken) {
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

  async revokeRefreshToken(userId: string) {
    await this.redisClient.del(`refresh_token:${userId}`);
  }

  async signResetPasswordToken(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: `${this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION')}s` });
    await this.redisClient.setex(`reset_password:${email}`, this.configService.get('RESET_PASSWORD_TOKEN_EXPIRATION'), token);

    return token;
  }

  async verifyResetPasswordToken(token: string) {
    const decodedToken = await this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.redisClient.get(`reset_password:${decodedToken.email}`);
    if (!storedToken) {
      throw new InvalidTokenException('Token not found/expired');
    }

    if (storedToken !== token) {
      throw new BadRequestException('Token not matching');
    }

    await this.redisClient.del(`reset_password:${decodedToken.email}`);

    return decodedToken.email;
  }

  async signEmailVerificationToken(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: `${this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION')}s` });

    await this.redisClient.setex(`email_verification:${email}`, this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION'), token);

    return token;
  }

  async verifyEmailVerificationToken(token: string): Promise<string> {
    const decodedToken = this.jwtService.verify(token);

    if (!decodedToken || !decodedToken.email) {
      throw new InvalidTokenException();
    }

    const storedToken = await this.redisClient.get(`email_verification:${decodedToken.email}`);
    if (!storedToken) {
      throw new InvalidTokenException('Token not found/expired');
    }

    if (storedToken !== token) {
      throw new BadRequestException('Token not matching');
    }

    await this.redisClient.del(`email_verification:${decodedToken.email}`);

    return decodedToken.email;
  }
}
