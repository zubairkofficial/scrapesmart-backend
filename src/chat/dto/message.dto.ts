import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class MessageDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chatID: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}