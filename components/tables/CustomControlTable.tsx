import React from 'react';
import type { CustomControl, Theme } from '../../types';
import { FormattedDate } from './TableComponents';

interface CustomControlTableProps {
  controls: CustomControl[];
  onRowClick: (control: CustomControl) => void;
  theme: Theme;
}

export const CustomControlTable: React.FC<CustomControlTableProps> = ({ controls, onRowClick, theme }) => {
  const themeStyles = {
    dark: {
      headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]',
      rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]',
      text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]',
    },
    light: {
      headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200',
      rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100',
      text: 'text-gray-900', secondaryText: 'text-gray-500',
    },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name</span>
            <span className="w-24 text-left">Version</span>
            <span className="text-left">Compatible Data Types</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {controls.map((control) => (
                <div 
                    key={control.customcontrolid} 
                    className={`grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(control)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRowClick(control)}
                    aria-label={`View details for ${control.name}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{control.name}</p>
                    </div>
                    <div className={`w-24 text-left text-sm ${currentTheme.secondaryText}`}>
                        {control.version}
                    </div>
                    <div className={`w-full text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {control.compatibledatatypes || 'N/A'}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={control.modifiedon} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
