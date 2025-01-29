import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class MessageDTO {
  @ApiProperty({
    required: false
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  chatID?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}