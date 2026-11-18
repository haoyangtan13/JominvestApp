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
    eng: 'What is your primary goal when investing in Malaysian stocks?',
    bm: 'Apakah matlamat utama anda apabila melabur dalam saham Malaysia?',
    options: {
      eng: [
        'A) Steady dividend income — Focus on established payers like Maybank and Tenaga',
        'B) Balanced return — Combine dividend yield with moderate capital growth',
        'C) Long-term growth — Focus on infrastructure and technology companies'
      ],
      bm: [
        'A) Pendapatan dividen stabil — Fokus kepada pembayar kukuh seperti Maybank dan Tenaga',
        'B) Pulangan seimbang — Gabungan dividen dan pertumbuhan modal sederhana',
        'C) Pertumbuhan jangka panjang — Fokus kepada syarikat infrastruktur dan teknologi'
      ]
    }
  },
  {
    eng: 'If the market declined 20% over a month, how would you respond?',
    bm: 'Jika pasaran turun 20% dalam tempoh sebulan, apakah tindakan anda?',
    options: {
      eng: [
        'A) Reduce exposure to preserve capital',
        'B) Hold existing positions and wait for recovery',
        'C) Add to quality positions at lower valuations'
      ],
      bm: [
        'A) Kurangkan pegangan untuk melindungi modal',
        'B) Kekalkan pegangan sedia ada dan tunggu pemulihan',
        'C) Tambah pegangan berkualiti pada penilaian lebih rendah'
      ]
    }
  },
  {
    eng: 'What is your investment time horizon?',
    bm: 'Apakah tempoh masa pelaburan anda?',
    options: {
      eng: [
        'A) 1 – 3 years',
        'B) 3 – 7 years',
        'C) 7+ years'
      ],
      bm: [
        'A) 1 – 3 tahun',
        'B) 3 – 7 tahun',
        'C) 7+ tahun'
      ]
    }
  },
  {
    eng: 'Outside of emergency savings, how much of your portfolio would you allocate to equities?',
    bm: 'Di luar simpanan kecemasan, berapakah bahagian portfolio yang ingin diperuntukkan kepada ekuiti?',
    options: {
      eng: [
        'A) Under 20% — majority in EPF, ASB, or fixed deposits',
        'B) 20% – 50% alongside fixed-income savings',
        'C) Over 50% focused on long-term equity compounding'
      ],
      bm: [
        'A) Bawah 20% — selebihnya dalam KWSP, ASB, atau deposit tetap',
        'B) 20% – 50% bersama simpanan tetap',
        'C) Lebih 50% fokus kepada pertumbuhan ekuiti jangka panjang'
      ]
    }
  },
  {
    eng: 'How familiar are you with financial metrics like P/E ratio, dividend yield, and board lots?',
    bm: 'Sejauh manakah kebiasaan anda dengan metrik seperti nisbah P/E, hasil dividen, dan unit lot?',
    options: {
      eng: [
        'A) Beginner — learning the fundamentals',
        'B) Intermediate — familiar with stock prices and dividends',
        'C) Experienced — comfortable reading financial statements'
      ],
      bm: [
        'A) Permulaan — baru mempelajari asas',
        'B) Pertengahan — biasa dengan harga saham dan dividen',
        'C) Berpengalaman — selesa membaca penyata kewangan'
      ]
    }
  }
];

export function RiskQuestionnaire({ navigateTo, setUserProfile, language }: RiskQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

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
    <div className="rh-page">
      <div className="max-w-xl mx-auto space-y-8 pt-6">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ink-muted)' }}>
          <span>JomInvest</span>
          <span className="font-tabular">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold leading-snug">
            {questionText}
          </h1>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--border-hairline)' }}>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const labelBody = option.slice(3);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedAnswer(option)}
                className="w-full text-left py-4 px-3 border-b transition-colors flex items-center justify-between gap-4 cursor-pointer"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent'
                }}
              >
                <span className="text-sm" style={{ color: 'var(--ink-primary)', fontWeight: isSelected ? 500 : 400 }}>
                  {labelBody}
                </span>
                <span
                  className="text-xs font-tabular"
                  style={{ color: isSelected ? 'var(--ink-primary)' : 'var(--ink-muted)' }}
                >
                  {isSelected ? 'Selected' : ''}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="jom-btn text-xs"
          >
            <ArrowLeft size={14} />
            <span>{language === 'ENG' ? 'Back' : 'Kembali'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="jom-btn jom-btn-primary text-xs"
          >
            <span>
              {currentQuestion === questions.length - 1
                ? language === 'ENG'
                  ? 'Continue to Market'
                  : 'Terus ke Pasaran'
                : language === 'ENG'
                ? 'Next'
                : 'Seterusnya'}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
