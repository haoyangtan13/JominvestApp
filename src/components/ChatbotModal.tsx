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
      ? `Greetings, ${firstName}. JomAI Research Copilot is synchronized with ${stocks.length} Bursa Malaysia securities and your live portfolio ledger. Query any issuer ticker, compare multiples, audit sector concentration, or verify SAC Shariah standing.`
      : `Salam sejahtera, ${firstName}. Pembantu Penyelidikan JomAI diselaraskan dengan ${stocks.length} sekuriti Bursa Malaysia dan lejar portfolio anda. Tanya mengenai sebarang saham, perbandingan gandaan, atau saringan Syariah MPS.`;

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
      kicker: 'JOMAI · BURSA RESEARCH COPILOT',
      title: 'Institutional Research & Ledger Desk',
      placeholder: 'Query ticker (e.g. MAYBANK, TENAGA), compare multiples, or audit portfolio...',
      quickPromptsLabel: 'RESEARCH PROMPTS',
      quickReplies: [
        'Audit my portfolio',
        'Top dividend yields',
        'SAC Shariah issuers',
        'Compare MAYBANK vs CIMB',
        'Bursa contract fee schedule'
      ]
    },
    BM: {
      kicker: 'JOMAI · PEMBANTU PENYELIDIKAN BURSA',
      title: 'Meja Penyelidikan & Lejar Institusi',
      placeholder: 'Tanya kaunter (cth. MAYBANK, TENAGA), bandingkan gandaan, atau audit portfolio...',
      quickPromptsLabel: 'ARAHAN PANTAS',
      quickReplies: [
        'Audit portfolio saya',
        'Hasil dividen tertinggi',
        'Sekuriti patuh Syariah MPS',
        'Bandingkan MAYBANK vs CIMB',
        'Jadual yuran kontrak Bursa'
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
        isTabular: true,
        provider: response.provider,
        referencedTickers: response.referencedTickers
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch {
      const fallbackText =
        language === 'ENG'
          ? `JomAI Research Copilot encountered a temporary connection interruption. Please retry your query on any of our ${stocks.length} Bursa Malaysia issuers.`
          : `Pembantu Penyelidikan JomAI mengalami gangguan sambungan sementara. Sila cuba semula pertanyaan anda.`;
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
        ? `Provide an institutional research brief on ${ticker}`
        : `Berikan nota penyelidikan institusi untuk ${ticker}`
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

      {/* Slide-Over Research Copilot Drawer */}
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
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="jom-kicker">{t.kicker}</span>
              <span className="jom-tag jom-tag-shariah">KLSE DATA LINKED</span>
            </div>
            <h3 className="font-editorial text-2xl">{t.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="jom-btn py-1.5 px-2.5 shrink-0"
            title="Close Copilot Drawer"
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
                    {isUser ? 'INVESTOR QUERY' : 'JOMAI DESK NOTE'}
                  </span>
                  {!isUser && (
                    <span className="jom-tag font-tabular">
                      JOMAI VERIFIED
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[92%] rounded-lg p-3.5 border text-xs leading-relaxed whitespace-pre-line ${
                    message.isTabular ? 'font-tabular' : ''
                  }`}
                  style={
                    isUser
                      ? {
                          backgroundColor: 'var(--ink-primary)',
                          color: 'var(--ink-inverse)',
                          borderColor: 'var(--ink-primary)'
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

                {/* Clickable Referenced Ticker Pills */}
                {!isUser &&
                  message.referencedTickers &&
                  message.referencedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {message.referencedTickers.map(ticker => {
                        const matchedStock = stocks.find(s => s.ticker === ticker);
                        return (
                          <button
                            key={ticker}
                            type="button"
                            onClick={() => handleTickerPillClick(ticker)}
                            className="jom-tag font-tabular cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-1"
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
              <div className="jom-kicker mb-1">JOMAI DESK NOTE</div>
              <div
                className="jom-panel-subtle px-3.5 py-2.5 font-tabular text-xs flex items-center gap-2"
                style={{ color: 'var(--ink-secondary)' }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>SYNTHESIS IN PROGRESS...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Pills */}
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
            placeholder={isTyping ? 'SYNTHESIS IN PROGRESS...' : t.placeholder}
            disabled={isTyping}
            className="jom-input flex-1"
          />
          <button
            type="button"
            className="jom-btn jom-btn-primary py-2 px-3.5"
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
