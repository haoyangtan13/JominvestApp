import { useState } from 'react';
import { TrendingUp, ShieldCheck, Sparkles, Trophy, ArrowRight } from 'lucide-react';
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
      badge: 'Bursa Malaysia Practice Sandbox',
      heroTitle: 'Learn Investing the Fun, Risk-Free Way.',
      heroDesc: 'Practice buying real Bursa Malaysia stocks with virtual cash, unlock XP milestones, and decode annual reports with AI.',
      feat1: 'Simulated RM portfolio with zero real-money risk',
      feat2: 'Earn XP & level up as you master P/E, dividends & risk',
      feat3: 'AI-powered stock insights & JomRingkas report scanner',
      loginTitle: 'Welcome Back!',
      loginDesc: 'Sign in to continue your investing streak',
      registerTitle: 'Create Free Account',
      registerDesc: 'Join thousands of Malaysian student investors',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Continue to JomINVEST',
      registerButton: 'Start Investing Journey',
      noAccount: "New to JomINVEST?",
      hasAccount: 'Already have an account?',
      registerLink: 'Create an account',
      loginLink: 'Sign in instead',
    },
    BM: {
      appName: 'JomINVEST',
      badge: 'Kotak Pasir Latihan Bursa Malaysia',
      heroTitle: 'Belajar Melabur Dengan Cara Seronok & Tanpa Risiko.',
      heroDesc: 'Berlatih membeli saham sebenar Bursa Malaysia dengan tunai maya, kumpul XP, dan fahami laporan tahunan dengan AI.',
      feat1: 'Portfolio simulasi RM tanpa risiko wang sebenar',
      feat2: 'Kumpul XP & naik tahap sambil kuasai P/E, dividen & risiko',
      feat3: 'Wawasan saham AI & pengimbas laporan JomRingkas',
      loginTitle: 'Selamat Kembali!',
      loginDesc: 'Log masuk untuk sambung perjalanan pelaburan anda',
      registerTitle: 'Buat Akaun Percuma',
      registerDesc: 'Sertai ribuan pelabur pelajar Malaysia',
      email: 'Alamat E-mel',
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      loginButton: 'Teruskan ke JomINVEST',
      registerButton: 'Mulakan Perjalanan Pelaburan',
      noAccount: 'Baru di JomINVEST?',
      hasAccount: 'Sudah mempunyai akaun?',
      registerLink: 'Daftar akaun',
      loginLink: 'Log masuk',
    },
  };

  const t = texts[language];

  return (
    <div className="jomi-auth-page">
      {/* Top Bar */}
      <div className="jomi-between" style={{ maxWidth: '960px', width: '100%', margin: '0 auto' }}>
        <div className="jomi-cluster">
          <div className="jomi-brand-mark" aria-hidden="true">
            <TrendingUp size={22} strokeWidth={2.6} />
          </div>
          <span className="jomi-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {t.appName}
          </span>
        </div>

        <button type="button" onClick={toggleLanguage} className="jomi-btn jomi-btn-outline jomi-btn-sm">
          {language === 'ENG' ? 'ENG / BM' : 'BM / ENG'}
        </button>
      </div>

      {/* Split Center Content */}
      <div className="jomi-auth-center">
        <div className="jomi-auth-split">
          {/* Left Value Pitch */}
          <div className="jomi-stack-md">
            <span className="jomi-pill-gain" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}>
              <Sparkles size={14} />
              {t.badge}
            </span>

            <h1 className="jomi-display" style={{ fontSize: '2.35rem', fontWeight: 700, lineHeight: 1.15 }}>
              {t.heroTitle}
            </h1>

            <p className="jomi-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>
              {t.heroDesc}
            </p>

            <div className="jomi-stack-sm" style={{ marginTop: '0.25rem' }}>
              {[
                { icon: ShieldCheck, text: t.feat1, bg: 'var(--jomi-emerald-soft)', border: 'var(--jomi-emerald-border)', color: '#047857' },
                { icon: Trophy, text: t.feat2, bg: 'var(--jomi-gold-soft)', border: 'var(--jomi-gold-border)', color: '#b45309' },
                { icon: Sparkles, text: t.feat3, bg: 'var(--jomi-emerald-soft)', border: 'var(--jomi-emerald-border)', color: '#0d9488' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="jomi-cluster" style={{ gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: '0.75rem',
                        backgroundColor: item.bg,
                        border: `1.5px solid ${item.border}`,
                        color: item.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={17} />
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="jomi-card jomi-card-pad" style={{ padding: '1.85rem' }}>
            <div className="jomi-stack-xs" style={{ marginBottom: '1.35rem' }}>
              <h2 className="jomi-display jomi-title-lg">
                {isLogin ? t.loginTitle : t.registerTitle}
              </h2>
              <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
                {isLogin ? t.loginDesc : t.registerDesc}
              </p>
            </div>

            <form onSubmit={handleLogin} className="jomi-stack-md">
              <div>
                <label htmlFor="email" className="jomi-label">{t.email}</label>
                <input
                  id="email"
                  type="email"
                  className="jomi-input"
                  placeholder={language === 'ENG' ? 'student@university.edu.my' : 'pelajar@universiti.edu.my'}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="jomi-label">{t.password}</label>
                <input
                  id="password"
                  type="password"
                  className="jomi-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirm-password" className="jomi-label">{t.confirmPassword}</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="jomi-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <button type="submit" className="jomi-btn jomi-btn-primary jomi-btn-lg jomi-btn-full">
                <span>{isLogin ? t.loginButton : t.registerButton}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div
              style={{
                marginTop: '1.35rem',
                paddingTop: '1.1rem',
                borderTop: '1.5px solid var(--jomi-border)',
                textAlign: 'center',
              }}
              className="jomi-text-sm jomi-muted"
            >
              <span style={{ fontWeight: 600 }}>{isLogin ? t.noAccount : t.hasAccount} </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--jomi-primary)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                {isLogin ? t.registerLink : t.loginLink}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
