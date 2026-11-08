# BuyNet

Сервис публикации и поиска пользовательских объявлений.
Полнотекстовый поиск, категории, фильтры по цене и городу,
личный кабинет продавца, избранное и история просмотров.

---

## Содержание

1. [Стек](#стек)
2. [Архитектура](#архитектура)
3. [Быстрый старт](#быстрый-старт)
4. [API](#api)
5. [Переменные окружения](#переменные-окружения)
6. [Структура проекта](#структура-проекта)
7. [Скрипты](#скрипты)
8. [Данные](#данные)
9. [Частые проблемы](#частые-проблемы)

---

## Стек

| Слой | Технологии |
|---|---|
| Бэкенд | Node.js · NestJS · TypeORM · class-validator · JWT (bcryptjs) |
| База данных | PostgreSQL 16 (Docker) · sql.js (локальная разработка) |
| Фронтенд | React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui |
| Инфраструктура | Docker Compose · nginx (прокси `/api` + раздача SPA) |

## Архитектура

```
            ┌──────────────────────────────┐
            │           nginx :80          │
            │  /        → SPA (React)      │
            │  /api/*   → backend:3000     │
            └──────────────┬───────────────┘
                           │
            ┌──────────────▼───────────────┐
            │     NestJS API :3000         │
            │  auth (JWT) · listings CRUD  │
            │  поиск · фильтры · пагинация │
            └──────────────┬───────────────┘
                           │ TypeORM
            ┌──────────────▼───────────────┐
            │       PostgreSQL :5432       │
            └──────────────────────────────┘
```

Локально без Docker бэкенд работает на файловой БД sql.js
(`server/buynet.dev.db`) — схема и данные идентичны, переключение
делается переменной `DB_TYPE`.

## Быстрый старт

### Docker

```bash
docker compose up --build
docker compose exec backend node dist/seed/seed.js   # демо-данные
```

- сайт — http://localhost:8090
- API — http://localhost:3000/api/health
- PostgreSQL — localhost:5432 (`buynet` / `buynet`)

### Локально (без Docker)

```bash
npm --prefix server install && npm --prefix server run build
npm --prefix app install
npm run dev
```

Одна команда поднимает API (:3000) и Vite (:5173, прокси `/api`).
При первом запуске база заполняется демо-данными автоматически.

Демо-аккаунт: `demo@buynet.local` / `demo123`.

## API

Базовый префикс: `/api`. Защищённые эндпоинты требуют
заголовок `Authorization: Bearer <token>`.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | открыт | регистрация: email, имя, пароль |
| POST | `/auth/login` | открыт | вход, возвращает JWT |
| GET | `/listings` | открыт | поиск и фильтры (см. ниже) |
| GET | `/listings/:id` | открыт | карточка объявления |
| GET | `/listings/mine` | JWT | мои объявления |
| POST | `/listings` | JWT | создать объявление |
| PATCH | `/listings/:id` | JWT | изменить (только своё) |
| DELETE | `/listings/:id` | JWT | удалить (только своё) |
| GET | `/categories` | открыт | категории со счётчиками |
| GET | `/favorites` | JWT | id объявлений в избранном |
| POST | `/favorites/:listingId` | JWT | добавить в избранное |
| DELETE | `/favorites/:listingId` | JWT | убрать из избранного |
| GET | `/health` | открыт | health-check |

### Параметры поиска `GET /listings`

| Параметр | Тип | Описание |
|---|---|---|
| `q` | string | поиск по заголовку и описанию |
| `ids` | string | выборка по списку id: `?ids=1,5,9` |
| `categoryId` | number | фильтр по категории |
| `city` | string | фильтр по городу (подстрока) |
| `minPrice`, `maxPrice` | number | диапазон цен |
| `sort` | enum | `newest` · `price_asc` · `price_desc` |
| `page`, `limit` | number | пагинация (limit ≤ 50) |

Ответ: `{ items, total, page, pages }`.

## Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `DB_TYPE` | `postgres` | `postgres` или `sqljs` |
| `DB_HOST` | `localhost` | хост PostgreSQL |
| `DB_PORT` | `5432` | порт PostgreSQL |
| `DB_USER` / `DB_PASSWORD` | `buynet` | учётные данные БД |
| `DB_NAME` | `buynet` | имя базы |
| `JWT_SECRET` | — | секрет подписи токенов (задать в проде) |
| `PORT` | `3000` | порт API |

## Структура проекта

```
buynet/
├── docker-compose.yml
├── package.json            # npm run dev — API + фронт одной командой
├── scripts/
│   ├── dev.js              # раннер локальной разработки
│   └── gen-images.js       # генератор SVG-обложек объявлений
├── server/                 # NestJS API
│   ├── src/entities/       # User · Listing · Category
│   ├── src/auth/           # JWT, guard, DTO
│   ├── src/listings/       # CRUD, поиск, фильтры
│   ├── src/categories/     # категории со счётчиками
│   └── src/seed/           # демо-данные (listings.json)
└── app/                    # React SPA
    ├── public/img/         # локальные SVG-обложки (~4 КБ каждая)
    ├── src/pages/          # главная · карточка · создание · редактирование ·
    │                       # auth · мои объявления · избранное
    └── src/hooks/          # use-auth · use-favorites · use-recent
```

## Скрипты

| Команда | Где | Действие |
|---|---|---|
| `npm run dev` | корень | API + фронт для разработки |
| `npm run build` | корень | сборка бэкенда и фронтенда |
| `node scripts/gen-images.js` | корень | перегенерировать SVG-обложки |
| `npm run seed` | server | демо-данные (через ts-node) |

## Данные

- Категории: электроника, транспорт, недвижимость, одежда и обувь,
  дом и сад, услуги, хобби и спорт, животные.
- Демо-набор: 24 объявления в шести городах; `listings.json` — только
  исходник сида, рабочие данные живут в таблицах `users`, `listings`,
  `categories`, `favorites`.
- Обложки — локальные SVG, генерируются скриптом `gen-images.js`
  (палитра и иконка зависят от категории, композиция — от id объявления).
- Избранное хранится в БД (таблица `favorites`, привязка к аккаунту);
  для гостей — временно в `localStorage`. История просмотров — в
  `localStorage` браузера.

## Частые проблемы
**Пустая лента локально**
Удалите `server/buynet.dev.db` и перезапустите `npm run dev` —
база пересоздастся с демо-данными.
