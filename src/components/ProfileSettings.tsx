import { useState } from 'react';
import { Switch } from './ui/switch';
import { Edit, Trophy, Lock, CheckCircle2, Save, RotateCcw, LogOut, Trash2 } from 'lucide-react';
import type { Screen } from '../App';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  userProfile: string;
  language: 'ENG' | 'BM';
  toggleLanguage: () => void;
  userXP: number;
  userLevel: number;
  learnedCount?: number;
  completedLessonsCount?: number;
  onResetAccount?: () => void;
}

export function ProfileSettings({
  navigateTo,
  userProfile,
  language,
  toggleLanguage,
  userXP,
  userLevel,
  learnedCount = 0,
  completedLessonsCount = 0,
  onResetAccount,
}: ProfileSettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState('Tan Hao Yang');
  const [email, setEmail] = useState('tan@email.com');

  const texts = {
    ENG: {
      title: 'Profile & Journey',
      subtitle: 'Track your XP milestones, badges, and sandbox account settings',
      profileCard: 'Student Profile',
      edit: 'Edit Profile',
      save: 'Save Changes',
      retakeQuiz: 'Retake Persona Quiz',
      learningJourney: 'XP & Level Progress',
      level: 'Level',
      achievements: 'Milestone Badges',
      settings: 'Preferences & Sandbox',
      notifications: 'Price & Streak Alerts',
      language: 'App Language',
      signOut: 'Back to Login',
      resetSandbox: 'Reset Virtual RM 10,000 Account',
      confirmResetBtn: 'Confirm Reset to RM 10,000',
      cancel: 'Cancel',
      unlocked: 'Unlocked',
      locked: 'Locked',
    },
    BM: {
      title: 'Profil & Perjalanan',
      subtitle: 'Jejaki XP, lencana pencapaian, dan tetapan kotak pasir anda',
      profileCard: 'Profil Pelajar',
      edit: 'Edit Profil',
      save: 'Simpan',
      retakeQuiz: 'Ambil Semula Kuiz Persona',
      learningJourney: 'Kemajuan XP & Tahap',
      level: 'Tahap',
      achievements: 'Lencana Pencapaian',
      settings: 'Tetapan & Kotak Pasir',
      notifications: 'Makluman Harga & Rentetan',
      language: 'Bahasa Aplikasi',
      signOut: 'Kembali ke Log Masuk',
      resetSandbox: 'Tetapkan Semula Akaun RM 10,000',
      confirmResetBtn: 'Sahkan Tetapan Semula',
      cancel: 'Batal',
      unlocked: 'Dibuka',
      locked: 'Terkunci',
    },
  };

  const t = texts[language];

  const xpForNextLevel = 100;
  const safeXP = Number(userXP) || 0;
  const safeLevel = Number(userLevel) || 1;
  const currentLevelXP = safeXP % xpForNextLevel;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

  const achievements = [
    {
      id: 'first-trade',
      titleEng: 'First Simulated Trade',
      titleBm: 'Dagangan Simulasi Pertama',
      descEng: 'Executed your first Bursa practice trade',
      descBm: 'Membuat dagangan latihan pertama',
      unlocked: safeXP >= 50,
    },
    {
      id: 'quiz-scholar',
      titleEng: 'Learn Hub Scholar',
      titleBm: 'Sarjana Hab Ilmu',
      descEng: 'Passed at least 1 lesson quiz in Learn Hub',
      descBm: 'Lulus sekurang-kurangnya 1 kuiz pelajaran',
      unlocked: completedLessonsCount >= 1,
    },
    {
      id: 'learned-3',
      titleEng: 'Learned 3 Stock Terms',
      titleBm: 'Belajar 3 Istilah Saham',
      descEng: 'Tapped 3 metrics in Stock Details',
      descBm: 'Belajar 3 metrik dalam Butiran Saham',
      unlocked: learnedCount >= 3,
    },
  ];

  return (
    <div className="jomi-stack-lg">
      <div className="jomi-stack-xs">
        <h2 className="jomi-display jomi-title-xl">{t.title}</h2>
        <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{t.subtitle}</p>
      </div>

      <div className="jomi-grid-2">
        {/* 1. Profile Identity Card */}
        <div className="jomi-card jomi-card-pad jomi-stack-md">
          <div className="jomi-between">
            <h3 className="jomi-display jomi-title-md">{t.profileCard}</h3>
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save size={14} /> : <Edit size={14} />}
              <span>{isEditing ? t.save : t.edit}</span>
            </button>
          </div>

          <div className="jomi-cluster" style={{ gap: '1rem' }}>
            <div
              className="jomi-display"
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '1.15rem',
                background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                color: '#ffffff',
                fontSize: '1.35rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 0 0 var(--jomi-emerald-dark)',
                flexShrink: 0,
              }}
            >
              TH
            </div>
            <div style={{ flex: 1 }} className="jomi-stack-xs">
              {isEditing ? (
                <div className="jomi-stack-xs">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="jomi-input"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="jomi-input"
                  />
                </div>
              ) : (
                <>
                  <p className="jomi-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{name}</p>
                  <p className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>{email}</p>
                  <span className="jomi-pill-gain" style={{ marginTop: '0.2rem' }}>
                    {userProfile || 'Jom-Explorer (Aggressive)'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => navigateTo('questionnaire')}
            >
              <RotateCcw size={14} />
              <span>{t.retakeQuiz}</span>
            </button>
          </div>
        </div>

        {/* 2. XP & Level Journey Card */}
        <div className="jomi-card-gold jomi-stack-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="jomi-between">
            <div>
              <span className="jomi-cluster" style={{ fontWeight: 800, color: 'var(--jomi-gold-ink)' }}>
                <Trophy size={19} color="#b45309" />
                <span className="jomi-display jomi-title-md">{t.learningJourney}</span>
              </span>
              <p className="jomi-text-sm" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 700, marginTop: '0.2rem' }}>
                {t.level} {safeLevel}
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid var(--jomi-gold-border)',
                borderRadius: '0.9rem',
                padding: '0.45rem 0.9rem',
                textAlign: 'center',
              }}
            >
              <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>Total XP</p>
              <p className="jomi-display jomi-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b45309' }}>
                {safeXP}
              </p>
            </div>
          </div>

          <div className="jomi-stack-xs">
            <div className="jomi-between jomi-text-xs" style={{ fontWeight: 800, color: 'var(--jomi-gold-ink)' }}>
              <span>{t.level} {safeLevel + 1}</span>
              <span className="jomi-nums">{currentLevelXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="jomi-progress-track" style={{ backgroundColor: '#ffffff', borderColor: 'var(--jomi-gold-border)' }}>
              <div className="jomi-progress-fill-gold" style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="jomi-text-xs" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 700, marginTop: '0.25rem' }}>
              {language === 'ENG'
                ? 'Tip: Buy stocks (+50 XP), pass Learn Hub quizzes (+25 XP), or tap metrics (+10 XP)!'
                : 'Tip: Beli saham (+50 XP), lulus kuiz Hab Ilmu (+25 XP), atau ketik metrik (+10 XP)!'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Achievements */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <h3 className="jomi-display jomi-title-md">{t.achievements}</h3>
        <div className="jomi-grid-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={a.unlocked ? 'jomi-card-soft jomi-stack-xs' : 'jomi-row jomi-stack-xs'}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'default',
                opacity: a.unlocked ? 1 : 0.72,
              }}
            >
              <div className="jomi-between" style={{ width: '100%' }}>
                {a.unlocked ? (
                  <CheckCircle2 size={20} color="#047857" />
                ) : (
                  <Lock size={18} color="#527972" />
                )}
                <span className={a.unlocked ? 'jomi-pill-gain' : 'jomi-pill-sector'}>
                  {a.unlocked ? t.unlocked : t.locked}
                </span>
              </div>
              <h4 className="jomi-display" style={{ fontSize: '1rem', fontWeight: 700 }}>
                {language === 'ENG' ? a.titleEng : a.titleBm}
              </h4>
              <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>
                {language === 'ENG' ? a.descEng : a.descBm}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Preferences & Sandbox Reset */}
      <div className="jomi-card jomi-card-pad jomi-stack-md">
        <h3 className="jomi-display jomi-title-md">{t.settings}</h3>

        <div className="jomi-stack-sm">
          <div className="jomi-row" style={{ cursor: 'default' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.notifications}</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="jomi-row" style={{ cursor: 'default' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.language}</span>
            <button type="button" className="jomi-btn jomi-btn-outline jomi-btn-sm" onClick={toggleLanguage}>
              {language === 'ENG' ? 'English (ENG)' : 'Bahasa Melayu (BM)'}
            </button>
          </div>
        </div>

        <div className="jomi-cluster" style={{ paddingTop: '0.5rem' }}>
          {onResetAccount && !confirmReset && (
            <button
              type="button"
              className="jomi-btn jomi-btn-outline jomi-btn-sm"
              onClick={() => setConfirmReset(true)}
            >
              <Trash2 size={14} color="#b91c1c" />
              <span>{t.resetSandbox}</span>
            </button>
          )}
          {onResetAccount && confirmReset && (
            <>
              <button
                type="button"
                className="jomi-btn jomi-btn-danger jomi-btn-sm"
                onClick={() => {
                  onResetAccount();
                  setConfirmReset(false);
                }}
              >
                <span>{t.confirmResetBtn}</span>
              </button>
              <button
                type="button"
                className="jomi-btn jomi-btn-outline jomi-btn-sm"
                onClick={() => setConfirmReset(false)}
              >
                <span>{t.cancel}</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="jomi-btn jomi-btn-outline jomi-btn-sm"
            style={{ color: 'var(--jomi-coral-dark)' }}
            onClick={() => navigateTo('login')}
          >
            <LogOut size={14} />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
