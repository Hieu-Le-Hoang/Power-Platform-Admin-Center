import React from 'react';
import type { View, Theme } from '../../types';
import { FormattedDate, ManagedIndicator } from './TableComponents';

interface ViewTableProps {
  views: View[];
  onRowClick: (view: View) => void;
  theme: Theme;
}

export const ViewTable: React.FC<ViewTableProps> = ({ views, onRowClick, theme }) => {
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
            <span>View Name</span>
            <span className="w-48 text-left">Table</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-32 text-left">Managed</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {views.map((view) => (
                <div 
                    key={view.savedqueryid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(view)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(view)}
                    aria-label={`View details for ${view.name}`}
                >
                    <div>
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{view.name}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{view.description || 'No description'}</p>
                    </div>
                    <p className={`w-48 text-left text-sm font-mono ${currentTheme.secondaryText}`}>{view.returnedtypecode}</p>
                    <p className={`w-40 text-left text-sm ${currentTheme.text}`}>{view.queryTypeName}</p>
                    <div className="w-32 text-left"><ManagedIndicator isManaged={view.isManagedText} theme={theme} /></div>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={view.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};
