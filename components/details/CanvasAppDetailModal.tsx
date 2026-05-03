import React, { useEffect } from 'react';
import type { CanvasApp, Theme } from '../../types';
import { CloseIcon } from '../IconComponents';
import { DetailItem, TechnicalDetailBox } from './DetailComponents';

interface CanvasAppDetailModalProps {
  app: CanvasApp | null;
  onClose: () => void;
  theme: Theme;
}

export const CanvasAppDetailModal: React.FC<CanvasAppDetailModalProps> = ({ app, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!app;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
      secondaryText: 'text-gray-500', headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-canvasapp"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {app && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-canvasapp" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{app.displayname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={app.description} theme={theme} />
              <DetailItem label="Version" value={app.versionnumber} theme={theme} />
              <DetailItem label="App ID" value={app.canvasappid} theme={theme} />
              <DetailItem label="Internal Name" value={<code className="font-mono">{app.name}</code>} theme={theme} />
              <DetailItem label="Owner" value={app['_ownerid_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Created Time" value={new Date(app.createdtime).toLocaleString()} theme={theme}/>
              <DetailItem label="Last Modified Time" value={new Date(app.lastmodifiedtime).toLocaleString()} theme={theme}/>
              <DetailItem label="Last Published Time" value={new Date(app.lastpublishtime).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>Open App</p>
                <a href={app.appopenuri} target="_blank" rel="noopener noreferrer" className={`mt-1 text-base break-all ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>
                    {app.appopenuri}
                </a>
             </div>
             <TechnicalDetailBox title="Commit Message" data={app.commitmessage} theme={theme}/>
             <TechnicalDetailBox title="Database References" data={app.databasereferences} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};