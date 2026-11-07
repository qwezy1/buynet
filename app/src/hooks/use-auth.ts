import { useCallback, useEffect, useState } from 'react';
import { clearAuth, getStoredUser, getToken } from '@/lib/api';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    getToken() ? getStoredUser() : null,
  );

  useEffect(() => {
    const sync = () => setUser(getToken() ? getStoredUser() : null);
    window.addEventListener('buynet-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('buynet-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const logout = useCallback(() => clearAuth(), []);

  return { user, isAuthenticated: !!user, logout };
}
