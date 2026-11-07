import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { buildTypeOrmOptions } from '../database/database.config';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { Category } from '../entities/category.entity';

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

const LISTINGS: Array<{
  title: string;
  description: string;
  price: number;
  city: string;
  category: string;
  seed: string;
}> = [
  { title: 'iPhone 14 Pro, 256 ГБ', description: 'Смартфон в отличном состоянии, батарея 91%. Полный комплект, чек, ни одной царапины. Причина продажи — переход на новую модель.', price: 72000, city: 'Москва', category: 'electronics', seed: 'phone14' },
  { title: 'Ноутбук Lenovo ThinkPad X1', description: 'Рабочая лошадка: Core i7, 16 ГБ ОЗУ, SSD 512. Клавиатура с подсветкой, держит батарею до 8 часов.', price: 58000, city: 'Санкт-Петербург', category: 'electronics', seed: 'thinkpad' },
  { title: 'Велосипед горный Stels', description: 'Горный велосипед, 21 скорость, рама 19". Катан один сезон, хранился в тёплом помещении.', price: 14500, city: 'Казань', category: 'hobby', seed: 'bike' },
  { title: 'Диван угловой IKEA', description: 'Угловой диван с спальным местом и нишей для белья. Цвет серый, состояние отличное. Самовывоз.', price: 22000, city: 'Москва', category: 'home', seed: 'sofa' },
  { title: 'Куртка зимняя The North Face', description: 'Оригинальная зимняя куртка, размер M. Носилась аккуратно, пух не скатался, все молнии работают.', price: 9800, city: 'Екатеринбург', category: 'clothing', seed: 'jacket' },
  { title: 'Toyota Camry 2018', description: 'Camry 2.5, автомат, один владелец, пробег 87 000 км. Полная сервисная история, не битая.', price: 2350000, city: 'Новосибирск', category: 'transport', seed: 'camry' },
  { title: 'Сдам 2-комнатную квартиру', description: 'Сдаю уютную двушку в 10 минутах от метро. Свежий ремонт, вся техника, интернет. Длительный срок.', price: 45000, city: 'Москва', category: 'real-estate', seed: 'flat' },
  { title: 'Ремонт квартир под ключ', description: 'Бригада мастеров выполнит ремонт любой сложности: черновой, косметический, дизайнерский. Договор, гарантия 3 года.', price: 5000, city: 'Санкт-Петербург', category: 'services', seed: 'repair' },
  { title: 'Игровая приставка PS5', description: 'PlayStation 5 с дисководом, два геймпада, 4 игры в комплекте. Идеальное состояние.', price: 46000, city: 'Владивосток', category: 'electronics', seed: 'ps5' },
  { title: 'Щенки корги', description: 'Питомник предлагает щенков вельш-корги пемброк. Документы РКФ, прививки по возрасту.', price: 55000, city: 'Москва', category: 'pets', seed: 'corgi' },
  { title: 'Гитара акустическая Yamaha', description: 'Yamaha FG800, звучит глубоко и чисто. Отдам вместе с чехлом, ремнём и медиаторами.', price: 11000, city: 'Казань', category: 'hobby', seed: 'guitar' },
  { title: 'Монитор LG UltraWide 34"', description: 'Ультраширокий монитор 3440×1440, 144 Гц. Идеален для работы и игр. Без битых пикселей.', price: 27000, city: 'Санкт-Петербург', category: 'electronics', seed: 'monitor' },
  { title: 'Самокат электрический Xiaomi', description: 'Xiaomi Mi Scooter 4 Pro, запас хода до 45 км. Пробег всего 300 км, почти новый.', price: 32000, city: 'Москва', category: 'transport', seed: 'scooter' },
  { title: 'Обучение игре на фортепиано', description: 'Частные уроки фортепиано для детей и взрослых. Опыт 12 лет, подготовка к поступлению. Первое занятие бесплатно.', price: 1500, city: 'Новосибирск', category: 'services', seed: 'piano' },
  { title: 'Пальто шерстяное Zara', description: 'Женское пальто из шерсти, размер S, цвет кэмел. Надевала пару раз, состояние нового.', price: 4500, city: 'Екатеринбург', category: 'clothing', seed: 'coat' },
  { title: 'Обеденный стол из массива дуба', description: 'Стол ручной работы из массива дуба, 160×90 см. Очень тяжёлый и надёжный, прослужит десятилетия.', price: 38000, city: 'Москва', category: 'home', seed: 'table' },
];

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

  for (const item of LISTINGS) {
    await listings.save(
      listings.create({
        title: item.title,
        description: item.description,
        price: item.price,
        city: item.city,
        imageUrl: `https://picsum.photos/seed/${item.seed}/640/480`,
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
