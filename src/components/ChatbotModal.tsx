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
      ? `Hi ${firstName}! I’m JomAI, your Bursa Malaysia study buddy. Ask me about any stock, compare dividends, check your diversification, or see which companies are Shariah-compliant.`
      : `Hai ${firstName}! Saya JomAI, rakan belajar Bursa Malaysia anda. Tanya saya tentang mana-mana saham, perbandingan dividen, kepelbagaian portfolio, atau status patuh Syariah.`;

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
      title: 'Ask JomAI',
      placeholder: 'Ask about a stock (e.g. Maybank, Tenaga), dividends, or your portfolio...',
      quickReplies: [
        'Is Maybank or CIMB better for dividends?',
        'Check my portfolio diversification',
        'Which Bursa stocks are Shariah-compliant?',
        'How do Bursa trading fees work?'
      ]
    },
    BM: {
      title: 'Tanya JomAI',
      placeholder: 'Tanya tentang saham (cth. Maybank, Tenaga), dividen, atau portfolio anda...',
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
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink-primary)'
        }}
      >
        <div
          className="p-4 border-b flex items-center justify-between gap-3"
          style={{
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="jom-avatar jom-avatar-emerald">AI</div>
            <div>
              <h3 className="text-base font-bold">{t.title}</h3>
              <p className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                {language === 'ENG' ? 'Bursa Malaysia Assistant' : 'Pembantu Bursa Malaysia'}
              </p>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
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

                {!isUser &&
                  message.referencedTickers &&
                  message.referencedTickers.length > 0 && (
                    <div className="rh-chip-row mt-2">
                      {message.referencedTickers.map(ticker => {
                        const matchedStock = stocks.find(s => s.ticker === ticker);
                        return (
                          <button
                            key={ticker}
                            type="button"
                            onClick={() => handleTickerPillClick(ticker)}
                            className="rh-chip font-tabular flex items-center gap-1 text-xs"
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
              <div
                className="rh-card px-3.5 py-2.5 text-xs flex items-center gap-2"
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

        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="rh-chip-row">
            {t.quickReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                className="rh-chip text-xs"
                disabled={isTyping}
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

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
