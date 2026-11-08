import { useEffect, useState } from 'react';

const KEY = 'buynet_recent';
const MAX = 8;

function read(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

/** Записать просмотр объявления (самое свежее — первым). */
export function recordView(id: number) {
  const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('buynet-recent'));
}

export function useRecent(): number[] {
  const [ids, setIds] = useState<number[]>(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener('buynet-recent', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('buynet-recent', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return ids;
}
