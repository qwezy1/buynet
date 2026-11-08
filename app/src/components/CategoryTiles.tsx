import {
  Car,
  House,
  Music,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Wrench,
} from 'lucide-react';
import type { Category } from '@/types';

const ICONS: Record<string, typeof Smartphone> = {
  electronics: Smartphone,
  transport: Car,
  'real-estate': House,
  clothing: Shirt,
  home: Sofa,
  services: Wrench,
  hobby: Music,
  pets: PawPrint,
};

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryTiles({ categories, activeId, onSelect }: Props) {
  if (categories.length === 0) return null;

  return (
    <section aria-label="Категории" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((c) => {
          const Icon = ICONS[c.slug] ?? Sofa;
          const active = activeId === String(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(active ? '' : String(c.id))}
              aria-pressed={active}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active ? 'border-primary bg-primary/5' : 'bg-card'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{c.name}</span>
                {c.count != null && (
                  <span className="block text-xs text-muted-foreground">
                    {c.count} объявл.
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
