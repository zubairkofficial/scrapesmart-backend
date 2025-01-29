import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ChatInfoDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  chatID: string;
}