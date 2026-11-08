import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../entities/listing.entity';
import { Category } from '../entities/category.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listings: Repository<Listing>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async search(query: QueryListingsDto) {
    const qb = this.listings
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.author', 'author')
      .where('listing.isActive = :active', { active: true });

    // LOWER(...) LIKE — переносимо между Postgres и SQLite (локальная разработка)
    if (query.ids) {
      const ids = query.ids
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isInteger(n) && n > 0);
      if (ids.length === 0) {
        return { items: [], total: 0, page: 1, pages: 1 };
      }
      qb.andWhere('listing.id IN (:...ids)', { ids });
    }
    if (query.q) {
      qb.andWhere(
        '(LOWER(listing.title) LIKE :q OR LOWER(listing.description) LIKE :q)',
        { q: `%${query.q.toLowerCase()}%` },
      );
    }
    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    }
    if (query.city) {
      qb.andWhere('LOWER(listing.city) LIKE :city', {
        city: `%${query.city.toLowerCase()}%`,
      });
    }
    if (query.minPrice != null) {
      qb.andWhere('listing.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice != null) {
      qb.andWhere('listing.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('listing.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('listing.price', 'DESC');
        break;
      default:
        qb.orderBy('listing.createdAt', 'DESC');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((l) => this.serialize(l)),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Публичное открытие карточки: инкремент просмотров + выдача. */
  async findOne(id: number) {
    await this.listings.increment({ id }, 'views', 1);
    return this.getRaw(id);
  }

  /** Без инкремента просмотров — для служебных вызовов (create/update). */
  private async getRaw(id: number) {
    const listing = await this.listings.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Объявление не найдено');
    return this.serialize(listing);
  }

  async findMine(userId: number) {
    const items = await this.listings.find({
      where: { author: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return items.map((l) => this.serialize(l));
  }

  async create(userId: number, dto: CreateListingDto) {
    const category = await this.categories.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Категория не найдена');

    const listing = await this.listings.save(
      this.listings.create({
        ...dto,
        imageUrl: dto.imageUrl ?? null,
        category,
        author: { id: userId } as any,
      }),
    );
    return this.getRaw(listing.id);
  }

  async update(userId: number, id: number, dto: UpdateListingDto) {
    const listing = await this.listings.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Объявление не найдено');
    this.assertOwner(listing, userId);

    if (dto.categoryId) {
      const category = await this.categories.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Категория не найдена');
      listing.category = category;
    }
    Object.assign(listing, { ...dto, categoryId: undefined });
    await this.listings.save(listing);
    return this.getRaw(id);
  }

  async remove(userId: number, id: number) {
    const listing = await this.listings.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Объявление не найдено');
    this.assertOwner(listing, userId);
    await this.listings.remove(listing);
    return { ok: true };
  }

  private assertOwner(listing: Listing, userId: number) {
    if (listing.author.id !== userId) {
      throw new ForbiddenException('Можно изменять только свои объявления');
    }
  }

  private serialize(l: Listing) {
    return {
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      city: l.city,
      imageUrl: l.imageUrl,
      isActive: l.isActive,
      views: l.views,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      category: l.category
        ? { id: l.category.id, slug: l.category.slug, name: l.category.name }
        : null,
      author: l.author
        ? { id: l.author.id, name: l.author.name }
        : null,
    };
  }
}
