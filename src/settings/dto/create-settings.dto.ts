import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateSettingsDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  openAIAPIKey?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  adAccountID?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  model?: string;
}
