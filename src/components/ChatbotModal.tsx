import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { askJomAI } from '../services/aiService';
import type { StockData } from '../data/stocks';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ENG' | 'BM';
  cashRM?: string;
  portfolioSummary?: string;
  userProfile?: string;
  stocks?: StockData[];
}

interface Message {
  role: 'ai' | 'user';
  content: string;
}

const initialMessages: Message[] = [
  {
    role: 'ai',
    content: 'Hi Tan! Ask me about any of our 20 Bursa Malaysia stocks (e.g. MAYBANK, TENAGA, GAMUDA), Shariah counters, dividends, or your virtual cash!',
  },
];

export function ChatbotModal({
  isOpen,
  onClose,
  language,
  cashRM = '10,000.00',
  portfolioSummary = '0 positions',
  userProfile = 'Jom-Explorer',
  stocks,
}: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastSource, setLastSource] = useState<'live-ai' | 'local-analyst' | null>(null);

  const texts = {
    ENG: {
      title: 'JomAI Coach',
      subtitle: 'Live Bursa data, Malaysian news & multi-turn AI',
      placeholder: 'Ask about Bursa news, MAYBANK vs PBBANK, or your cash...',
      quickLabel: 'Quick Prompts:',
      typing: 'JomAI is checking live market & news...',
      quickReplies: ["Today's Bursa news", 'Analyze TENAGA', 'Compare MAYBANK vs PBBANK', 'Shariah stocks', 'My portfolio'],
    },
    BM: {
      title: 'Jurulatih JomAI',
      subtitle: 'Data Bursa langsung, berita Malaysia & AI berbilang pusingan',
      placeholder: 'Tanya berita Bursa, MAYBANK vs PBBANK, atau baki anda...',
      quickLabel: 'Soalan Pantas:',
      typing: 'JomAI sedang menyemak pasaran & berita...',
      quickReplies: ['Berita Bursa hari ini', 'Analisis TENAGA', 'Banding MAYBANK vs PBBANK', 'Saham Syariah', 'Portfolio saya'],
    },
  };

  const t = texts[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const clean = text.trim();
    const recentHistory = messages.slice(-6);
    setMessages((prev) => [...prev, { role: 'user', content: clean }]);
    setInputValue('');
    setIsTyping(true);

    const { reply, source } = await askJomAI(clean, {
      language,
      cashRM,
      portfolioSummary,
      userProfile,
      stocks,
      history: recentHistory,
    });

    setLastSource(source);
    setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSendMessage(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="jomi-modal-backdrop" onClick={onClose}>
      <div
        className="jomi-chat-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.title}
      >
        {/* Header */}
        <div className="jomi-chat-header">
          <div className="jomi-cluster">
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
                <h3 className="jomi-display" style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700 }}>
                  {t.title}
                </h3>
                {lastSource && (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: lastSource === 'live-ai' ? 'rgba(255,255,255,0.22)' : 'rgba(15,41,38,0.35)',
                      color: '#ffffff',
                    }}
                  >
                    {lastSource === 'live-ai' ? 'Live AI' : 'Offline'}
                  </span>
                )}
              </div>
              <p style={{ color: '#ccfbf1', fontSize: '0.72rem', fontWeight: 600 }}>{t.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="jomi-btn jomi-btn-ghost jomi-btn-icon"
            style={{ color: '#ffffff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="jomi-stack-sm">
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div className={message.role === 'user' ? 'jomi-chat-bubble-user' : 'jomi-chat-bubble-ai'}>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="jomi-chat-bubble-ai jomi-muted" style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                {t.typing}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div style={{ padding: '0.5rem 1rem 0.65rem', borderTop: '1.5px solid var(--jomi-border)', backgroundColor: '#fafdfc' }}>
          <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
            {t.quickLabel}
          </p>
          <div className="jomi-cluster">
            {t.quickReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                className="jomi-btn jomi-btn-outline jomi-btn-sm"
                onClick={() => void handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '0.75rem 1rem 0.65rem', borderTop: '2px solid var(--jomi-border)' }} className="jomi-stack-xs">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              maxLength={500}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTyping ? t.typing : t.placeholder}
              className="jomi-input"
              disabled={isTyping}
            />
            <button
              type="button"
              className="jomi-btn jomi-btn-primary jomi-btn-icon"
              style={{ height: '2.85rem', width: '2.85rem' }}
              onClick={() => void handleSendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </div>
          <p className="jomi-muted" style={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center' }}>
            {language === 'ENG'
              ? 'Educational sandbox tutor only — not licensed financial advice.'
              : 'Tutor simulasi pendidikan sahaja — bukan nasihat kewangan berlesen.'}
          </p>
        </div>
      </div>
    </div>
  );
}
