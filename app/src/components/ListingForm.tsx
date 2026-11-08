import { useEffect, useState } from 'react';
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
import { getCategories } from '@/lib/api';
import type { Category, CreateListingPayload, Listing } from '@/types';

interface Props {
  /** Заполнение формы при редактировании */
  initial?: Listing;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (payload: CreateListingPayload) => void;
}

export function ListingForm({ initial, submitting, error, submitLabel, onSubmit }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [categoryId, setCategoryId] = useState(
    initial?.category ? String(initial.category.id) : '',
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const priceNum = Number(price);
    if (!categoryId) {
      setLocalError('Выберите категорию');
      return;
    }
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setLocalError('Укажите корректную цену (целое число от 0)');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      city: city.trim(),
      categoryId: Number(categoryId),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-2xl border bg-card p-6">
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

      {shownError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {shownError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Подождите…' : submitLabel}
      </Button>
    </form>
  );
}
