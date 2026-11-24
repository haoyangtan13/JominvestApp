import { Switch } from './ui/switch';
import { GraduationCap } from 'lucide-react';

interface StudentModeToggleProps {
  isStudentMode: boolean;
  onToggle: (checked: boolean) => void;
  language: 'ENG' | 'BM';
}

export function StudentModeToggle({ isStudentMode, onToggle, language }: StudentModeToggleProps) {
  const t = {
    ENG: { label: 'Student Mode', desc: 'Learn as you go' },
    BM: { label: 'Mod Pelajar', desc: 'Belajar sambil guna' },
  };

  const text = t[language];

  return (
    <div
      className="jomi-cluster"
      style={{
        padding: '0.45rem 0.9rem',
        borderRadius: '9999px',
        backgroundColor: isStudentMode ? 'var(--jomi-emerald-soft)' : 'var(--jomi-canvas)',
        border: `2px solid ${isStudentMode ? 'var(--jomi-emerald-border)' : 'var(--jomi-border)'}`,
      }}
    >
      <div
        style={{
          width: '1.85rem',
          height: '1.85rem',
          borderRadius: '9999px',
          backgroundColor: isStudentMode ? 'var(--jomi-emerald)' : 'var(--jomi-border)',
          color: isStudentMode ? '#ffffff' : 'var(--jomi-muted-ink)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GraduationCap size={16} />
      </div>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{text.label}</div>
        <div className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>{text.desc}</div>
      </div>
      <Switch checked={isStudentMode} onCheckedChange={onToggle} />
    </div>
  );
}
