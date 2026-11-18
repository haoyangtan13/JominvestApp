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
      ? `Hi ${firstName}. Ask about any stock on Bursa Malaysia, compare dividend yields, or review your portfolio exposure.`
      : `Hai ${firstName}. Tanya tentang mana-mana saham di Bursa Malaysia, bandingkan hasil dividen, atau semak pendedahan portfolio anda.`;

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
      title: 'Research Assistant',
      placeholder: 'Ask about a company, dividend yield, or portfolio...',
      quickReplies: [
        'Compare Maybank and CIMB dividends',
        'Review my portfolio concentration',
        'Which stocks are Shariah-compliant?',
        'How are Bursa trading fees calculated?'
      ]
    },
    BM: {
      title: 'Pembantu Penyelidikan',
      placeholder: 'Tanya tentang syarikat, dividen, atau portfolio...',
      quickReplies: [
        'Bandingkan dividen Maybank dan CIMB',
        'Semak tumpuan portfolio saya',
        'Saham manakah yang patuh Syariah?',
        'Bagaimana yuran dagangan Bursa dikira?'
      ]
    }
  };

  const t = texts[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          ? 'Unable to reach the assistant right now. Please try your question again.'
          : 'Tidak dapat menghubungi pembantu buat masa ini. Sila cuba lagi.';
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

  const handleTickerClick = (ticker: string) => {
    const matched = stocks.find(s => s.ticker === ticker);
    if (matched && setSelectedStock && navigateTo) {
      setSelectedStock(matched);
      navigateTo('stock-details');
      onClose();
      return;
    }
    handleSendMessage(`Overview of ${ticker}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/35"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l flex flex-col shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink-primary)'
        }}
      >
        <div
          className="px-4 py-3.5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <h3 className="text-sm font-semibold">{t.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="jom-btn-ghost"
            title="Close"
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
                  className="max-w-[92%] rounded-lg p-3 text-xs leading-relaxed whitespace-pre-line"
                  style={
                    isUser
                      ? {
                          backgroundColor: 'var(--ink-primary)',
                          color: 'var(--ink-inverse)'
                        }
                      : {
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--ink-primary)'
                        }
                  }
                >
                  {message.content}
                </div>

                {!isUser &&
                  message.referencedTickers &&
                  message.referencedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.referencedTickers.map(ticker => {
                        const matchedStock = stocks.find(s => s.ticker === ticker);
                        return (
                          <button
                            key={ticker}
                            type="button"
                            onClick={() => handleTickerClick(ticker)}
                            className="rh-link-btn font-tabular inline-flex items-center gap-0.5"
                          >
                            <span>
                              {ticker}
                              {matchedStock ? ` (RM ${matchedStock.price})` : ''}
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
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <Loader2 size={13} className="animate-spin" />
              <span>{language === 'ENG' ? 'Checking data...' : 'Menyemak data...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          className="px-4 py-2.5 border-t space-y-1.5"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {t.quickReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                className="rh-link-btn text-left"
                disabled={isTyping}
                onClick={() => handleSendMessage(reply)}
              >
                {reply} →
              </button>
            ))}
          </div>
        </div>

        <div
          className="p-3.5 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            disabled={isTyping}
            className="jom-input flex-1 text-xs"
          />
          <button
            type="button"
            className="jom-btn jom-btn-primary py-2 px-3"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
          >
            <Send size={13} />
          </button>
        </div>
      </aside>
    </>
  );
}
