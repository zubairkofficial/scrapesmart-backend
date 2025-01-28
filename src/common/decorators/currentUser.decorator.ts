import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const CurrentUser = createParamDecorator(async (_data: unknown, context: ExecutionContext) => {
  const jwtService = new JwtService();

  const ctx = context.switchToHttp().getRequest();

  const authHeader = ctx.headers.authorization;

  if (!authHeader) throw new UnauthorizedException('Invalid authorization specified');

  const token = authHeader.split(' ')[1];

  const decodedData = jwtService.decode(token);
  console.log(decodedData);

  const user: CurrentUserType = {
    ID: decodedData['ID'],
    email: decodedData['email'],
  };

  return user;
});
