import { Link } from 'react-router';
import { Eye, Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/format';
import { useFavorites } from '@/hooks/use-favorites';
import type { Listing } from '@/types';

export function ListingCard({ listing }: { listing: Listing }) {
  const { has, toggle } = useFavorites();
  const fav = has(listing.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring">
      <Link
        to={`/listing/${listing.id}`}
        className="flex flex-1 flex-col focus-visible:outline-none"
        aria-label={listing.title}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-display text-5xl font-semibold text-primary/25"
              aria-hidden="true"
            >
              {listing.title.charAt(0)}
            </div>
          )}
          {listing.category && (
            <Badge variant="secondary" className="absolute left-3 top-3 bg-background/90 backdrop-blur-sm">
              {listing.category.name}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div className="price-text text-lg text-primary">{formatPrice(listing.price)}</div>
          <h3 className="line-clamp-2 font-semibold leading-snug">{listing.title}</h3>
          <div className="mt-auto flex items-center justify-between pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {listing.city}
            </span>
            <span className="flex items-center gap-3">
              <span
                className="flex items-center gap-1"
                title={`Просмотров: ${listing.views}`}
                aria-label={`Просмотров: ${listing.views}`}
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {listing.views}
              </span>
              <span>{formatDate(listing.createdAt)}</span>
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle(listing.id)}
        aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
        aria-pressed={fav}
        className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Heart
          className={`h-4.5 w-4.5 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
