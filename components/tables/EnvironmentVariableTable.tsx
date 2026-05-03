import React from 'react';
import type { EnvironmentVariable, Theme } from '../../types';

interface EnvironmentVariableTableProps {
  variables: EnvironmentVariable[];
  onRowClick: (variable: EnvironmentVariable) => void;
  theme: Theme;
}

export const EnvironmentVariableTable: React.FC<EnvironmentVariableTableProps> = ({ variables, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Display Name</span>
            <span>Schema Name</span>
            <span className="w-40 text-left">Type</span>
        </div>
        <div>
            {variables.map((variable) => (
                <div 
                    key={variable.environmentvariablevalueid} 
                    className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(variable)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(variable)}
                    aria-label={`View details for ${variable.displayname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{variable.displayname}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{variable.description || 'No description'}</p>
                    </div>
                    <div className={`truncate font-mono text-sm ${currentTheme.secondaryText}`}>
                        {variable.schemaname}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.text}`}>
                       {variable.typeName}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
