import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Screen } from '../App';

interface LoginScreenProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
}

export function LoginScreen({ navigateTo, language, toggleLanguage }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('tan@email.com');
  const [password, setPassword] = useState('••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('questionnaire');
  };

  const texts = {
    ENG: {
      headline: 'Learn to invest in Malaysian stocks.',
      subhead:
        'Practice trading on Bursa Malaysia with RM 10,000 in virtual cash, real brokerage fee calculations, and plain-English financials.',
      loginTitle: 'Sign in',
      registerTitle: 'Create account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      loginButton: 'Continue',
      registerButton: 'Start with RM 10,000',
      noAccount: 'New to JomInvest?',
      hasAccount: 'Already have an account?',
      registerLink: 'Create account',
      loginLink: 'Sign in',
      footnote: 'Educational simulator — no real money at risk.'
    },
    BM: {
      headline: 'Belajar melabur dalam saham Malaysia.',
      subhead:
        'Berlatih dagangan di Bursa Malaysia dengan RM 10,000 tunai maya, kiraan yuran sebenar, dan analisis kewangan mudah.',
      loginTitle: 'Log masuk',
      registerTitle: 'Buka akaun',
      email: 'E-mel',
      password: 'Kata laluan',
      confirmPassword: 'Sahkan kata laluan',
      loginButton: 'Teruskan',
      registerButton: 'Mula dengan RM 10,000',
      noAccount: 'Baharu di JomInvest?',
      hasAccount: 'Sudah mempunyai akaun?',
      registerLink: 'Daftar akaun',
      loginLink: 'Log masuk',
      footnote: 'Simulator pendidikan — tiada wang sebenar digunakan.'
    }
  };

  const t = texts[language];

  const previewStocks = [
    { ticker: 'MAYBANK', name: 'Malayan Banking Berhad', yield: '6.15%', price: '10.54', change: '+0.76%' },
    { ticker: 'TENAGA', name: 'Tenaga Nasional Berhad · Shariah', yield: '3.65%', price: '14.28', change: '+1.28%' },
    { ticker: 'GAMUDA', name: 'Gamuda Berhad · Shariah', yield: '2.10%', price: '9.15', change: '+3.16%' },
    { ticker: 'PBBANK', name: 'Public Bank Berhad', yield: '4.60%', price: '4.56', change: '+0.88%' }
  ];

  return (
    <div className="rh-page">
      {/* Minimal Header */}
      <div className="flex items-center justify-between pb-10">
        <div className="rh-brand">
          <span>JomInvest</span>
        </div>
        <button
          type="button"
          onClick={toggleLanguage}
          className="jom-btn-ghost font-tabular"
        >
          {language === 'ENG' ? 'EN' : 'BM'}
        </button>
      </div>

      <div className="rh-split">
        {/* Left: Value Prop & Live Sample Table */}
        <div className="rh-main space-y-8">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl font-semibold tracking-tight leading-tight">
              {t.headline}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.subhead}
            </p>
          </div>

          <div className="jom-table-wrap">
            <table className="jom-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="text-right">Div Yield</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Today</th>
                </tr>
              </thead>
              <tbody>
                {previewStocks.map(stock => (
                  <tr key={stock.ticker} style={{ cursor: 'default' }}>
                    <td>
                      <div className="font-medium text-sm">{stock.ticker}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {stock.name}
                      </div>
                    </td>
                    <td className="text-right font-tabular text-xs" style={{ color: 'var(--ink-secondary)' }}>
                      {stock.yield}
                    </td>
                    <td className="text-right font-tabular text-sm font-medium">
                      RM {stock.price}
                    </td>
                    <td
                      className="text-right font-tabular text-xs font-medium"
                      style={{ color: 'var(--signal-up)' }}
                    >
                      {stock.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Clean Sign-In Form */}
        <aside className="rh-rail">
          <div className="space-y-5">
            <h2 className="text-base font-semibold">
              {isLogin ? t.loginTitle : t.registerTitle}
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs block" style={{ color: 'var(--ink-secondary)' }}>
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  className="jom-input text-xs"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs block" style={{ color: 'var(--ink-secondary)' }}>
                  {t.password}
                </label>
                <input
                  id="password"
                  type="password"
                  className="jom-input text-xs"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs block" style={{ color: 'var(--ink-secondary)' }}>
                    {t.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="jom-input text-xs"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="jom-btn jom-btn-primary w-full py-2.5">
                <span>{isLogin ? t.loginButton : t.registerButton}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div
              className="pt-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}
            >
              <span>{isLogin ? t.noAccount : t.hasAccount}</span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="rh-link-btn"
                style={{ color: 'var(--ink-primary)' }}
              >
                {isLogin ? t.registerLink : t.loginLink}
              </button>
            </div>

            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {t.footnote}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
