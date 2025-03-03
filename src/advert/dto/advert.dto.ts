import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";
import { BudgetType } from "../types";

export class CreateAdvertInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  productID: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @ApiProperty({ enum: BudgetType })
  @IsNotEmpty()
  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @ApiProperty({
    example: "100",
  })
  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @ApiProperty({
    example: "30",
  })
  @IsNotEmpty()
  @IsNumber()
  bidAmount: number;
}

export class CreateProductDescription {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  productID: string;
}
