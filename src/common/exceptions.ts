import { HttpException } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor(message: string = 'Invalid Token') {
    super(
      {
        statusCode: 498,
        message,
        error: 'Invalid Token',
      },
      498,
    );
  }
}
