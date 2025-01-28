import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class ScrapeSourceInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  source: string;
}
