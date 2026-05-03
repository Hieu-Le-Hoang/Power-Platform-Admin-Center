import React, { useState } from 'react';
import type { Theme } from '../../types';

export const DetailItem: React.FC<{ label: string; value: React.ReactNode; theme: Theme }> = ({ label, value, theme }) => (
    <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{label}</p>
        <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} break-words`}>{value || 'N/A'}</p>
    </div>
);

export const TechnicalDetailBox: React.FC<{ title: string; data: string | null | undefined; theme: Theme; showCopyButton?: boolean }> = ({ title, data, theme, showCopyButton = false }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(data).then(() => {
                setCopyStatus('Copied!');
                setTimeout(() => setCopyStatus('Copy'), 2000);
            }, () => {
                setCopyStatus('Failed!');
                setTimeout(() => setCopyStatus('Copy'), 2000);
            });
        }
    };
    
    if (!data && data !== '') return (
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{title}</p>
            <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'}`}>Not available</p>
        </div>
    );

    let formattedData = data;
    try {
        const parsed = JSON.parse(data);
        formattedData = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Not a JSON string, display as is
    }
    
    return (
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{title}</p>
                {showCopyButton && (
                    <button
                        onClick={handleCopy}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${theme === 'dark' ? 'bg-[#143B54] hover:bg-[#0B253A] text-[#A7B1C2]' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        {copyStatus}
                    </button>
                )}
            </div>
            <div className={`mt-1 ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-50'} rounded p-2 overflow-x-auto max-h-60 border ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <code className={`text-sm ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} whitespace-pre-wrap font-mono`}>{formattedData}</code>
            </div>
        </div>
    );
};

export const GeminiMarkdown: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentTitle = '';
    let currentBody: string[] = [];

    const flushSection = () => {
        if (currentTitle || currentBody.length > 0) {
            elements.push(
                <div key={currentTitle || Math.random()}>
                    {currentTitle && <p className={`font-semibold ${theme === 'dark' ? 'text-[#F3F4F6]' : 'text-gray-900'} mb-1`}>{currentTitle.replace(/:/g, '')}</p>}
                    <p className={theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}>{currentBody.join(' ')}</p>
                </div>
            );
        }
        currentTitle = '';
        currentBody = [];
    };

    lines.forEach((line) => {
        const titleMatch = line.match(/\*\*(.*?)\*\*/);
        if (titleMatch) {
            flushSection();
            currentTitle = titleMatch[1];
        } else if (line.trim()) {
            currentBody.push(line.trim());
        }
    });
    flushSection();

    return <div className="space-y-4 text-base">{elements}</div>;
};