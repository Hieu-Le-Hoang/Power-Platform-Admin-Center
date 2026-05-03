import React, { useEffect } from 'react';
import type { SiteMap, Theme } from '../../types';
import { CloseIcon } from '../IconComponents';
import { DetailItem, TechnicalDetailBox } from './DetailComponents';

interface SiteMapDetailModalProps {
  sitemap: SiteMap | null;
  onClose: () => void;
  theme: Theme;
}

export const SiteMapDetailModal: React.FC<SiteMapDetailModalProps> = ({ sitemap, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!sitemap;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-sitemap"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {sitemap && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-sitemap" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{sitemap.sitemapname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Sitemap Name" value={sitemap.sitemapname} theme={theme} />
              <DetailItem label="Type" value={sitemap.isManagedText} theme={theme} />
              <DetailItem label="Version" value={sitemap.versionnumber} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(sitemap.modifiedon).toLocaleString()} theme={theme} />
              <TechnicalDetailBox title="Sitemap XML" data={sitemap.sitemapxml} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};