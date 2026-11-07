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
    const items = await this.categories.find({ order: { name: 'ASC' } });
    return items.map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
