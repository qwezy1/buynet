import { Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { SiteHeader } from '@/components/SiteHeader';
import HomePage from '@/pages/HomePage';
import ListingPage from '@/pages/ListingPage';
import CreateListingPage from '@/pages/CreateListingPage';
import AuthPage from '@/pages/AuthPage';
import MyListingsPage from '@/pages/MyListingsPage';

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/create" element={<CreateListingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/my" element={<MyListingsPage />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                <p className="font-display text-4xl font-semibold">404</p>
                <p className="mt-2 text-muted-foreground">Такой страницы нет.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row">
          <span>BuyNet — доска объявлений</span>
          <span>NestJS · PostgreSQL · React · Docker</span>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
