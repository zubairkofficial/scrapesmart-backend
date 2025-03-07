import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegistrationInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  // @Min(6)
  password: string;
}

export class RequestResetPasswordInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ValidateEmailInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class EmailVerificationInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyEmailInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class LoginInput {
  @ApiProperty({
    default: "test@test.com"
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    default: "test@test"
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    default: true
  })
  @IsNotEmpty()
  @IsBoolean()
  rememberMe: boolean;
}
