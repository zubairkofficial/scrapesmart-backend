import { User } from "@/user/entities/user.entity";
import { UserService } from "@/user/user.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: CurrentUserType): Promise<User> {
    try {
      const user = await this.usersService.findById(payload.ID);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }
}
