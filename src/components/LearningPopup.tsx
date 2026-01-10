import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { BookOpen, Lightbulb } from 'lucide-react';
import { Button } from "./ui/button";

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
            <DialogContent className="sm:max-w-md bg-white border-2 border-blue-400 shadow-xl z-[100]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <BookOpen className="text-blue-600" size={20} />
                        </div>
                        <DialogTitle className="text-xl font-bold text-blue-900">
                            {language === 'ENG' ? 'Jom-Learn: ' : 'Jom-Belajar: '} {term}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex gap-2 mb-2">
                            <Lightbulb className="text-amber-500 flex-shrink-0" size={18} />
                            <h4 className="font-semibold text-blue-800">
                                {language === 'ENG' ? 'Simple Explanation' : 'Penerangan Mudah'}
                            </h4>
                        </div>
                        <p className="text-blue-900 leading-relaxed">
                            {definition[language].simple}
                        </p>
                    </div>

                    <DialogDescription className="text-gray-600 text-sm">
                        {definition[language].detail}
                    </DialogDescription>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                        {language === 'ENG' ? 'Got it!' : 'Faham!'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
