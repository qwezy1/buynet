import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from '../entities/listing.entity';
import { Category } from '../entities/category.entity';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, Category])],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
