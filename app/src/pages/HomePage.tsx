import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListingCard } from '@/components/ListingCard';
import { getCategories, searchListings } from '@/lib/api';
import type { Category, ListingQuery, SearchResult } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
] as const;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Локальное состояние полей (синхронизируется с URL)
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const categoryId = searchParams.get('categoryId') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const patchParams = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query: ListingQuery = {
      q: searchParams.get('q') || undefined,
      categoryId: searchParams.get('categoryId')
        ? Number(searchParams.get('categoryId'))
        : undefined,
      city: searchParams.get('city') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sort: (searchParams.get('sort') as ListingQuery['sort']) || 'newest',
      page,
      limit: 12,
    };
    searchListings(query)
      .then(setResult)
      .catch((err) => setError(err.message ?? 'Не удалось загрузить объявления'))
      .finally(() => setLoading(false));
  }, [searchParams, page]);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    patchParams({ q, city, minPrice, maxPrice, page: '1' });
  };

  const resetFilters = () => {
    setQ('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div>
      {/* Hero + поиск */}
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:pt-16">
          <h1 className="font-display max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Покупайте и продавайте{' '}
            <span className="text-primary">рядом с вами</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            BuyNet — удобная доска объявлений: электроника, транспорт, недвижимость,
            услуги и всё остальное.
          </p>
          <form
            onSubmit={applyFilters}
            className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
            role="search"
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Что ищете? Например, велосипед"
              className="h-12 flex-1 text-base"
              aria-label="Поиск по объявлениям"
            />
            <Button type="submit" size="lg" className="h-12 px-6">
              <Search className="h-4 w-4" aria-hidden="true" />
              Найти
            </Button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Категории">
          <Button
            variant={categoryId === '' ? 'default' : 'outline'}
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() => patchParams({ categoryId: '', page: '1' })}
          >
            Все категории
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={categoryId === String(c.id) ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => patchParams({ categoryId: String(c.id), page: '1' })}
            >
              {c.name}
            </Button>
          ))}
        </div>

        {/* Фильтры */}
        <form
          onSubmit={applyFilters}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4"
        >
          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor="filter-city">Город</Label>
            <Input
              id="filter-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Любой город"
            />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
            <Label htmlFor="filter-min">Цена от</Label>
            <Input
              id="filter-min"
              type="number"
              min={0}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
            <Label htmlFor="filter-max">Цена до</Label>
            <Input
              id="filter-max"
              type="number"
              min={0}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="∞"
            />
          </div>
          <div className="flex w-48 flex-col gap-1.5">
            <Label>Сортировка</Label>
            <Select value={sort} onValueChange={(v) => patchParams({ sort: v, page: '1' })}>
              <SelectTrigger aria-label="Сортировка">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">
              Применить
            </Button>
            <Button type="button" variant="ghost" onClick={resetFilters} aria-label="Сбросить фильтры">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>

        {/* Результаты */}
        <div className="mt-6" aria-live="polite">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
              <p className="font-semibold">Не удалось загрузить объявления</p>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <Button
                variant="secondary"
                onClick={() => patchParams({})}
              >
                Повторить
              </Button>
            </div>
          ) : result && result.items.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Найдено объявлений: {result.total}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {result.pages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-center gap-3"
                  aria-label="Пагинация"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page <= 1}
                    onClick={() => patchParams({ page: String(result.page - 1) })}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Назад
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {result.page} / {result.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page >= result.pages}
                    onClick={() => patchParams({ page: String(result.page + 1) })}
                  >
                    Вперёд
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
              <p className="font-display text-xl font-semibold">Ничего не нашлось</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Попробуйте изменить запрос или сбросить фильтры — или разместите
                первое объявление сами.
              </p>
              <Button variant="secondary" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
