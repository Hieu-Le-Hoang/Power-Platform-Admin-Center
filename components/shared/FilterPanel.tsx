import React, { useEffect } from 'react';
import type { Theme } from '../../types';
import { CloseIcon } from '../IconComponents';

const themeStyles = {
    dark: {
        bg: 'bg-[#0B253A]',
        text: 'text-[#F3F4F6]',
        secondaryText: 'text-[#A7B1C2]',
        inputBg: 'bg-[#011627]',
        focusRing: 'focus:ring-[#2563EB]',
        sidebarButtonBg: 'bg-[#0B253A]',
        sidebarButtonHover: 'hover:bg-[#143B54]',
        sidebarRingOffset: 'focus:ring-offset-[#011627]',
    },
    light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        secondaryText: 'text-gray-500',
        inputBg: 'bg-gray-200',
        focusRing: 'focus:ring-indigo-500',
        sidebarButtonBg: 'bg-gray-200',
        sidebarButtonHover: 'hover:bg-gray-300',
        sidebarRingOffset: 'focus:ring-offset-gray-100',
    }
};

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    children: React.ReactNode;
    theme: Theme;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, onClear, children, theme }) => {
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
            className={`fixed inset-0 z-40 transition-colors duration-300 ease-in-out ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0`}>
                    <h2 id="filter-panel-title" className={`text-lg font-semibold ${currentTheme.text}`}>Filters & Sorting</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close filter panel">
                        <CloseIcon />
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto flex-grow">
                    {children}
                </main>
                
                <footer className={`flex justify-between items-center p-4 border-t ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0 bg-opacity-50 ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-50'}`}>
                    <button
                        onClick={onClear}
                        className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-600 hover:text-black'}`}
                    >
                        Clear all
                    </button>
                    <button
                        onClick={onApply}
                        className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8] focus:ring-offset-[#0B253A]' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-white'} focus:ring-[#2563EB]`}
                    >
                        Apply
                    </button>
                </footer>
            </div>
        </div>
    );
};
