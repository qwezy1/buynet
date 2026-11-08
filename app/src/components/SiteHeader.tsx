import { Link, useNavigate } from 'react-router';
import { Heart, LogOut, Plus, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="BuyNet — на главную">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="31" height="31" rx="9" fill="hsl(168 60% 24%)" />
        <path
          d="M11 23.5V10.5h4.6c2.2 0 3.8 1.2 3.8 3.2 0 1.4-.8 2.4-2.1 2.8 1.7.4 2.7 1.6 2.7 3.2 0 2.2-1.7 3.8-4.1 3.8H11Zm2.4-7.6h1.9c1.1 0 1.8-.7 1.8-1.7s-.7-1.6-1.8-1.6h-1.9v3.3Zm0 5.5h2.2c1.2 0 1.9-.7 1.9-1.8 0-1-.7-1.8-1.9-1.8h-2.2v3.6Z"
          fill="hsl(45 30% 97%)"
        />
        <circle cx="24.5" cy="22" r="2.6" fill="hsl(36 90% 55%)" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
        BuyNet
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { ids: favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="relative">
            <Link to="/favorites" aria-label="Избранное">
              <Heart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Избранное</span>
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {favorites.length}
                </span>
              )}
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/my">Мои объявления</Link>
              </Button>
              <span className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                {user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                aria-label="Выйти из аккаунта"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Войти</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link to="/create">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Разместить объявление</span>
              <span className="sm:hidden">Создать</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
