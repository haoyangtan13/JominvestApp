import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface LoginScreenProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
}

export function LoginScreen({ navigateTo, language, toggleLanguage }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('questionnaire');
  };

  const texts = {
    ENG: {
      appName: 'JomINVEST',
      tagline: 'Start Your Investment Journey',
      loginTitle: 'Welcome Back',
      loginDesc: 'Enter your credentials to access your account',
      registerTitle: 'Create Account',
      registerDesc: 'Join thousands of smart investors',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Login',
      registerButton: 'Register',
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      registerLink: 'Register',
      loginLink: 'Login',
    },
    BM: {
      appName: 'JomINVEST',
      tagline: 'Mulakan Perjalanan Pelaburan Anda',
      loginTitle: 'Selamat Kembali',
      loginDesc: 'Masukkan kelayakan anda untuk mengakses akaun',
      registerTitle: 'Buat Akaun',
      registerDesc: 'Sertai beribu-ribu pelabur pintar',
      email: 'E-mel',
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      loginButton: 'Log Masuk',
      registerButton: 'Daftar',
      noAccount: "Tidak mempunyai akaun?",
      hasAccount: "Sudah mempunyai akaun?",
      registerLink: 'Daftar',
      loginLink: 'Log Masuk',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 px-3 py-1 text-sm bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        ENG / BM
      </button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <TrendingUp size={32} strokeWidth={2.5} />
            <h1 className="text-3xl text-green-600">{t.appName}</h1>
          </div>
          <p className="text-sm text-gray-600">{t.tagline}</p>
        </CardHeader>

        <CardContent>
          <CardTitle className="mb-2">{isLogin ? t.loginTitle : t.registerTitle}</CardTitle>
          <CardDescription className="mb-6">{isLogin ? t.loginDesc : t.registerDesc}</CardDescription>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={language === 'ENG' ? 'your@email.com' : 'anda@email.com'}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              {isLogin ? t.loginButton : t.registerButton}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:underline"
            >
              {isLogin ? t.registerLink : t.loginLink}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
