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
  siteURL?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  consumerKey?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  consumerSecret?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  model?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  metaAccessToken?: string;
}
