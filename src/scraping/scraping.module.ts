import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingDocument } from './entities/scraping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScrapingDocument])],
  controllers: [ScrapingController],
  providers: [ScrapingService],
})
export class ScrapingModule {}
