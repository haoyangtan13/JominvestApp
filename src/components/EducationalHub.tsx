import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, BookOpen, Play, Clock, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface EducationalHubProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
}

const articles = [
  {
    titleEng: 'What is a Dividend?',
    titleBm: 'Apakah Dividen?',
    descEng: 'Learn how companies share profits with shareholders',
    descBm: 'Pelajari bagaimana syarikat berkongsi keuntungan dengan pemegang saham',
    readTime: '5 min',
    category: 'Basics',
  },
  {
    titleEng: 'Understanding Bursa Malaysia',
    titleBm: 'Memahami Bursa Malaysia',
    descEng: 'A complete guide to Malaysia\'s stock exchange',
    descBm: 'Panduan lengkap tentang bursa saham Malaysia',
    readTime: '8 min',
    category: 'Market',
  },
  {
    titleEng: 'Risk vs. Return',
    titleBm: 'Risiko vs. Pulangan',
    descEng: 'Balance risk and reward in your investment strategy',
    descBm: 'Seimbangkan risiko dan ganjaran dalam strategi pelaburan anda',
    readTime: '6 min',
    category: 'Strategy',
  },
  {
    titleEng: 'How to Build a Portfolio',
    titleBm: 'Cara Membina Portfolio',
    descEng: 'Step-by-step guide to diversification',
    descBm: 'Panduan langkah demi langkah untuk kepelbagaian',
    readTime: '10 min',
    category: 'Strategy',
  },
];

const tutorials = [
  {
    titleEng: 'How to Read a Stock Chart',
    titleBm: 'Cara Membaca Carta Saham',
    descEng: 'Master the basics of technical analysis',
    descBm: 'Kuasai asas analisis teknikal',
    duration: '12 min',
    level: 'Beginner',
  },
  {
    titleEng: 'What is Risk Management?',
    titleBm: 'Apakah Pengurusan Risiko?',
    descEng: 'Protect your investments with smart strategies',
    descBm: 'Lindungi pelaburan anda dengan strategi pintar',
    duration: '15 min',
    level: 'Beginner',
  },
  {
    titleEng: 'Understanding P/E Ratios',
    titleBm: 'Memahami Nisbah P/E',
    descEng: 'Learn how to value stocks effectively',
    descBm: 'Belajar cara menilai saham dengan berkesan',
    duration: '10 min',
    level: 'Intermediate',
  },
  {
    titleEng: 'Advanced Portfolio Strategies',
    titleBm: 'Strategi Portfolio Lanjutan',
    descEng: 'Take your investing to the next level',
    descBm: 'Tingkatkan pelaburan anda ke tahap seterusnya',
    duration: '20 min',
    level: 'Advanced',
  },
];

export function EducationalHub({ navigateTo, language }: EducationalHubProps) {
  const texts = {
    ENG: {
      back: 'Back to Dashboard',
      title: 'Educational Hub',
      subtitle: 'Learn to invest with confidence',
      articles: 'Articles',
      tutorials: 'Video Tutorials',
      readMore: 'Read More',
      watchNow: 'Watch Now',
      readTime: 'min read',
      duration: 'min',
    },
    BM: {
      back: 'Kembali ke Dashboard',
      title: 'Hab Pendidikan',
      subtitle: 'Belajar melabur dengan yakin',
      articles: 'Artikel',
      tutorials: 'Tutorial Video',
      readMore: 'Baca Lagi',
      watchNow: 'Tonton Sekarang',
      readTime: 'min bacaan',
      duration: 'min',
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            {t.back}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <BookOpen size={28} />
            </div>
            <h1 className="text-3xl">{t.title}</h1>
          </div>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="articles">{t.articles}</TabsTrigger>
            <TabsTrigger value="tutorials">{t.tutorials}</TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock size={14} />
                        {article.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'ENG' ? article.titleEng : article.titleBm}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {language === 'ENG' ? article.descEng : article.descBm}
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2" size={16} />
                      {t.readMore}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-200">
                    <ImageWithFallback
                      src={index % 2 === 0 
                        ? "https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMHRyYWRpbmclMjBkYXRhfGVufDF8fHx8MTc2MTkwMDk2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        : "https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGVkdWNhdGlvbiUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MTgyMDI5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      }
                      alt="Tutorial thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="text-green-600 ml-1" size={28} fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {tutorial.duration}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={tutorial.level === 'Beginner' ? 'secondary' : tutorial.level === 'Intermediate' ? 'default' : 'destructive'}
                      >
                        {tutorial.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'ENG' ? tutorial.titleEng : tutorial.titleBm}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {language === 'ENG' ? tutorial.descEng : tutorial.descBm}
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Play className="mr-2" size={16} />
                      {t.watchNow}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Banner */}
        <Card className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp size={48} />
                <div>
                  <h3 className="text-2xl mb-2">
                    {language === 'ENG' ? 'Ready to Start Investing?' : 'Bersedia untuk Mula Melabur?'}
                  </h3>
                  <p className="text-green-50">
                    {language === 'ENG' 
                      ? 'Put your knowledge into practice with our simulated portfolio' 
                      : 'Praktikkan pengetahuan anda dengan portfolio simulasi kami'}
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigateTo('dashboard')}
              >
                {language === 'ENG' ? 'Go to Dashboard' : 'Pergi ke Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
