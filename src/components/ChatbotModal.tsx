import { useState } from 'react';
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
  const [messages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

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
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
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
                className="text-xs"
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
              placeholder={t.placeholder}
              className="flex-1"
            />
            <Button className="bg-green-600 hover:bg-green-700">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
