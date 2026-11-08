import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { buildTypeOrmOptions } from '../database/database.config';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { Category } from '../entities/category.entity';
import LISTINGS from './listings.json';

const CATEGORIES = [
  { slug: 'electronics', name: 'Электроника' },
  { slug: 'transport', name: 'Транспорт' },
  { slug: 'real-estate', name: 'Недвижимость' },
  { slug: 'clothing', name: 'Одежда и обувь' },
  { slug: 'home', name: 'Дом и сад' },
  { slug: 'services', name: 'Услуги' },
  { slug: 'hobby', name: 'Хобби и спорт' },
  { slug: 'pets', name: 'Животные' },
];

interface SeedListing {
  title: string;
  description: string;
  price: number;
  city: string;
  category: string;
  img: string;
}

async function seed() {
  const options = buildTypeOrmOptions() as DataSourceOptions;
  const dataSource = new DataSource(options);
  await dataSource.initialize();

  const categories = dataSource.getRepository(Category);
  const users = dataSource.getRepository(User);
  const listings = dataSource.getRepository(Listing);

  const existing = await categories.count();
  if (existing > 0) {
    console.log('Данные уже есть — сид пропущен.');
    await dataSource.destroy();
    return;
  }

  const savedCategories: Record<string, Category> = {};
  for (const c of CATEGORIES) {
    savedCategories[c.slug] = await categories.save(categories.create(c));
  }

  const passwordHash = await bcrypt.hash('demo123', 10);
  const demoUser = await users.save(
    users.create({ email: 'demo@buynet.local', name: 'Демо Продавец', passwordHash }),
  );

  for (const item of LISTINGS as SeedListing[]) {
    await listings.save(
      listings.create({
        title: item.title,
        description: item.description,
        price: item.price,
        city: item.city,
        imageUrl: `/img/${item.img}.svg`,
        category: savedCategories[item.category],
        author: demoUser,
      }),
    );
  }

  console.log(`Готово: ${CATEGORIES.length} категорий, ${LISTINGS.length} объявлений.`);
  console.log('Демо-аккаунт: demo@buynet.local / demo123');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Ошибка сидирования:', err);
  process.exit(1);
});
