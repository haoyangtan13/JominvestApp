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
      deskKicker: 'Malaysian Investing & Financial Literacy',
      headline: 'Learn to invest on Bursa Malaysia, risk-free.',
      subhead:
        'Explore top Malaysian companies like Maybank, Tenaga Nasional, and Gamuda in plain English. Check Shariah compliance at a glance and practice buying shares with RM 10,000 in virtual cash.',
      stat1Val: '26+ Stocks',
      stat1Label: 'Top Bursa Malaysia companies explained simply',
      stat2Val: 'Shariah Ready',
      stat2Label: 'Clear SC Shariah compliance badges & ratios',
      stat3Val: 'RM 10,000',
      stat3Label: 'Risk-free practice balance to build confidence',
      topBadge: 'Free Practice Simulator',
      portalKicker: 'Welcome to JomINVEST',
      loginTitle: 'Sign in to your account',
      loginDesc: 'Pick up right where you left off with your RM 10,000 practice portfolio and bite-sized lessons.',
      registerTitle: 'Create your free account',
      registerDesc: 'Start with RM 10,000 in virtual cash and discover your personal investing style in 60 seconds.',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      loginButton: 'Continue to Investing Style Quiz',
      registerButton: 'Start Learning with RM 10,000',
      noAccount: 'New to JomINVEST?',
      hasAccount: 'Already have an account?',
      registerLink: 'Create a free account',
      loginLink: 'Sign in',
      footnote: '100% educational practice simulator — no real money at risk. Prices reflect Bursa Malaysia (KLSE) data.'
    },
    BM: {
      deskKicker: 'Pendidikan Pelaburan & Literasi Kewangan Malaysia',
      headline: 'Belajar melabur di Bursa Malaysia, tanpa risiko.',
      subhead:
        'Kenali syarikat utama Malaysia seperti Maybank, Tenaga Nasional, dan Gamuda dalam bahasa mudah. Semak status Patuh Syariah dengan pantas dan berlatih membeli saham menggunakan RM 10,000 tunai maya.',
      stat1Val: '26+ Saham',
      stat1Label: 'Syarikat utama Bursa Malaysia diterangkan secara mudah',
      stat2Val: 'Patuh Syariah',
      stat2Label: 'Label & nisbah saringan Syariah SC yang jelas',
      stat3Val: 'RM 10,000',
      stat3Label: 'Baki latihan bebas risiko untuk membina keyakinan',
      topBadge: 'Simulator Latihan Percuma',
      portalKicker: 'Selamat Datang ke JomINVEST',
      loginTitle: 'Log masuk ke akaun anda',
      loginDesc: 'Teruskan pembelajaran dan urus portfolio latihan RM 10,000 anda.',
      registerTitle: 'Buka akaun percuma anda',
      registerDesc: 'Mulakan dengan RM 10,000 tunai maya dan kenali gaya pelaburan anda dalam 60 saat.',
      email: 'Alamat e-mel',
      password: 'Kata laluan',
      confirmPassword: 'Sahkan kata laluan',
      loginButton: 'Teruskan ke Kuiz Gaya Pelaburan',
      registerButton: 'Mula Belajar dengan RM 10,000',
      noAccount: 'Baharu di JomINVEST?',
      hasAccount: 'Sudah mempunyai akaun?',
      registerLink: 'Daftar akaun percuma',
      loginLink: 'Log masuk',
      footnote: 'Simulator pendidikan 100% — tiada wang sebenar digunakan. Harga berdasarkan data Bursa Malaysia (KLSE).'
    }
  };

  const t = texts[language];

  return (
    <div className="grid lg:grid-cols-2 min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Left Consumer Brand Story Column */}
      <div
        className="p-8 lg:p-12 flex flex-col justify-between"
        style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--ink-inverse)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-2xl tracking-tight">JomINVEST</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
              style={{ borderColor: 'rgba(248, 250, 252, 0.22)', color: 'var(--ink-inverse)' }}
            >
              Bursa Malaysia
            </span>
          </div>
          <span className="text-xs font-medium" style={{ opacity: 0.7 }}>
            Kuala Lumpur · MYR
          </span>
        </div>

        <div className="my-12 space-y-6 max-w-xl">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}
          >
            <span>{t.deskKicker}</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl leading-tight">
            {t.headline}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ opacity: 0.82 }}>
            {t.subhead}
          </p>

          {/* Sample Company Monogram Preview Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <span className="jom-avatar jom-avatar-amber" style={{ width: '28px', height: '28px', fontSize: '0.7rem', borderRadius: '8px' }}>MB</span>
              <span className="text-xs font-medium">Maybank</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <span className="jom-avatar jom-avatar-blue" style={{ width: '28px', height: '28px', fontSize: '0.7rem', borderRadius: '8px' }}>TN</span>
              <span className="text-xs font-medium">Tenaga Nasional</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <span className="jom-avatar jom-avatar-emerald" style={{ width: '28px', height: '28px', fontSize: '0.7rem', borderRadius: '8px' }}>GM</span>
              <span className="text-xs font-medium">Gamuda</span>
            </div>
          </div>
        </div>

        {/* Bottom 3-Highlight Strip */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t"
          style={{ borderColor: 'rgba(248, 250, 252, 0.14)' }}
        >
          <div>
            <div className="font-tabular text-2xl font-bold">{t.stat1Val}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{ opacity: 0.75 }}>
              {t.stat1Label}
            </div>
          </div>
          <div>
            <div className="font-tabular text-2xl font-bold">{t.stat2Val}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{ opacity: 0.75 }}>
              {t.stat2Label}
            </div>
          </div>
          <div>
            <div className="font-tabular text-2xl font-bold">{t.stat3Val}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{ opacity: 0.75 }}>
              {t.stat3Label}
            </div>
          </div>
        </div>
      </div>

      {/* Right Authentication Column */}
      <div
        className="flex flex-col justify-between p-6 sm:p-12"
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        <div className="flex items-center justify-between">
          <span className="jom-tag jom-tag-shariah">{t.topBadge}</span>
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

        <div className="my-auto py-8 flex items-center justify-center">
          <div className="jom-panel p-8 w-full max-w-md space-y-6">
            <div className="space-y-2">
              <div className="jom-kicker">{t.portalKicker}</div>
              <h2 className="font-editorial text-3xl" style={{ color: 'var(--ink-primary)' }}>
                {isLogin ? t.loginTitle : t.registerTitle}
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                {isLogin ? t.loginDesc : t.registerDesc}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="jom-kicker block">
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
                <label htmlFor="password" className="jom-kicker block">
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
                  <label htmlFor="confirmPassword" className="jom-kicker block">
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
          </div>
        </div>

        <div className="text-xs text-center" style={{ color: 'var(--ink-muted)' }}>
          {t.footnote}
        </div>
      </div>
    </div>
  );
}

