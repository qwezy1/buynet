# BuyNet — доска объявлений

Веб-приложение для публикации и поиска пользовательских объявлений.

## Стек

- **Бэкенд**: Node.js + NestJS, TypeORM, JWT-аутентификация, валидация DTO (class-validator)
- **База данных**: PostgreSQL 16 (в Docker); для локальной разработки без Docker — файловая БД на sql.js
- **Фронтенд**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Инфраструктура**: Docker Compose (db + backend + frontend/nginx)

## Структура

```
buynet/
├── docker-compose.yml      # вся система одной командой
├── package.json            # npm run dev — локальная разработка (API + фронт)
├── scripts/dev.js          # раннер локальной разработки
├── server/                 # NestJS API
│   ├── src/entities/       # User, Listing, Category
│   ├── src/auth/           # регистрация/логин, JWT guard
│   ├── src/listings/       # CRUD + поиск/фильтры/пагинация
│   ├── src/categories/     # справочник категорий
│   └── src/seed/seed.ts    # демо-данные
└── app/                    # React SPA
    ├── src/pages/          # главная, объявление, создание, auth, мои объявления
    └── nginx.conf          # прокси /api → backend (в Docker)
```

## Запуск в Docker (production-like)

```bash
docker compose up --build
```

- Сайт: http://localhost:8080
- API: http://localhost:3000/api (health: `/api/health`)
- PostgreSQL: localhost:5432 (`buynet` / `buynet`)

Наполнить БД демо-данными:

```bash
docker compose exec backend node dist/seed/seed.js
```

Демо-аккаунт после сидирования: `demo@buynet.local` / `demo123`.

## Локальная разработка (без Docker)

```bash
npm --prefix server install
npm --prefix server run build
npm --prefix app install
npm run dev
```

Поднимает API на :3000 (файловая БД `server/buynet.dev.db`, автосид при первом
запуске) и Vite на :5173 с прокси `/api`.

## API

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | Регистрация (email, имя, пароль) |
| POST | `/api/auth/login` | Вход, возвращает JWT |
| GET | `/api/listings` | Поиск: `q`, `categoryId`, `city`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/api/listings/:id` | Карточка объявления |
| GET | `/api/listings/mine` | Мои объявления (JWT) |
| POST | `/api/listings` | Создать (JWT) |
| PATCH | `/api/listings/:id` | Изменить своё (JWT) |
| DELETE | `/api/listings/:id` | Удалить своё (JWT) |
| GET | `/api/categories` | Список категорий |
| GET | `/api/health` | Health-check |

Переменные окружения бэкенда: `DB_TYPE` (`postgres`/`sqljs`), `DB_HOST`,
`DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`.
