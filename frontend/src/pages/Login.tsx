import { useState } from 'react';
// No react-router-dom needed
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Beef, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({ title: 'Berhasil login', description: `Selamat datang, ${data.user.name}` });
      // Reset navigation and force reload to update auth state
      window.location.href = '/';
    },
    onError: () => {
      toast({ title: 'Login Gagal', description: 'Email atau password salah', variant: 'destructive' });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-3xl border-2 shadow-xl bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Beef size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary font-headline uppercase tracking-tight">AL-ABROR Q</CardTitle>
          <CardDescription className="font-bold text-xs uppercase tracking-widest">Sistem Manajemen Kurban</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email (contoh: ***@****.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 rounded-xl"
              />
            </div>
            <div className="space-y-2 relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (contoh: password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary font-bold uppercase tracking-widest text-white shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Memproses...' : 'Masuk Sistem'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
