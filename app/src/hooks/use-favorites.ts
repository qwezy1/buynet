import { useCallback, useEffect, useState } from 'react';
import { addFavorite, getFavoriteIds, getToken, removeFavorite } from '@/lib/api';

const KEY = 'buynet_favorites';

function readLocal(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('buynet-fav'));
}

/**
 * Избранное: для авторизованных — таблица favorites в БД,
 * для гостей — localStorage (до входа в аккаунт).
 */
export function useFavorites() {
  const [ids, setIds] = useState<number[]>(readLocal);

  const reload = useCallback(() => {
    if (getToken()) {
      getFavoriteIds()
        .then(setIds)
        .catch(() => setIds(readLocal()));
    } else {
      setIds(readLocal());
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener('buynet-fav', reload);
    window.addEventListener('buynet-auth', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('buynet-fav', reload);
      window.removeEventListener('buynet-auth', reload);
      window.removeEventListener('storage', reload);
    };
  }, [reload]);

  const toggle = useCallback(
    (id: number) => {
      const isFav = ids.includes(id);
      const next = isFav ? ids.filter((x) => x !== id) : [id, ...ids];
      setIds(next); // оптимистичное обновление
      if (getToken()) {
        (isFav ? removeFavorite(id) : addFavorite(id)).catch(reload);
      } else {
        writeLocal(next);
      }
    },
    [ids, reload],
  );

  const has = useCallback((id: number) => ids.includes(id), [ids]);

  return { ids, toggle, has };
}
