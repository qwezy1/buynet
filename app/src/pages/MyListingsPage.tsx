import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteListing, getMyListings } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/format';
import type { Listing } from '@/types';

export default function MyListingsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getMyListings()
      .then(setItems)
      .catch((err) => setError(err.message ?? 'Не удалось загрузить'));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onDelete = async (id: number) => {
    try {
      await deleteListing(id);
      setItems((prev) => prev?.filter((l) => l.id !== id) ?? null);
      toast.success('Объявление удалено');
    } catch (err: any) {
      toast.error(err.message ?? 'Не удалось удалить');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Мои объявления</h1>
        <Button asChild>
          <Link to="/create">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Разместить ещё
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {items === null && !error ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-card py-16 text-center">
            <p className="font-semibold">{error}</p>
            <Button variant="secondary" className="mt-3" onClick={load}>
              Повторить
            </Button>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
            <p className="font-display text-xl font-semibold">Пока пусто</p>
            <p className="text-sm text-muted-foreground">
              Разместите первое объявление — это займёт минуту.
            </p>
            <Button asChild className="mt-2">
              <Link to="/create">Создать объявление</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <Link
                  to={`/listing/${listing.id}`}
                  className="flex flex-1 items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                >
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-xl text-primary/25">
                        {listing.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{listing.title}</p>
                    <p className="price-text text-primary">{formatPrice(listing.price)}</p>
                  </div>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label={`Удалить «${listing.title}»`}>
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      <span className="sm:hidden">Удалить</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                      <AlertDialogDescription>
                        «{listing.title}» будет удалено безвозвратно.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(listing.id)}>
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
