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
      deskKicker: 'MALAYSIAN EQUITY RESEARCH & EXECUTION DESK',
      headline: 'Disciplined equity research & practice for Bursa Malaysia.',
      subhead:
        'Analyze FBM KLCI constituents, inspect Securities Commission SAC Shariah ratios, and execute simulated board-lot orders with real Bursa Malaysia fee schedules.',
      stat1Val: '26+',
      stat1Label: 'FBM KLCI & Mid-Cap Securities',
      stat2Val: 'SAC',
      stat2Label: 'SAC Shariah Screening',
      stat3Val: 'RM 10,000',
      stat3Label: 'RM 10,000 Practice Capital',
      portalKicker: 'WORKSPACE ACCESS · KLSE',
      loginTitle: 'Sign in to research desk',
      loginDesc: 'Enter your credentials to access your practice mandate and Bursa screener.',
      registerTitle: 'Open a practice mandate',
      registerDesc: 'Initialize a RM 10,000 simulated account calibrated to your risk profile.',
      email: 'Institutional or Personal Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Continue to Mandate Assessment',
      registerButton: 'Initialize Mandate & Continue',
      noAccount: 'New to JomINVEST?',
      hasAccount: 'Already registered?',
      registerLink: 'Create practice account',
      loginLink: 'Sign in',
      footnote: 'Simulated trading environment. Market data delayed 15 minutes via Bursa Malaysia (KLSE).'
    },
    BM: {
      deskKicker: 'MEJA PENYELIDIKAN & SIMULASI EKUITI MALAYSIA',
      headline: 'Penyelidikan & latihan ekuiti berdisiplin untuk Bursa Malaysia.',
      subhead:
        'Analisis komponen FBM KLCI, semak nisbah Patuh Syariah MPS Suruhanjaya Sekuriti, dan laksanakan pesanan simulasi dengan jadual yuran sebenar Bursa Malaysia.',
      stat1Val: '26+',
      stat1Label: 'Sekuriti FBM KLCI & Modal Sederhana',
      stat2Val: 'MPS',
      stat2Label: 'Saringan Syariah MPS SC',
      stat3Val: 'RM 10,000',
      stat3Label: 'Modal Latihan RM 10,000',
      portalKicker: 'AKSES RUANG KERJA · KLSE',
      loginTitle: 'Log masuk ke meja penyelidikan',
      loginDesc: 'Masukkan kelayakan anda untuk mengakses mandat latihan dan saringan Bursa.',
      registerTitle: 'Buka mandat latihan baharu',
      registerDesc: 'Mulakan akaun simulasi RM 10,000 yang disesuaikan dengan profil risiko anda.',
      email: 'E-mel Institusi atau Peribadi',
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      loginButton: 'Teruskan ke Penilaian Mandat',
      registerButton: 'Mulakan Mandat & Teruskan',
      noAccount: 'Baharu di JomINVEST?',
      hasAccount: 'Sudah mempunyai akaun?',
      registerLink: 'Buka akaun latihan',
      loginLink: 'Log masuk',
      footnote: 'Persekitaran dagangan simulasi. Data pasaran lewat 15 minit melalui Bursa Malaysia (KLSE).'
    }
  };

  const t = texts[language];

  return (
    <div className="grid lg:grid-cols-2 min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Left Architectural Brand Column */}
      <div
        className="p-8 lg:p-12 flex flex-col justify-between"
        style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--ink-inverse)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-2xl tracking-tight">JomINVEST</span>
            <span
              className="font-tabular text-xs px-2 py-0.5 rounded border"
              style={{ borderColor: 'rgba(246, 245, 240, 0.22)', color: 'var(--ink-inverse)' }}
            >
              JomINVEST · KLSE
            </span>
          </div>
          <span className="font-tabular text-xs" style={{ opacity: 0.6 }}>
            MYR · KUALA LUMPUR
          </span>
        </div>

        <div className="my-12 space-y-6 max-w-xl">
          <div
            className="font-tabular text-xs uppercase tracking-wider"
            style={{ opacity: 0.65, letterSpacing: '0.08em' }}
          >
            {t.deskKicker}
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl leading-tight">
            {t.headline}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ opacity: 0.76 }}>
            {t.subhead}
          </p>
        </div>

        {/* Bottom 3-Metric Institutional Strip */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t"
          style={{ borderColor: 'rgba(246, 245, 240, 0.16)' }}
        >
          <div>
            <div className="font-tabular text-2xl font-semibold">{t.stat1Val}</div>
            <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
              {t.stat1Label}
            </div>
          </div>
          <div>
            <div className="font-tabular text-2xl font-semibold">{t.stat2Val}</div>
            <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
              {t.stat2Label}
            </div>
          </div>
          <div>
            <div className="font-tabular text-2xl font-semibold">{t.stat3Val}</div>
            <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
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
          <div className="jom-kicker">BURSA MALAYSIA SIMULATOR</div>
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
                  placeholder={language === 'ENG' ? 'analyst@jominvest.my' : 'penganalisis@jominvest.my'}
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
                style={{ color: 'var(--ink-primary)' }}
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
