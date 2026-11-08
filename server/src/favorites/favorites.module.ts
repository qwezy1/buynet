import {
  Controller,
  Delete,
  Get,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Listing } from '../entities/listing.entity';
import { CurrentUser } from '../auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(
    @InjectRepository(Favorite)
    private readonly favorites: Repository<Favorite>,
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
  ) {}

  /** ID объявлений в избранном текущего пользователя */
  @Get()
  async myFavoriteIds(@CurrentUser() user: { sub: number }) {
    const rows = await this.favorites.find({
      where: { user: { id: user.sub } },
      relations: { listing: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((f) => f.listing.id);
  }

  @Post(':listingId')
  async add(
    @CurrentUser() user: { sub: number },
    @Param('listingId', ParseIntPipe) listingId: number,
  ) {
    const listing = await this.listings.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Объявление не найдено');
    await this.favorites
      .createQueryBuilder()
      .insert()
      .values({ user: { id: user.sub }, listing: { id: listingId } })
      .orIgnore()
      .execute();
    return { ok: true };
  }

  @Delete(':listingId')
  async remove(
    @CurrentUser() user: { sub: number },
    @Param('listingId', ParseIntPipe) listingId: number,
  ) {
    await this.favorites.delete({
      user: { id: user.sub },
      listing: { id: listingId },
    });
    return { ok: true };
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Listing])],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
