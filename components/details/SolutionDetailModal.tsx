import React, { useEffect, useState } from 'react';
import type { Solution, Theme } from '../../types';
import { CloseIcon, LoadingIcon, SparklesIcon } from '../IconComponents';
import { summarizeSolution } from '../../services/geminiService';
import { DetailItem, GeminiMarkdown } from './DetailComponents';

interface SolutionDetailModalProps {
  solution: Solution | null;
  onClose: () => void;
  theme: Theme;
}

export const SolutionDetailModal: React.FC<SolutionDetailModalProps> = ({ solution, onClose, theme }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    setIsSummarizing(false);
  }, [solution]);

  const handleGenerateSummary = async () => {
    if (!solution) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const result = await summarizeSolution(solution);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error) {
        setSummaryError(err.message);
      } else {
        setSummaryError('An unknown error occurred while generating the summary.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const isVisible = !!solution;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
      summaryBg: 'bg-[#0B253A]/80',
      loadingBg: 'bg-[#0B253A]',
      focusRing: 'focus:ring-offset-[#0B253A]',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
      summaryBg: 'bg-gray-100/80',
      loadingBg: 'bg-gray-100',
      focusRing: 'focus:ring-offset-white',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title-solution"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {solution && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-solution" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{solution.friendlyname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={solution.description} theme={theme} />
              <DetailItem label="Unique Name" value={solution.uniquename} theme={theme}/>
              <DetailItem label="Publisher" value={solution.publisherName} theme={theme}/>
              <DetailItem label="Version" value={solution.version} theme={theme}/>
              <DetailItem label="Type" value={solution.isManagedText} theme={theme}/>
              <DetailItem label="Last Modified" value={new Date(solution.modifiedon).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${currentTheme.border}`}>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="h-5 w-5 text-indigo-400" />
                    <p className={`text-sm font-medium ${currentTheme.secondaryText}`}>AI-Powered Summary</p>
                </div>
                
                {!summary && !isSummarizing && !summaryError && (
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className={`w-full flex justify-center items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.focusRing} focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Generate Summary
                    </button>
                )}

                {isSummarizing && (
                    <div className={`flex items-center justify-center gap-4 p-4 ${currentTheme.loadingBg} rounded-lg`}>
                        <LoadingIcon className="h-6 w-6" />
                        <span className={currentTheme.secondaryText}>Analyzing solution...</span>
                    </div>
                )}

                {summaryError && (
                    <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                        <p className="font-bold">Summary Failed</p>
                        <p className="text-sm mt-1">{summaryError}</p>
                    </div>
                )}
                
                {summary && (
                    <div className={`p-4 ${currentTheme.summaryBg} rounded-lg border ${currentTheme.border}`}>
                        <GeminiMarkdown text={summary} theme={theme} />
                    </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};