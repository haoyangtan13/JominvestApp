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
      headline: 'Invest with confidence, risk-free.',
      subhead:
        'Explore Malaysian companies like Maybank, Tenaga Nasional, and Gamuda in plain English. Practice buying shares with RM 10,000 in virtual cash.',
      loginTitle: 'Sign in to JomINVEST',
      loginDesc: 'Pick up right where you left off with your RM 10,000 practice portfolio.',
      registerTitle: 'Create your free account',
      registerDesc: 'Start with RM 10,000 in virtual cash and discover your investing style in 60 seconds.',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      loginButton: 'Continue',
      registerButton: 'Start with RM 10,000',
      noAccount: 'New to JomINVEST?',
      hasAccount: 'Already have an account?',
      registerLink: 'Create account',
      loginLink: 'Sign in',
      footnote: '100% educational practice simulator — no real money at risk.'
    },
    BM: {
      headline: 'Belajar melabur dengan yakin, tanpa risiko.',
      subhead:
        'Kenali syarikat utama seperti Maybank, Tenaga Nasional, dan Gamuda dalam bahasa mudah. Berlatih membeli saham dengan RM 10,000 tunai maya.',
      loginTitle: 'Log masuk ke JomINVEST',
      loginDesc: 'Teruskan pembelajaran dan urus portfolio latihan RM 10,000 anda.',
      registerTitle: 'Buka akaun percuma anda',
      registerDesc: 'Mulakan dengan RM 10,000 tunai maya dan kenali gaya pelaburan anda dalam 60 saat.',
      email: 'Alamat e-mel',
      password: 'Kata laluan',
      confirmPassword: 'Sahkan kata laluan',
      loginButton: 'Teruskan',
      registerButton: 'Mula dengan RM 10,000',
      noAccount: 'Baharu di JomINVEST?',
      hasAccount: 'Sudah mempunyai akaun?',
      registerLink: 'Daftar akaun',
      loginLink: 'Log masuk',
      footnote: 'Simulator pendidikan 100% — tiada wang sebenar digunakan.'
    }
  };

  const t = texts[language];

  const previewStocks = [
    { initials: 'MB', color: 'jom-avatar-amber', name: 'Maybank', ticker: 'MAYBANK · Shariah', price: 'RM 10.24', change: '+0.79%' },
    { initials: 'TN', color: 'jom-avatar-blue', name: 'Tenaga Nasional', ticker: 'TENAGA · Shariah', price: 'RM 14.08', change: '+1.44%' },
    { initials: 'GM', color: 'jom-avatar-emerald', name: 'Gamuda', ticker: 'GAMUDA · Shariah', price: 'RM 8.95', change: '+2.17%' }
  ];

  return (
    <div className="rh-page">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-5">
        <div className="rh-brand">
          <span className="rh-brand-dot" />
          <span>JomINVEST</span>
        </div>
        <div className="jom-segmented">
          <button
            type="button"
            onClick={() => language !== 'ENG' && toggleLanguage()}
            className={language === 'ENG' ? 'active' : ''}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => language !== 'BM' && toggleLanguage()}
            className={language === 'BM' ? 'active' : ''}
          >
            BM
          </button>
        </div>
      </div>

      <div className="rh-split">
        {/* Left: Clean Value Proposition & Sample Stock List */}
        <div className="rh-main space-y-6">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--ink-primary)' }}>
              {t.headline}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              {t.subhead}
            </p>
          </div>

          <div className="rh-stock-list">
            {previewStocks.map(stock => (
              <div key={stock.name} className="rh-stock-row">
                <div className="flex items-center gap-3">
                  <div className={`jom-avatar ${stock.color}`}>{stock.initials}</div>
                  <div>
                    <div className="font-semibold text-sm">{stock.name}</div>
                    <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {stock.ticker}
                    </div>
                  </div>
                </div>
                <div className="text-right font-tabular">
                  <div className="font-semibold text-sm">{stock.price}</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--signal-up)' }}>
                    {stock.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Clean Authentication Card */}
        <aside className="rh-rail">
          <div className="rh-card space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold" style={{ color: 'var(--ink-primary)' }}>
                {isLogin ? t.loginTitle : t.registerTitle}
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                {isLogin ? t.loginDesc : t.registerDesc}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold block" style={{ color: 'var(--ink-secondary)' }}>
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  className="jom-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold block" style={{ color: 'var(--ink-secondary)' }}>
                  {t.password}
                </label>
                <input
                  id="password"
                  type="password"
                  className="jom-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold block" style={{ color: 'var(--ink-secondary)' }}>
                    {t.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="jom-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="jom-btn jom-btn-primary w-full py-2.5">
                  <span>{isLogin ? t.loginButton : t.registerButton}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            <div
              className="pt-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}
            >
              <span>{isLogin ? t.noAccount : t.hasAccount}</span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold underline cursor-pointer"
                style={{ color: 'var(--accent-brand)' }}
              >
                {isLogin ? t.registerLink : t.loginLink}
              </button>
            </div>

            <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
              {t.footnote}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
