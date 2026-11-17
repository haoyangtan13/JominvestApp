import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { X, Send, Sparkles } from 'lucide-react';
import { stocks as defaultStocks, type StockData } from '../data/stocks';
import type { PortfolioItem } from '../App';

export interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ENG' | 'BM';
  stocks?: StockData[];
  portfolio?: PortfolioItem[];
  cashBalance?: number;
  userProfile?: string;
  userName?: string;
}

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export function ChatbotModal({
  isOpen,
  onClose,
  language,
  stocks = defaultStocks,
  portfolio = [],
  cashBalance = 10000,
  userProfile = 'Jom-Explorer (Aggressive)',
  userName = 'Tan'
}: ChatbotModalProps) {
  const firstName = (userName || 'Tan').split(' ')[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        language === 'ENG'
          ? `Hi ${firstName}! I'm JomAI, your Bursa Malaysia investment assistant. Ask me about any of our ${stocks.length} listed stocks, your portfolio health, Shariah screening, dividends, or Bursa trading fees!`
          : `Hai ${firstName}! Saya JomAI, pembantu pelaburan Bursa Malaysia anda. Tanya saya tentang mana-mana ${stocks.length} saham tersenarai, kesihatan portfolio anda, saringan Syariah, dividen, atau yuran Bursa!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const texts = {
    ENG: {
      title: 'JomAI Bursa Assistant',
      placeholder: 'Ask about MAYBANK, TENAGA, dividends, portfolio...',
      quickReplies: [
        'Analyze my portfolio',
        'Top dividend stocks',
        'Shariah stocks on Bursa',
        'Compare MAYBANK vs CIMB',
        'How do Bursa fees work?'
      ]
    },
    BM: {
      title: 'Pembantu Bursa JomAI',
      placeholder: 'Tanya tentang MAYBANK, TENAGA, dividen, portfolio...',
      quickReplies: [
        'Analisis portfolio saya',
        'Saham dividen tertinggi',
        'Saham patuh Syariah di Bursa',
        'Bandingkan MAYBANK vs CIMB',
        'Bagaimana yuran Bursa dikira?'
      ]
    }
  };

  const t = texts[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const buildSmartResponse = (rawText: string): string => {
    const lowerText = rawText.toLowerCase();

    // 1. Check if user mentions 1 or 2 stocks from `stocks`
    const matchedStocks = stocks.filter(s => {
      const tickerMatch = lowerText.includes(s.ticker.toLowerCase());
      const nameParts = s.name
        .toLowerCase()
        .replace(/berhad|bhd|malaysia|\(.*?\)/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length >= 4);
      const nameMatch = nameParts.some(part => lowerText.includes(part));
      return tickerMatch || nameMatch;
    });

    if (matchedStocks.length >= 2) {
      const [s1, s2] = matchedStocks;
      const r1 = Math.round(
        (s1.radarScores.value +
          s1.radarScores.growth +
          s1.radarScores.health +
          s1.radarScores.dividend +
          s1.radarScores.momentum) /
          5
      );
      const r2 = Math.round(
        (s2.radarScores.value +
          s2.radarScores.growth +
          s2.radarScores.health +
          s2.radarScores.dividend +
          s2.radarScores.momentum) /
          5
      );
      return language === 'ENG'
        ? `📊 Head-to-Head Comparison: ${s1.ticker} vs ${s2.ticker}\n\n` +
            `• ${s1.name} (${s1.ticker}): RM ${s1.price} (${s1.changePercent}) | P/E: ${s1.peRatio}x | Div Yield: ${s1.dividendYield} | Debt/Equity: ${s1.debtEquity} | ${s1.isShariah ? '☪️ Shariah' : 'Non-Shariah'} | Radar Score: ${r1}/100.\n` +
            `• ${s2.name} (${s2.ticker}): RM ${s2.price} (${s2.changePercent}) | P/E: ${s2.peRatio}x | Div Yield: ${s2.dividendYield} | Debt/Equity: ${s2.debtEquity} | ${s2.isShariah ? '☪️ Shariah' : 'Non-Shariah'} | Radar Score: ${r2}/100.\n\n` +
            `💡 Verdict: ${
              parseFloat(s1.dividendYield) > parseFloat(s2.dividendYield)
                ? `${s1.ticker} leads for passive dividend yield (${s1.dividendYield})`
                : `${s2.ticker} leads for passive dividend yield (${s2.dividendYield})`
            }, while ${
              s1.radarScores.growth >= s2.radarScores.growth ? s1.ticker : s2.ticker
            } shows stronger growth momentum.`
        : `📊 Perbandingan: ${s1.ticker} lwn ${s2.ticker}\n\n` +
            `• ${s1.name} (${s1.ticker}): RM ${s1.price} (${s1.changePercent}) | P/E: ${s1.peRatio}x | Dividen: ${s1.dividendYield} | ${s1.isShariah ? '☪️ Syariah' : 'Konvensional'} | Skor Radar: ${r1}/100.\n` +
            `• ${s2.name} (${s2.ticker}): RM ${s2.price} (${s2.changePercent}) | P/E: ${s2.peRatio}x | Dividen: ${s2.dividendYield} | ${s2.isShariah ? '☪️ Syariah' : 'Konvensional'} | Skor Radar: ${r2}/100.`;
    }

    if (matchedStocks.length === 1) {
      const s = matchedStocks[0];
      const avgRadar = Math.round(
        (s.radarScores.value +
          s.radarScores.growth +
          s.radarScores.health +
          s.radarScores.dividend +
          s.radarScores.momentum) /
          5
      );
      return language === 'ENG'
        ? `📈 ${s.name} (${s.ticker} / ${s.bursaCode}) — ${s.sector}\n` +
            `• Current Price: RM ${s.price} (${s.changePercent}) | 1 Lot (100 units) ≈ RM ${(parseFloat(s.price) * 100).toFixed(2)}\n` +
            `• Valuation & Yield: P/E ${s.peRatio}x | Dividend Yield: ${s.dividendYield} | Debt/Equity: ${s.debtEquity}\n` +
            `• Compliance: ${s.isShariah ? '☪️ SC Malaysia Shariah-Compliant' : 'Conventional (Non-Shariah)'}\n` +
            `• Fundamental Verdict (${avgRadar}/100): ${s.description} Revenue stands at ${s.revenue} with Net Profit of ${s.netProfit}.`
        : `📈 ${s.name} (${s.ticker} / ${s.bursaCode}) — ${s.sector}\n` +
            `• Harga Semasa: RM ${s.price} (${s.changePercent}) | 1 Lot (100 unit) ≈ RM ${(parseFloat(s.price) * 100).toFixed(2)}\n` +
            `• Penilaian & Hasil: P/E ${s.peRatio}x | Kadar Dividen: ${s.dividendYield} | Hutang/Ekuiti: ${s.debtEquity}\n` +
            `• Status: ${s.isShariah ? '☪️ Patuh Syariah SC Malaysia' : 'Konvensional'}\n` +
            `• Keputusan Asas (${avgRadar}/100): Hasil tahunan ${s.revenue} dan Untung Bersih ${s.netProfit}.`;
    }

    // 2. Portfolio Analysis
    if (
      lowerText.includes('portfolio') ||
      lowerText.includes('pegangan') ||
      lowerText.includes('analyze my') ||
      lowerText.includes('check my')
    ) {
      const holdingsValue = portfolio.reduce(
        (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
        0
      );
      const totalEquity = holdingsValue + cashBalance;
      if (portfolio.length === 0) {
        return language === 'ENG'
          ? `💼 Portfolio Check for ${firstName}:\nYou currently hold 0 stocks and have RM ${cashBalance.toFixed(2)} in virtual cash (Profile: ${userProfile}).\n\n💡 Tip: Head to Dashboard or AI Recommendations to buy your first Bursa Malaysia stock (e.g. MAYBANK, TENAGA, GAMUDA, or INARI) and earn +50 XP!`
          : `💼 Semakan Portfolio untuk ${firstName}:\nAnda kini memegang 0 saham dengan baki tunai maya RM ${cashBalance.toFixed(2)} (Profil: ${userProfile}).\n\n💡 Tip: Lawati Papan Pemuka atau Cadangan AI untuk membeli saham pertama anda!`;
      }

      const sectors: Record<string, number> = {};
      portfolio.forEach(item => {
        const val = parseFloat(item.stock.price) * item.quantity;
        sectors[item.stock.sector] = (sectors[item.stock.sector] || 0) + val;
      });
      const sortedSectors = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
      const topSector = sortedSectors[0];
      const topSectorPct = Math.round((topSector[1] / holdingsValue) * 100);
      const holdingsSummary = portfolio
        .map(i => `${i.stock.ticker} (${i.quantity} units)`)
        .join(', ');

      return language === 'ENG'
        ? `💼 Portfolio Summary for ${firstName} (${userProfile}):\n` +
            `• Total Equity: RM ${totalEquity.toFixed(2)} (Stocks: RM ${holdingsValue.toFixed(2)} | Cash: RM ${cashBalance.toFixed(2)})\n` +
            `• Active Holdings (${portfolio.length}): ${holdingsSummary}\n` +
            `• Top Sector: ${topSector[0]} (${topSectorPct}% across ${sortedSectors.length} sector(s))\n` +
            `💡 AI Tip: ${
              sortedSectors.length < 3
                ? 'Add at least 1 more uncorrelated sector to unlock the Sector Diversifier badge!'
                : 'Great sector diversification across 3+ industries!'
            }`
        : `💼 Ringkasan Portfolio ${firstName} (${userProfile}):\n` +
            `• Jumlah Ekuiti: RM ${totalEquity.toFixed(2)} (Saham: RM ${holdingsValue.toFixed(2)} | Tunai: RM ${cashBalance.toFixed(2)})\n` +
            `• Pegangan Aktif (${portfolio.length}): ${holdingsSummary}\n` +
            `• Sektor Utama: ${topSector[0]} (${topSectorPct}% merentasi ${sortedSectors.length} sektor).`;
    }

    // 3. Shariah / Halal Inquiry
    if (
      lowerText.includes('shariah') ||
      lowerText.includes('syariah') ||
      lowerText.includes('halal') ||
      lowerText.includes('islamic')
    ) {
      const shariahStocks = stocks.filter(s => s.isShariah).slice(0, 6);
      const listStr = shariahStocks
        .map(s => `${s.ticker} (RM ${s.price}, Div ${s.dividendYield})`)
        .join(', ');
      return language === 'ENG'
        ? `☪️ Shariah-Compliant Investing on Bursa Malaysia:\n` +
            `The Securities Commission (SC) Shariah Advisory Council screens stocks based on business activities and financial ratios (<33% conventional debt & cash).\n\n` +
            `Top Shariah Counters in JomInvest:\n${listStr}.\n\n` +
            `Look for the green "☪️ Shariah" badge on the Dashboard and Stock Details pages!`
        : `☪️ Pelaburan Patuh Syariah di Bursa Malaysia:\n` +
            `Majlis Penasihat Syariah SC menyaring saham berdasarkan aktiviti perniagaan dan nisbah kewangan (<33% hutang & tunai konvensional).\n\n` +
            `Kaunter Syariah Utama dalam JomInvest:\n${listStr}.`;
    }

    // 4. Dividend Inquiry
    if (
      lowerText.includes('dividend') ||
      lowerText.includes('dividen') ||
      lowerText.includes('passive') ||
      lowerText.includes('yield')
    ) {
      const topDiv = [...stocks]
        .sort(
          (a, b) =>
            parseFloat(b.dividendYield.replace('%', '')) -
            parseFloat(a.dividendYield.replace('%', ''))
        )
        .slice(0, 5);
      const divList = topDiv
        .map(s => `• ${s.ticker} (${s.name}): ${s.dividendYield} yield @ RM ${s.price}`)
        .join('\n');
      return language === 'ENG'
        ? `💰 Top 5 Highest Dividend Yield Stocks on Bursa Malaysia:\n${divList}\n\nNote: Malaysia uses a single-tier tax-exempt dividend system for retail investors!`
        : `💰 5 Saham Hasil Dividen Tertinggi di Bursa Malaysia:\n${divList}\n\nNota: Dividen di Malaysia dikecualikan cukai untuk pelabur runcit!`;
    }

    // 5. Fees / Board Lot / Brokerage Inquiry
    if (
      lowerText.includes('fee') ||
      lowerText.includes('yuran') ||
      lowerText.includes('lot') ||
      lowerText.includes('broker') ||
      lowerText.includes('stamp') ||
      lowerText.includes('kos')
    ) {
      return language === 'ENG'
        ? `🧾 Bursa Malaysia Trading & Fee Structure:\n` +
            `1. Board Lot Size: 1 Standard Lot = 100 units (e.g. 100 units of RM 5.00 stock = RM 500).\n` +
            `2. Brokerage Fee: ~0.10% of trade value (min RM 1.00 on modern online platforms).\n` +
            `3. Clearing Fee: 0.03% of trade value (capped at RM 1,000).\n` +
            `4. Stamp Duty: RM 1.00 for every RM 1,000 (or fractional part) of trade value.\n\n` +
            `JomInvest automatically calculates these exact Bursa fees whenever you buy or sell!`
        : `🧾 Struktur Lot & Yuran Dagangan Bursa Malaysia:\n` +
            `1. Saiz Lot: 1 Lot Standard = 100 unit saham.\n` +
            `2. Yuran Broker: ~0.10% daripada nilai dagangan (minimum RM 1.00).\n` +
            `3. Yuran Penjelasan: 0.03% daripada nilai dagangan.\n` +
            `4. Duti Setem: RM 1.00 bagi setiap RM 1,000 nilai dagangan.\n\n` +
            `JomInvest mengira semua yuran Bursa ini secara automatik!`;
    }

    // Default helpful response
    return language === 'ENG'
      ? `I can help you analyze any of our ${stocks.length} Bursa Malaysia stocks! Try asking:\n• "Tell me about TENAGA or GAMUDA"\n• "Compare MAYBANK vs CIMB"\n• "Analyze my portfolio"\n• "Top dividend stocks" or "Shariah stocks on Bursa"`
      : `Saya boleh membantu menganalisis mana-mana ${stocks.length} saham Bursa Malaysia! Cuba tanya:\n• "Beritahu tentang TENAGA atau GAMUDA"\n• "Bandingkan MAYBANK vs CIMB"\n• "Analisis portfolio saya"\n• "Saham dividen tertinggi"`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = buildSmartResponse(text);
      const newAiMsg: Message = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />

      {/* Modal */}
      <Card className="relative w-full max-w-md h-[600px] max-h-[85vh] flex flex-col shadow-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{t.title}</h3>
              <p className="text-[11px] text-green-100">
                {stocks.length} Bursa Stocks • Live Portfolio Context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-500 text-xs italic">
                JomAI is analyzing Bursa data...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-2 pt-1 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 mb-1.5 font-medium">
            {language === 'ENG' ? 'Quick Prompts:' : 'Soalan Pantas:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {t.quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-[11px] h-7 px-2.5 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTyping ? 'JomAI is typing...' : t.placeholder}
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleSendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
