import React from 'react';
import type { SiteMap, Theme } from '../../types';
import { FormattedDate, ManagedIndicator } from './TableComponents';

interface SiteMapTableProps {
  sitemaps: SiteMap[];
  onRowClick: (sitemap: SiteMap) => void;
  theme: Theme;
}

export const SiteMapTable: React.FC<SiteMapTableProps> = ({ sitemaps, onRowClick, theme }) => {
  const themeStyles = {
    dark: { headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]', rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]' },
    light: { headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200', rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100', text: 'text-gray-900', secondaryText: 'text-gray-500' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name</span>
            <span className="w-40 text-left">Version</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {sitemaps.map((sitemap) => (
                <div 
                    key={sitemap.sitemapid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(sitemap)}
                >
                    <p className={`font-semibold ${currentTheme.text} truncate`}>{sitemap.sitemapname || 'No Name'}</p>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>{sitemap.versionnumber}</p>
                    <div className="w-40 text-left"><ManagedIndicator isManaged={sitemap.isManagedText} theme={theme} /></div>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={sitemap.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};
