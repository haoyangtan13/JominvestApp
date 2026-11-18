import { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowUpRight, Loader2 } from 'lucide-react';
import { stocks as defaultStocks, type StockData } from '../data/stocks';
import type { PortfolioItem, Screen } from '../App';
import { generateJomAIResponse } from '../services/aiService';

export interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ENG' | 'BM';
  stocks?: StockData[];
  portfolio?: PortfolioItem[];
  cashBalance?: number;
  userProfile?: string;
  userName?: string;
  setSelectedStock?: (stock: StockData) => void;
  navigateTo?: (screen: Screen) => void;
}

interface Message {
  role: 'ai' | 'user';
  sender: 'user' | 'bot';
  content: string;
  text: string;
  isTabular?: boolean;
  provider?: 'API_KEY_LLM' | 'LIVE_CLOUD_LLM' | 'QUANT_ENGINE';
  referencedTickers?: string[];
}

export function ChatbotModal({
  isOpen,
  onClose,
  language,
  stocks = defaultStocks,
  portfolio = [],
  cashBalance = 10000,
  userProfile = 'Jom-Explorer (Aggressive)',
  userName = 'Tan',
  setSelectedStock,
  navigateTo
}: ChatbotModalProps) {
  const firstName = (userName || 'Tan').split(' ')[0];

  const initialGreeting =
    language === 'ENG'
      ? `Hi ${firstName}! I’m JomAI, your Bursa Malaysia study buddy. I’m connected to all ${stocks.length} Bursa companies and your practice portfolio. Ask me about any stock, compare dividends, check your diversification, or see which companies are Shariah-compliant!`
      : `Hai ${firstName}! Saya JomAI, rakan belajar Bursa Malaysia anda. Saya dihubungkan dengan ${stocks.length} syarikat Bursa dan portfolio latihan anda. Tanya saya tentang mana-mana saham, perbandingan dividen, kepelbagaian portfolio, atau status patuh Syariah!`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      sender: 'bot',
      content: initialGreeting,
      text: initialGreeting,
      isTabular: false,
      provider: 'QUANT_ENGINE',
      referencedTickers: ['MAYBANK', 'TENAGA', 'GAMUDA']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const texts = {
    ENG: {
      kicker: 'JomAI Study Buddy',
      title: 'Ask JomAI — Your Bursa Study Buddy',
      placeholder: 'Ask about a stock (e.g. Maybank, Tenaga), dividends, or your portfolio...',
      quickPromptsLabel: 'Popular Starter Questions',
      quickReplies: [
        'Is Maybank or CIMB better for dividends?',
        'Check my portfolio diversification',
        'Which Bursa stocks are Shariah-compliant?',
        'How do Bursa trading fees work?'
      ]
    },
    BM: {
      kicker: 'Rakan Belajar JomAI',
      title: 'Tanya JomAI — Rakan Belajar Bursa Anda',
      placeholder: 'Tanya tentang saham (cth. Maybank, Tenaga), dividen, atau portfolio anda...',
      quickPromptsLabel: 'Soalan Permulaan Popular',
      quickReplies: [
        'Adakah Maybank atau CIMB lebih baik untuk dividen?',
        'Semak kepelbagaian portfolio saya',
        'Saham Bursa manakah yang patuh Syariah?',
        'Bagaimana yuran dagangan Bursa dikira?'
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

  const handleSendMessage = async (rawQuery: string) => {
    const queryText = rawQuery.trim();
    if (!queryText || isTyping) return;

    const newUserMsg: Message = {
      role: 'user',
      sender: 'user',
      content: queryText,
      text: queryText
    };
    const nextHistory = [...messages, newUserMsg];
    setMessages(nextHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generateJomAIResponse(queryText, nextHistory, {
        stocks,
        portfolio,
        cashBalance,
        riskProfile: userProfile,
        language
      });

      const newAiMsg: Message = {
        role: 'ai',
        sender: 'bot',
        content: response.text,
        text: response.text,
        isTabular: false,
        provider: response.provider,
        referencedTickers: response.referencedTickers
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch {
      const fallbackText =
        language === 'ENG'
          ? `Oops! JomAI had a brief connection hiccup. Please try asking your question again about any of our ${stocks.length} Bursa Malaysia companies.`
          : `Maaf! JomAI mengalami gangguan sambungan sebentar. Sila cuba tanya soalan anda sekali lagi.`;
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          sender: 'bot',
          content: fallbackText,
          text: fallbackText,
          isTabular: false,
          provider: 'QUANT_ENGINE'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTickerPillClick = (ticker: string) => {
    const matched = stocks.find(s => s.ticker === ticker);
    if (matched && setSelectedStock && navigateTo) {
      setSelectedStock(matched);
      navigateTo('stock-details');
      onClose();
      return;
    }
    handleSendMessage(
      language === 'ENG'
        ? `Tell me about ${ticker} in plain English`
        : `Terangkan tentang saham ${ticker} dengan mudah`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Slide-Over Study Buddy Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink-primary)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-5 border-b flex items-start justify-between gap-3"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="jom-avatar jom-avatar-emerald">AI</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="jom-kicker">{t.kicker}</span>
                <span className="jom-tag jom-tag-shariah">Live Bursa Data</span>
              </div>
              <h3 className="font-editorial text-xl">{t.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="jom-btn py-1.5 px-2.5 shrink-0"
            title="Close JomAI"
          >
            <X size={15} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-0.5">
                  <span className="jom-kicker">
                    {isUser
                      ? language === 'ENG'
                        ? 'You'
                        : 'Anda'
                      : 'JomAI'}
                  </span>
                  {!isUser && (
                    <span className="jom-tag jom-tag-shariah">
                      {language === 'ENG' ? 'Plain-English Guide' : 'Panduan Mudah'}
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 border text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    message.isTabular ? 'font-tabular' : ''
                  }`}
                  style={
                    isUser
                      ? {
                          backgroundColor: 'var(--accent-brand)',
                          color: '#FFFFFF',
                          borderColor: 'var(--accent-brand)'
                        }
                      : {
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--ink-primary)',
                          borderColor: 'var(--border-hairline)'
                        }
                  }
                >
                  {message.content}
                </div>

                {/* Clickable Referenced Stock Chips */}
                {!isUser &&
                  message.referencedTickers &&
                  message.referencedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {message.referencedTickers.map(ticker => {
                        const matchedStock = stocks.find(s => s.ticker === ticker);
                        return (
                          <button
                            key={ticker}
                            type="button"
                            onClick={() => handleTickerPillClick(ticker)}
                            className="jom-tag jom-tag-shariah font-tabular cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-1"
                            title={
                              matchedStock
                                ? `${matchedStock.name} (RM ${matchedStock.price})`
                                : ticker
                            }
                          >
                            <span>
                              {ticker}
                              {matchedStock ? ` · RM ${matchedStock.price}` : ''}
                            </span>
                            <ArrowUpRight size={10} />
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="jom-kicker mb-1">JomAI</div>
              <div
                className="jom-panel-subtle px-3.5 py-2.5 text-xs flex items-center gap-2"
                style={{ color: 'var(--ink-secondary)' }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>
                  {language === 'ENG'
                    ? 'Looking up Bursa numbers...'
                    : 'Menyemak data Bursa...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Starter Question Pills */}
        <div
          className="px-5 py-3 border-t space-y-2"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="jom-kicker">{t.quickPromptsLabel}</div>
          <div className="flex flex-wrap gap-1.5">
            {t.quickReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                className="jom-btn py-1 px-2.5 text-xs"
                disabled={isTyping}
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div
          className="p-4 border-t flex items-center gap-2"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isTyping
                ? language === 'ENG'
                  ? 'JomAI is thinking...'
                  : 'JomAI sedang menyemak...'
                : t.placeholder
            }
            disabled={isTyping}
            className="jom-input flex-1"
          />
          <button
            type="button"
            className="jom-btn jom-btn-primary py-2.5 px-3.5"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
          >
            <Send size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}
