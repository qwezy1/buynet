import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingForm } from '@/components/ListingForm';
import { getListing, updateListing } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Listing } from '@/types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!id) return;
    getListing(Number(id))
      .then((l) => {
        // Редактировать может только автор (на бэкенде — тоже проверка)
        if (!user || l.author?.id !== user.id) {
          navigate('/', { replace: true });
          return;
        }
        setListing(l);
      })
      .catch((err) => setLoadError(err.message ?? 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, user, navigate]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/my">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          К моим объявлениям
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-semibold">Редактирование</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Изменения сразу видны всем посетителям.
      </p>

      {loading ? (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : loadError || !listing ? (
        <div className="mt-6 rounded-2xl border bg-card py-16 text-center">
          <p className="font-semibold">{loadError ?? 'Объявление не найдено'}</p>
          <Button variant="secondary" className="mt-3" asChild>
            <Link to="/my">К моим объявлениям</Link>
          </Button>
        </div>
      ) : (
        <ListingForm
          initial={listing}
          submitting={submitting}
          error={error}
          submitLabel="Сохранить изменения"
          onSubmit={async (payload) => {
            setSubmitting(true);
            setError(null);
            try {
              const updated = await updateListing(listing.id, payload);
              toast.success('Объявление обновлено');
              navigate(`/listing/${updated.id}`);
            } catch (err: any) {
              setError(err.message ?? 'Не удалось сохранить');
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </div>
  );
}
