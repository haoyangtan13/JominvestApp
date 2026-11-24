import { useState } from 'react';
import { ArrowRight, ArrowLeft, Compass, Check, TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface RiskQuestionnaireProps {
  navigateTo: (screen: Screen) => void;
  setUserProfile: (profile: string) => void;
  language: 'ENG' | 'BM';
}

interface Question {
  eng: string;
  bm: string;
  options: {
    eng: string[];
    bm: string[];
  };
}

const questions: Question[] = [
  {
    eng: 'When you think about investing, you feel...',
    bm: 'Apabila anda berfikir tentang pelaburan, anda berasa...',
    options: {
      eng: ['A) Cautious - I prefer safety', 'B) Balanced - I want some growth', 'C) Adventurous - I seek high returns'],
      bm: ['A) Berhati-hati - Saya utamakan keselamatan', 'B) Seimbang - Saya mahukan pertumbuhan', 'C) Berani - Saya cari pulangan tinggi'],
    },
  },
  {
    eng: 'If your investment drops 20% in value, you would...',
    bm: 'Jika pelaburan anda jatuh 20%, anda akan...',
    options: {
      eng: ['A) Sell immediately to cut losses', 'B) Hold and wait for recovery', 'C) Buy more at lower prices'],
      bm: ['A) Jual segera untuk kurangkan kerugian', 'B) Tunggu untuk pemulihan', 'C) Beli lebih pada harga rendah'],
    },
  },
  {
    eng: 'Your investment goal timeline is...',
    bm: 'Tempoh matlamat pelaburan anda adalah...',
    options: {
      eng: ['A) Short-term (1-3 years)', 'B) Medium-term (3-7 years)', 'C) Long-term (7+ years)'],
      bm: ['A) Jangka pendek (1-3 tahun)', 'B) Jangka sederhana (3-7 tahun)', 'C) Jangka panjang (7+ tahun)'],
    },
  },
  {
    eng: 'How much of your savings would you invest in stocks?',
    bm: 'Berapa banyak simpanan anda yang akan dilaburkan dalam saham?',
    options: {
      eng: ['A) Less than 20%', 'B) 20-50%', 'C) More than 50%'],
      bm: ['A) Kurang daripada 20%', 'B) 20-50%', 'C) Lebih daripada 50%'],
    },
  },
  {
    eng: 'What is your investment experience level?',
    bm: 'Apakah tahap pengalaman pelaburan anda?',
    options: {
      eng: ['A) Beginner - New to investing', 'B) Intermediate - Some experience', 'C) Advanced - Experienced investor'],
      bm: ['A) Pemula - Baru dalam pelaburan', 'B) Pertengahan - Ada pengalaman', 'C) Mahir - Pelabur berpengalaman'],
    },
  },
];

export function RiskQuestionnaire({ navigateTo, setUserProfile, language }: RiskQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion === questions.length - 1) {
      const score = newAnswers.reduce((sum, answer) => {
        if (answer.startsWith('A)')) return sum + 1;
        if (answer.startsWith('B)')) return sum + 2;
        return sum + 3;
      }, 0);

      let profile = '';
      if (score <= 7) profile = 'Jom-Protector (Conservative)';
      else if (score <= 11) profile = 'Jom-Builder (Moderate)';
      else profile = 'Jom-Explorer (Aggressive)';

      setUserProfile(profile);
      navigateTo('dashboard');
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const question = questions[currentQuestion];
  const questionText = language === 'ENG' ? question.eng : question.bm;
  const options = language === 'ENG' ? question.options.eng : question.options.bm;
  const letters = ['A', 'B', 'C'];

  return (
    <div className="jomi-auth-page">
      {/* Brand Bar */}
      <div className="jomi-between" style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
        <div className="jomi-cluster">
          <div className="jomi-brand-mark" aria-hidden="true">
            <TrendingUp size={22} strokeWidth={2.6} />
          </div>
          <span className="jomi-display" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            JomINVEST
          </span>
        </div>

        <span className="jomi-pill-neutral jomi-nums">
          <Compass size={14} />
          {language === 'ENG'
            ? `Question ${currentQuestion + 1} / ${questions.length}`
            : `Soalan ${currentQuestion + 1} / ${questions.length}`}
        </span>
      </div>

      <div className="jomi-auth-center">
        <div className="jomi-card jomi-card-pad" style={{ width: '100%', maxWidth: '680px', padding: '2rem' }}>
          {/* Quiz Header + Progress */}
          <div className="jomi-stack-sm" style={{ marginBottom: '1.75rem' }}>
            <div className="jomi-between">
              <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {language === 'ENG' ? 'Investor Persona Quiz' : 'Kuiz Persona Pelabur'}
              </p>
              <span className="jomi-text-xs jomi-nums" style={{ fontWeight: 800, color: 'var(--jomi-primary)' }}>
                {Math.round(progress)}%
              </span>
            </div>

            <div className="jomi-progress-track">
              <div className="jomi-progress-fill-emerald" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="jomi-display" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.35rem', lineHeight: 1.3 }}>
            {questionText}
          </h2>

          {/* Tactile Answer Options */}
          <div className="jomi-stack-sm" role="radiogroup" aria-label={questionText}>
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const cleanLabel = option.replace(/^[ABC]\)\s*/, '');
              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedAnswer(option)}
                  className={`jomi-choice-card ${isSelected ? 'jomi-choice-card-selected' : ''}`}
                >
                  <span
                    className="jomi-display"
                    style={{
                      width: '2.1rem',
                      height: '2.1rem',
                      borderRadius: '0.65rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      backgroundColor: isSelected ? 'var(--jomi-emerald)' : 'var(--jomi-canvas)',
                      color: isSelected ? '#ffffff' : 'var(--jomi-muted-ink)',
                      border: isSelected ? '2px solid var(--jomi-emerald-dark)' : '1.5px solid var(--jomi-border)',
                    }}
                  >
                    {isSelected ? <Check size={16} strokeWidth={3} /> : letters[index]}
                  </span>
                  <span style={{ flex: 1 }}>{cleanLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="jomi-between" style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1.5px solid var(--jomi-border)' }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="jomi-btn jomi-btn-outline"
            >
              <ArrowLeft size={16} />
              <span>{language === 'ENG' ? 'Back' : 'Kembali'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="jomi-btn jomi-btn-primary jomi-btn-lg"
            >
              <span>
                {currentQuestion === questions.length - 1
                  ? (language === 'ENG' ? 'Reveal My Profile' : 'Lihat Profil Saya')
                  : (language === 'ENG' ? 'Next Question' : 'Soalan Seterusnya')}
              </span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
