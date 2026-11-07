import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { CurrentUser, Public } from '../auth/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  /** Публичный поиск: ?q=&categoryId=&city=&minPrice=&maxPrice=&sort=&page=&limit= */
  @Public()
  @Get()
  search(@Query() query: QueryListingsDto) {
    return this.listings.search(query);
  }

  /** Мои объявления (нужна авторизация) */
  @Get('mine')
  mine(@CurrentUser() user: { sub: number }) {
    return this.listings.findMine(user.sub);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listings.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: { sub: number }, @Body() dto: CreateListingDto) {
    return this.listings.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { sub: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listings.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { sub: number }, @Param('id', ParseIntPipe) id: number) {
    return this.listings.remove(user.sub, id);
  }
}
