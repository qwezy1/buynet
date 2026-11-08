import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ListingForm } from '@/components/ListingForm';
import { createListing } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          На главную
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-semibold">Новое объявление</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заполните поля — объявление сразу появится в поиске.
      </p>

      <ListingForm
        submitting={submitting}
        error={error}
        submitLabel="Опубликовать объявление"
        onSubmit={async (payload) => {
          setSubmitting(true);
          setError(null);
          try {
            const listing = await createListing(payload);
            toast.success('Объявление опубликовано');
            navigate(`/listing/${listing.id}`);
          } catch (err: any) {
            setError(err.message ?? 'Не удалось опубликовать объявление');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
