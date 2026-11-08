import { Controller, Get, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Public } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  @Public()
  @Get()
  async findAll() {
    const rows = await this.categories
      .createQueryBuilder('category')
      .leftJoin('category.listings', 'listing')
      .select('category.id', 'id')
      .addSelect('category.slug', 'slug')
      .addSelect('category.name', 'name')
      .addSelect('COUNT(listing.id)', 'count')
      .groupBy('category.id')
      .orderBy('category.name', 'ASC')
      .getRawMany();
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      count: Number(r.count),
    }));
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
