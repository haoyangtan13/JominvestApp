import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ENG' | 'BM';
}

interface Message {
  role: 'ai' | 'user';
  content: string;
}

const initialMessages: Message[] = [
  {
    role: 'ai',
    content: 'Hi Tan! How can I help you today?'
  },
  {
    role: 'user',
    content: "What is Tenaga Nasional's P/E ratio?"
  },
  {
    role: 'ai',
    content: "Tenaga Nasional (TENAGA) has a P/E ratio of 14.2. This is a common metric to value a company. Would you like to learn more about P/E Ratios?"
  }
];

export function ChatbotModal({ isOpen, onClose, language }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const texts = {
    ENG: {
      title: 'JomAI Coach',
      subtitle: 'Ask anything about Bursa stocks',
      placeholder: 'Ask JomAI...',
      quickLabel: 'Quick Replies:',
      typing: 'JomAI is thinking...',
      quickReplies: ['Analyze a stock', 'What is a dividend?', 'Contact Support'],
    },
    BM: {
      title: 'Jurulatih JomAI',
      subtitle: 'Tanya apa sahaja tentang saham Bursa',
      placeholder: 'Tanya JomAI...',
      quickLabel: 'Balasan Pantas:',
      typing: 'JomAI sedang menaip...',
      quickReplies: ['Analisis saham', 'Apakah dividen?', 'Hubungi Sokongan'],
    }
  };

  const t = texts[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = '';
      const lowerText = text.toLowerCase();

      if (lowerText.includes('analyze') || lowerText.includes('analisis')) {
        aiResponse = language === 'ENG'
          ? "To analyze a stock, try 'JomRingkas' in the Educational Hub or click any stock card for deep insights and +10 XP learning tips."
          : "Untuk menganalisis saham, cuba alat 'JomRingkas' di Hab Pendidikan atau klik mana-mana kad saham untuk maklumat terperinci.";
      } else if (lowerText.includes('dividend') || lowerText.includes('dividen')) {
        aiResponse = language === 'ENG'
          ? "A dividend is a portion of a company's profit paid to shareholders. High-yield blue chips like MAYBANK (~6.2%) are popular for steady income!"
          : "Dividen adalah sebahagian daripada keuntungan syarikat yang dibayar kepada pemegang saham. Saham dividen tinggi sesuai untuk pendapatan pasif!";
      } else if (lowerText.includes('support') || lowerText.includes('sokongan')) {
        aiResponse = language === 'ENG'
          ? "You can reach our support team at support@jominvest.com or call 1-800-JOM-INVEST. We are here to help!"
          : "Anda boleh menghubungi pasukan sokongan kami di support@jominvest.com atau hubungi 1-800-JOM-INVEST. Kami sedia membantu!";
      } else {
        const responses = [
          "Great question! Diversification across sectors helps protect your portfolio from single-stock dips.",
          "Try running 'JomRingkas' in the Learn tab for an instant executive summary of annual reports.",
          "Check a stock's P/E Ratio and Dividend Yield before buying — tapping them in Stock Details gives you +10 XP!",
          "Tenaga Nasional and Maybank are showing steady fundamentals in our Bursa tracker.",
          "Could you tell me which Bursa stock or investing concept you'd like to explore?"
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
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
              <h3 className="jomi-display" style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700 }}>
                {t.title}
              </h3>
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
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '0.85rem 1rem', borderTop: '2px solid var(--jomi-border)', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
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
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
