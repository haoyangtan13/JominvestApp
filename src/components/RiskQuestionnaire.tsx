import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
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
    eng: "When you think about investing, you feel...",
    bm: "Apabila anda berfikir tentang pelaburan, anda berasa...",
    options: {
      eng: ["A) Cautious - I prefer safety", "B) Balanced - I want some growth", "C) Adventurous - I seek high returns"],
      bm: ["A) Berhati-hati - Saya utamakan keselamatan", "B) Seimbang - Saya mahukan pertumbuhan", "C) Berani - Saya cari pulangan tinggi"]
    }
  },
  {
    eng: "If your investment drops 20% in value, you would...",
    bm: "Jika pelaburan anda jatuh 20%, anda akan...",
    options: {
      eng: ["A) Sell immediately to cut losses", "B) Hold and wait for recovery", "C) Buy more at lower prices"],
      bm: ["A) Jual segera untuk kurangkan kerugian", "B) Tunggu untuk pemulihan", "C) Beli lebih pada harga rendah"]
    }
  },
  {
    eng: "Your investment goal timeline is...",
    bm: "Tempoh matlamat pelaburan anda adalah...",
    options: {
      eng: ["A) Short-term (1-3 years)", "B) Medium-term (3-7 years)", "C) Long-term (7+ years)"],
      bm: ["A) Jangka pendek (1-3 tahun)", "B) Jangka sederhana (3-7 tahun)", "C) Jangka panjang (7+ tahun)"]
    }
  },
  {
    eng: "How much of your savings would you invest in stocks?",
    bm: "Berapa banyak simpanan anda yang akan dilaburkan dalam saham?",
    options: {
      eng: ["A) Less than 20%", "B) 20-50%", "C) More than 50%"],
      bm: ["A) Kurang daripada 20%", "B) 20-50%", "C) Lebih daripada 50%"]
    }
  },
  {
    eng: "What is your investment experience level?",
    bm: "Apakah tahap pengalaman pelaburan anda?",
    options: {
      eng: ["A) Beginner - New to investing", "B) Intermediate - Some experience", "C) Advanced - Experienced investor"],
      bm: ["A) Pemula - Baru dalam pelaburan", "B) Pertengahan - Ada pengalaman", "C) Mahir - Pelabur berpengalaman"]
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
      // Calculate profile based on answers
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            {language === 'ENG' ? "What's Your Investor Profile?" : "Profil Pelabur Anda"}
          </CardTitle>
          <CardDescription>
            {language === 'ENG' 
              ? `Step ${currentQuestion + 1} of ${questions.length}` 
              : `Langkah ${currentQuestion + 1} daripada ${questions.length}`}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg">{questionText}</h3>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2" size={16} />
              {language === 'ENG' ? 'Back' : 'Kembali'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="bg-green-600 hover:bg-green-700"
            >
              {currentQuestion === questions.length - 1 
                ? (language === 'ENG' ? 'Finish' : 'Selesai')
                : (language === 'ENG' ? 'Next' : 'Seterusnya')}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
