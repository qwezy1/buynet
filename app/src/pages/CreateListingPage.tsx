import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createListing, getCategories } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Category } from '@/types';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setError('Укажите корректную цену (целое число от 0)');
      return;
    }

    setSubmitting(true);
    try {
      const listing = await createListing({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        city: city.trim(),
        categoryId: Number(categoryId),
        imageUrl: imageUrl.trim() || undefined,
      });
      toast.success('Объявление опубликовано');
      navigate(`/listing/${listing.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Не удалось опубликовать объявление');
    } finally {
      setSubmitting(false);
    }
  };

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

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5 rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Заголовок *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Продаю велосипед"
            required
            minLength={3}
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Описание *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Состояние, комплектация, причина продажи…"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Цена, ₽ *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Город *</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва"
              required
              maxLength={80}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Категория *</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger aria-label="Категория">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="imageUrl">Ссылка на фото</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://… (необязательно)"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Публикую…' : 'Опубликовать объявление'}
        </Button>
      </form>
    </div>
  );
}
