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
    eng: 'What is your main goal as you start investing in Malaysian stocks?',
    bm: 'Apakah matlamat utama anda apabila mula melabur dalam saham Malaysia?',
    options: {
      eng: [
        'A) Steady Passive Income — Focus on reliable dividend payers like Maybank & Tenaga',
        'B) Balanced Growth & Dividends — Mix steady dividends with growing Malaysian companies',
        'C) Long-Term Wealth Growth — Focus on faster-growing infrastructure & tech leaders'
      ],
      bm: [
        'A) Pendapatan Pasif Stabil — Fokus kepada pembayar dividen kukuh seperti Maybank & Tenaga',
        'B) Pertumbuhan & Dividen Seimbang — Gabungan dividen stabil dan syarikat berkembang',
        'C) Pertumbuhan Kekayaan Jangka Panjang — Fokus kepada peneraju infrastruktur & teknologi'
      ]
    }
  },
  {
    eng: 'Imagine the stock market drops 20% next month. What would you most likely do?',
    bm: 'Bayangkan pasaran saham turun 20% bulan depan. Apakah tindakan yang paling mungkin anda ambil?',
    options: {
      eng: [
        'A) Sell some shares so I can protect my remaining savings',
        'B) Stay calm, hold my shares, and wait for the market to recover',
        'C) Treat it like a discount sale and buy more shares of strong companies'
      ],
      bm: [
        'A) Jual sebahagian saham untuk melindungi baki simpanan saya',
        'B) Kekal tenang, simpan pegangan sedia ada, dan tunggu pasaran pulih',
        'C) Anggap ia sebagai diskaun dan tambah pegangan dalam syarikat kukuh'
      ]
    }
  },
  {
    eng: 'How long do you plan to keep this money invested before you need it?',
    bm: 'Berapa lama anda merancang untuk melaburkan wang ini sebelum memerlukannya?',
    options: {
      eng: [
        'A) Short term (1 – 3 years)',
        'B) Medium term (3 – 7 years)',
        'C) Long term (7+ years)'
      ],
      bm: [
        'A) Jangka pendek (1 – 3 tahun)',
        'B) Jangka sederhana (3 – 7 tahun)',
        'C) Jangka panjang (7+ tahun)'
      ]
    }
  },
  {
    eng: 'Out of your total savings (after emergency funds), how much would you put into stocks?',
    bm: 'Daripada jumlah simpanan anda (selepas tabung kecemasan), berapa banyak yang ingin dilaburkan dalam saham?',
    options: {
      eng: [
        'A) A small portion (Under 20% — mostly in ASB, Tabung Haji, or Fixed Deposits)',
        'B) A balanced portion (20% – 50% alongside my safe savings)',
        'C) A larger portion (Over 50% focused on building long-term wealth)'
      ],
      bm: [
        'A) Bahagian kecil (Bawah 20% — selebihnya dalam ASB, Tabung Haji, atau FD)',
        'B) Bahagian seimbang (20% – 50% bersama simpanan selamat saya)',
        'C) Bahagian lebih besar (Lebih 50% fokus membina kekayaan jangka panjang)'
      ]
    }
  },
  {
    eng: 'How comfortable are you with terms like P/E ratio, lots, and Shariah screening?',
    bm: 'Sejauh manakah keselesaan anda dengan istilah seperti nisbah P/E, unit lot, dan saringan Syariah?',
    options: {
      eng: [
        'A) Brand new — I want simple, plain-English explanations from scratch',
        'B) Getting the hang of it — I know the basics of dividends and stock prices',
        'C) Pretty confident — I have read about financial ratios and company earnings before'
      ],
      bm: [
        'A) Masih baharu — Saya mahukan penerangan mudah dari asas',
        'B) Mula memahami — Saya tahu asas dividen dan pergerakan harga saham',
        'C) Agak yakin — Saya pernah membaca tentang nisbah kewangan dan untung syarikat'
      ]
    }
  }
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

  return (
    <div className="rh-page flex items-center justify-center">
      <div className="rh-card p-8 max-w-2xl w-full space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
            <span>
              {language === 'ENG'
                ? `Step ${currentQuestion + 1} of ${questions.length}`
                : `Langkah ${currentQuestion + 1} daripada ${questions.length}`}
            </span>
            <span className="font-tabular">{Math.round(progress)}%</span>
          </div>

          <div
            className="w-full overflow-hidden rounded-full"
            style={{ height: '6px', backgroundColor: 'var(--border-hairline)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent-brand)' }}
            />
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold leading-snug" style={{ color: 'var(--ink-primary)' }}>
            {questionText}
          </h1>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
            {language === 'ENG'
              ? 'We use this to personalize your starter stock ideas and learning notes.'
              : 'Kami gunakan ini untuk menyesuaikan cadangan saham dan nota pembelajaran anda.'}
          </p>
        </div>

        {/* Selectable Options */}
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
                className="w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer"
                style={{
                  borderColor: isSelected ? 'var(--accent-brand)' : 'var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--accent-brand-subtle)' : 'var(--bg-surface)'
                }}
              >
                <span
                  className="font-tabular text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 mt-0.5"
                  style={{
                    borderColor: isSelected ? 'var(--accent-brand)' : 'var(--border-hairline)',
                    backgroundColor: isSelected ? 'var(--accent-brand)' : 'var(--bg-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--ink-secondary)'
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
          className="flex items-center justify-between pt-5 border-t"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="jom-btn"
          >
            <ArrowLeft size={15} />
            <span>{language === 'ENG' ? 'Back' : 'Kembali'}</span>
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
                  ? 'Finish & View Portfolio'
                  : 'Selesai & Lihat Portfolio'
                : language === 'ENG'
                ? 'Next'
                : 'Seterusnya'}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
