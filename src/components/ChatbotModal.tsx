import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
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
      title: 'JomAI Assistant',
      placeholder: 'Ask JomAI...',
      quickReplies: ['Analyze a stock', 'What is a dividend?', 'Contact Support'],
    },
    BM: {
      title: 'Pembantu JomAI',
      placeholder: 'Tanya JomAI...',
      quickReplies: ['Analisis saham', 'Apakah dividen?', 'Hubungi Sokongan'],
    }
  };

  const t = texts[language];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const newUserMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Delay & Reply
    setTimeout(() => {
      let aiResponse = "";
      const lowerText = text.toLowerCase();

      // Specific Logic for Quick Replies
      if (lowerText.includes('analyze') || lowerText.includes('analisis')) {
        aiResponse = language === 'ENG'
          ? "To analyze a stock, you can use the 'JomRingkas' tool in the Educational Hub or visit the Stock Details page for deep insights."
          : "Untuk menganalisis saham, anda boleh menggunakan alat 'JomRingkas' di Hab Pendidikan atau melawat halaman Maklumat Saham.";
      }
      else if (lowerText.includes('dividend') || lowerText.includes('dividen')) {
        aiResponse = language === 'ENG'
          ? "A dividend is a portion of a company's profit paid to shareholders. It is usually paid quarterly. High yield stocks are great for passive income!"
          : "Dividen adalah sebahagian daripada keuntungan syarikat yang dibayar kepada pemegang saham. Ia biasanya dibayar setiap suku tahun.";
      }
      else if (lowerText.includes('support') || lowerText.includes('sokongan')) {
        aiResponse = language === 'ENG'
          ? "You can reach our support team at support@jominvest.com or call 1-800-JOM-INVEST. We are here to help!"
          : "Anda boleh menghubungi pasukan sokongan kami di support@jominvest.com atau hubungi 1-800-JOM-INVEST. Kami sedia membantu!";
      }
      else {
        // Fallback to random responses
        const responses = [
          "That's an interesting question! Based on my data, the market is bullish.",
          "I recommend checking the 'JomRingkas' tool for a detailed report.",
          "Diversification is key to reducing risk. Have you looked at the sector breakdown?",
          "Tenaga Nasional is showing strong dividend potential this year.",
          "I'm just a demo AI for now, but I'm learning fast! 🚀",
          "Could you clarify that? I want to make sure I give you the best investment advice."
        ];
        aiResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      const newAiMsg: Message = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg">{t.title}</h3>
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
                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-500 text-xs italic">
                JomAI is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">
            {language === 'ENG' ? 'Quick Replies:' : 'Balasan Pantas:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTyping ? "JomAI is typing..." : t.placeholder}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              className="bg-green-600 hover:bg-green-700"
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
