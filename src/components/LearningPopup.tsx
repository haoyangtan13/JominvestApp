import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { BookOpen, Lightbulb } from 'lucide-react';

interface LearningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  definition: {
    ENG: { simple: string; detail: string };
    BM: { simple: string; detail: string };
  };
  language: 'ENG' | 'BM';
}

export function LearningPopup({ isOpen, onClose, term, definition, language }: LearningPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="jomi-card jomi-card-pad" style={{ maxWidth: '460px' }}>
        <DialogHeader>
          <div className="jomi-cluster" style={{ marginBottom: '0.35rem' }}>
            <div className="jomi-ticker-badge">
              <BookOpen size={18} />
            </div>
            <DialogTitle className="jomi-display jomi-title-md">
              {language === 'ENG' ? 'Jom-Learn: ' : 'Jom-Belajar: '} {term}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="jomi-stack-md">
          <div className="jomi-card-gold jomi-stack-xs">
            <div className="jomi-cluster" style={{ color: 'var(--jomi-gold-ink)', fontWeight: 800, fontSize: '0.85rem' }}>
              <Lightbulb size={16} color="#b45309" />
              <span>{language === 'ENG' ? 'Simple Explanation' : 'Penerangan Mudah'}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{definition[language].simple}</p>
          </div>

          <DialogDescription className="jomi-text-sm jomi-muted" style={{ fontWeight: 600 }}>
            {definition[language].detail}
          </DialogDescription>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="jomi-btn jomi-btn-primary">
              {language === 'ENG' ? 'Got it!' : 'Faham!'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
