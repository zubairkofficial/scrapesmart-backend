import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
} from "class-validator";

export class ScrapeSourceInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  source: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value === "true")
  uploadToWordpress: boolean;
}

export class ScrapeInput {
  @ApiProperty({
    example: "2024",
    description: "Year of the vehicle",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: "Year must be a 4-digit number" })
  year: string;

  @ApiProperty({
    example: "Audi A3",
    description: "Model of the vehicle",
  })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({
    example: "A Pillar",
    description: "Name of the part",
  })
  @IsNotEmpty()
  @IsString()
  partName: string;

  @ApiProperty({
    example: "All States",
    description: "Location for search",
    default: "All States",
  })
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty({
    example: "year",
    description: "Sort results by field",
  })
  @IsOptional()
  @IsString()
  sortBy: string;

  @ApiProperty({
    example: "",
    description: "ZIP code for location-based search",
  })
  @IsOptional()
  @IsString()
  zipCode: string;

  @ApiProperty({
    example: "interchange",
    description: "Interchange search",
  })
  @IsOptional()
  @IsString()
  interchange?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === "true";
  })
  uploadToWordpress: boolean;
}

export class WordpressUploadInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productID: string;
}
