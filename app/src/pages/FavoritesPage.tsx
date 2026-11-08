import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from '@/components/ListingCard';
import { searchListings } from '@/lib/api';
import { useFavorites } from '@/hooks/use-favorites';
import type { Listing } from '@/types';

export default function FavoritesPage() {
  const { ids } = useFavorites();
  const [items, setItems] = useState<Listing[] | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    setItems(null);
    // Порядок: сначала недавно добавленные
    searchListings({ ids: ids.join(','), limit: 50 })
      .then((res) => {
        const byId = new Map(res.items.map((l) => [l.id, l]));
        setItems(ids.map((id) => byId.get(id)).filter(Boolean) as Listing[]);
      })
      .catch(() => setItems([]));
  }, [ids]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Избранное</h1>

      <div className="mt-6">
        {items === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: Math.min(ids.length, 4) || 1 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
            <Heart className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
            <p className="font-display text-xl font-semibold">Пока пусто</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Нажимайте на сердечко в карточке объявления — оно сохранится здесь.
            </p>
            <Button asChild className="mt-2">
              <Link to="/">Смотреть объявления</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
