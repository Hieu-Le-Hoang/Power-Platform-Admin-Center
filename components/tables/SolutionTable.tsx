import React from 'react';
import type { Solution, Theme } from '../../types';
import { FormattedDate, ManagedIndicator } from './TableComponents';

interface SolutionTableProps {
  solutions: Solution[];
  onRowClick: (solution: Solution) => void;
  theme: Theme;
}

export const SolutionTable: React.FC<SolutionTableProps> = ({ solutions, onRowClick, theme }) => {
  const themeStyles = {
    dark: {
      headerBg: 'bg-[#011627]',
      headerText: 'text-[#A7B1C2]',
      headerBorder: 'border-[#143B54]',
      rowBorder: 'border-[#143B54]',
      rowHover: 'hover:bg-[#0B253A]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
    },
    light: {
      headerBg: 'bg-gray-50',
      headerText: 'text-gray-500',
      headerBorder: 'border-gray-200',
      rowBorder: 'border-gray-200',
      rowHover: 'hover:bg-gray-100',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
    },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Unique Name</span>
            <span className="w-40 text-left">Version</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
            <span className="w-40 text-left">Publisher</span>
        </div>
        <div>
            {solutions.map((solution) => (
                <div 
                    key={solution.solutionid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(solution)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(solution)}
                    aria-label={`View details for ${solution.friendlyname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{solution.friendlyname}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{solution.uniquename || 'No unique name'}</p>
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        {solution.version}
                    </div>
                    <div className="w-40 text-left">
                       <ManagedIndicator isManaged={solution.isManagedText} theme={theme} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={solution.modifiedon} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {solution.publisherName || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
