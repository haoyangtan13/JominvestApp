import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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
    eng: 'When allocating capital to Malaysian equities, what is your primary objective?',
    bm: 'Apabila memperuntukkan modal ke dalam ekuiti Malaysia, apakah objektif utama anda?',
    options: {
      eng: [
        'A) Capital Preservation — Prioritize stable FBM KLCI dividend payers',
        'B) Balanced Compounding — Blend steady dividend income with mid-cap growth',
        'C) Capital Appreciation — Target high-conviction growth and momentum leaders'
      ],
      bm: [
        'A) Pemeliharaan Modal — Utamakan pembayar dividen FBM KLCI yang stabil',
        'B) Pertumbuhan Seimbang — Gabungan pendapatan dividen dan pertumbuhan sederhana',
        'C) Peningkatan Modal — Sasarkan saham pertumbuhan tinggi dan peneraju momentum'
      ]
    }
  },
  {
    eng: 'If your portfolio experiences a 20% market drawdown on Bursa Malaysia, how do you respond?',
    bm: 'Jika portfolio anda mengalami penurunan pasaran sebanyak 20% di Bursa Malaysia, apakah tindakan anda?',
    options: {
      eng: [
        'A) Reduce exposure immediately to preserve remaining principal',
        'B) Maintain existing positions and wait for fundamental recovery',
        'C) Accumulate additional board lots at discounted valuations'
      ],
      bm: [
        'A) Kurangkan pendedahan segera untuk melindungi baki modal',
        'B) Kekalkan pegangan sedia ada dan tunggu pemulihan asas',
        'C) Tambah pegangan pada penilaian harga yang lebih rendah'
      ]
    }
  },
  {
    eng: 'What is your intended investment horizon for this equity mandate?',
    bm: 'Apakah tempoh ufuk pelaburan anda bagi mandat ekuiti ini?',
    options: {
      eng: [
        'A) Short-Term Horizon (1 – 3 Years)',
        'B) Medium-Term Horizon (3 – 7 Years)',
        'C) Long-Term Institutional Horizon (7+ Years)'
      ],
      bm: [
        'A) Jangka Pendek (1 – 3 Tahun)',
        'B) Jangka Sederhana (3 – 7 Tahun)',
        'C) Jangka Panjang (7+ Tahun)'
      ]
    }
  },
  {
    eng: 'What proportion of your liquid net worth would you allocate to listed equities?',
    bm: 'Berapakah bahagian daripada aset cair anda yang akan diperuntukkan kepada ekuiti tersenarai?',
    options: {
      eng: [
        'A) Conservative Allocation (Under 20%)',
        'B) Core Allocation (20% – 50%)',
        'C) High-Conviction Allocation (Over 50%)'
      ],
      bm: [
        'A) Peruntukan Konservatif (Kurang daripada 20%)',
        'B) Peruntukan Teras (20% – 50%)',
        'C) Peruntukan Konviksi Tinggi (Lebih daripada 50%)'
      ]
    }
  },
  {
    eng: 'How familiar are you with financial ratios, board lots, and SAC Shariah screening?',
    bm: 'Sejauh manakah pengetahuan anda tentang nisbah kewangan, lot papan, dan saringan Syariah MPS?',
    options: {
      eng: [
        'A) Foundational — New to reading financial statements and Bursa mechanics',
        'B) Intermediate — Familiar with P/E ratios, dividend yields, and sector cycles',
        'C) Advanced — Experienced with fundamental valuation and portfolio construction'
      ],
      bm: [
        'A) Asas — Baharu dalam memahami penyata kewangan dan mekanik Bursa',
        'B) Pertengahan — Biasa dengan nisbah P/E, hasil dividen, dan kitaran sektor',
        'C) Mahir — Berpengalaman dalam penilaian asas dan pembinaan portfolio'
      ]
    }
  }
];

export function RiskQuestionnaire({ navigateTo, setUserProfile, language }: RiskQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const stepNum = String(currentQuestion + 1).padStart(2, '0');
  const totalSteps = String(questions.length).padStart(2, '0');

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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div className="jom-panel p-8 max-w-2xl w-full space-y-8">
        {/* Top Metadata & 2px Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="jom-kicker">
              {language === 'ENG'
                ? `MANDATE ASSESSMENT · STEP ${stepNum} OF ${totalSteps}`
                : `PENILAIAN MANDAT · LANGKAH ${stepNum} DARIPADA ${totalSteps}`}
            </span>
            <span className="jom-tag">JomINVEST · KLSE</span>
          </div>

          <div
            className="w-full overflow-hidden rounded-full"
            style={{ height: '2px', backgroundColor: 'var(--border-hairline)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent-brand)' }}
            />
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <h2 className="font-editorial text-3xl leading-snug" style={{ color: 'var(--ink-primary)' }}>
            {questionText}
          </h2>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {language === 'ENG'
              ? 'Your response calibrates equity screening weights and conviction ideas.'
              : 'Jawapan anda menentukan pemberat saringan ekuiti dan cadangan konviksi.'}
          </p>
        </div>

        {/* Selectable Mandate Options */}
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const codeLetter = option.slice(0, 2);
            const labelBody = option.slice(3);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedAnswer(option)}
                className="w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3.5 cursor-pointer"
                style={{
                  borderColor: isSelected ? 'var(--ink-primary)' : 'var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                }}
              >
                <span
                  className="font-tabular text-xs font-semibold px-2 py-0.5 rounded border shrink-0 mt-0.5"
                  style={{
                    borderColor: isSelected ? 'var(--ink-primary)' : 'var(--border-hairline)',
                    backgroundColor: isSelected ? 'var(--ink-primary)' : 'transparent',
                    color: isSelected ? 'var(--ink-inverse)' : 'var(--ink-secondary)'
                  }}
                >
                  {codeLetter.replace(')', '')}
                </span>
                <span
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: 'var(--ink-primary)' }}
                >
                  {labelBody}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div
          className="flex items-center justify-between pt-6 border-t"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="jom-btn"
          >
            <ArrowLeft size={15} />
            <span>{language === 'ENG' ? 'Previous' : 'Kembali'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="jom-btn jom-btn-primary"
          >
            <span>
              {currentQuestion === questions.length - 1
                ? language === 'ENG'
                  ? 'Confirm Investor Mandate'
                  : 'Sahkan Mandat Pelabur'
                : language === 'ENG'
                ? 'Continue'
                : 'Seterusnya'}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
