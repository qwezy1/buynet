import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Calendar, MapPin, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getListing } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import type { Listing } from '@/types';

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListing(Number(id))
      .then(setListing)
      .catch((err) => setError(err.message ?? 'Не удалось загрузить объявление'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ко всем объявлениям
        </Link>
      </Button>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : error || !listing ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
          <p className="font-semibold">{error ?? 'Объявление не найдено'}</p>
          <Button variant="secondary" asChild>
            <Link to="/">На главную</Link>
          </Button>
        </div>
      ) : (
        <article className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border bg-muted">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex aspect-[4/3] items-center justify-center font-display text-8xl font-semibold text-primary/25"
                aria-hidden="true"
              >
                {listing.title.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              {listing.category && (
                <Badge variant="secondary" className="mb-2">
                  {listing.category.name}
                </Badge>
              )}
              <h1 className="font-display text-2xl font-semibold leading-tight">
                {listing.title}
              </h1>
            </div>
            <div className="price-text text-3xl text-primary">
              {formatPrice(listing.price)}
            </div>

            <dl className="flex flex-col gap-2 rounded-2xl border bg-card p-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <dt className="sr-only">Город</dt>
                <dd>{listing.city}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <dt className="sr-only">Дата публикации</dt>
                <dd>{formatDate(listing.createdAt)}</dd>
              </div>
              {listing.author && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <dt className="sr-only">Продавец</dt>
                  <dd>{listing.author.name}</dd>
                </div>
              )}
            </dl>

            <div>
              <h2 className="mb-1 font-semibold">Описание</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {listing.description}
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
