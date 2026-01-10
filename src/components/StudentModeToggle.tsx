import { Switch } from './ui/switch';
import { GraduationCap, BookOpen } from 'lucide-react';

interface StudentModeToggleProps {
    isStudentMode: boolean;
    onToggle: (checked: boolean) => void;
    language: 'ENG' | 'BM';
}

export function StudentModeToggle({ isStudentMode, onToggle, language }: StudentModeToggleProps) {
    const t = {
        ENG: {
            label: 'Student Mode',
            desc: 'Learn as you go'
        },
        BM: {
            label: 'Mod Pelajar',
            desc: 'Belajar sambil guna'
        }
    };

    const text = t[language];

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${isStudentMode ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100 border border-transparent'}`}>
            <div className={`p-1.5 rounded-full transition-colors ${isStudentMode ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                <GraduationCap size={18} />
            </div>
            <div className="flex flex-col">
                <span className={`text-sm font-bold leading-none ${isStudentMode ? 'text-blue-700' : 'text-gray-500'}`}>
                    {text.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-none mt-0.5">
                    {text.desc}
                </span>
            </div>
            <Switch
                checked={isStudentMode}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-blue-600"
            />
        </div>
    );
}
