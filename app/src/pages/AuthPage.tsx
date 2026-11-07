import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, register, saveAuth } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/SiteHeader';
import { useEffect } from 'react';

function AuthForm({
  mode,
}: {
  mode: 'login' | 'register';
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register(email.trim(), name.trim(), password);
      saveAuth(auth);
      toast.success(
        mode === 'login' ? `С возвращением, ${auth.user.name}!` : 'Аккаунт создан',
      );
      navigate('/');
    } catch (err: any) {
      setError(err.message ?? 'Что-то пошло не так');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-4">
      {mode === 'register' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${mode}-name`}>Имя</Label>
          <Input
            id={`${mode}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${mode}-password`}>Пароль</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
          required
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting
          ? 'Подождите…'
          : mode === 'login'
            ? 'Войти'
            : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Logo />
      <h1 className="font-display mt-6 text-2xl font-semibold">
        Добро пожаловать
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Войдите или создайте аккаунт, чтобы размещать объявления.
      </p>

      <Tabs defaultValue="login" className="mt-6 w-full rounded-2xl border bg-card p-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <AuthForm mode="login" />
        </TabsContent>
        <TabsContent value="register">
          <AuthForm mode="register" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
