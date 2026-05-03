import React from 'react';
import type { Theme } from '../../types';

interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onNext: () => void;
    onPrev: () => void;
    hasNextPage: boolean;
    theme: Theme;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onNext, onPrev, hasNextPage, theme }) => {
    if (totalCount <= 0 && currentPage === 1 && !hasNextPage) return null;

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : startIndex + pageSize -1;

    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = !hasNextPage;
    
    const themeStyles = {
        dark: { text: 'text-[#A7B1C2]', strongText: 'text-[#F3F4F6]', button: 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54]' },
        light: { text: 'text-gray-500', strongText: 'text-gray-900', button: 'bg-gray-200 border-gray-200 hover:bg-gray-300' }
    };
    const currentTheme = themeStyles[theme];

    return (
        <div className={`flex items-center justify-between text-sm ${currentTheme.text} flex-wrap gap-4`}>
            <div>
                Showing <span className={`font-semibold ${currentTheme.strongText}`}>{startIndex}</span> to <span className={`font-semibold ${currentTheme.strongText}`}>{endIndex}</span>
                {totalCount > 0 && ` of ${totalCount.toLocaleString()} results`}
            </div>
            <div className="flex items-center space-x-4">
                <span>Page <span className={`font-semibold ${currentTheme.strongText}`}>{currentPage}</span>{totalCount > 0 && totalPages > 0 ? ` of ${totalPages.toLocaleString()}` : ''}</span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onPrev}
                        disabled={isPrevDisabled}
                        className={`px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${currentTheme.button}`}
                        aria-label="Go to previous page"
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={`px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${currentTheme.button}`}
                        aria-label="Go to next page"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
