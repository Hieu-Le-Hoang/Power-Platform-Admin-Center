import React, { useEffect } from 'react';
import type { WebResource, Theme } from '../../types';
import { CloseIcon } from '../IconComponents';
import { DetailItem, TechnicalDetailBox } from './DetailComponents';

const ContentViewer: React.FC<{ resource: WebResource; theme: Theme }> = ({ resource, theme }) => {
    const textBasedTypes = [1, 2, 3, 4, 10]; // HTML, CSS, JS, XML, SVG

    if (textBasedTypes.includes(resource.webresourcetype)) {
        let decodedContent = "Error decoding content.";
        try {
            // The content is Base64 encoded. We need to decode it.
            decodedContent = atob(resource.content);
        } catch (e) {
            console.error("Failed to decode base64 content:", e);
        }
        return <TechnicalDetailBox title="Content" data={decodedContent} theme={theme} showCopyButton={true} />;
    }

    return (
         <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>Content</p>
            <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'}`}>
                Binary content ({resource.typeName}) cannot be displayed.
            </p>
        </div>
    );
};

interface WebResourceDetailModalProps {
  resource: WebResource | null;
  onClose: () => void;
  theme: Theme;
}

export const WebResourceDetailModal: React.FC<WebResourceDetailModalProps> = ({ resource, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!resource;
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
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-webresource"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {resource && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-webresource" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{resource.displayname || resource.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Name" value={<code className="font-mono">{resource.name}</code>} theme={theme} />
              <DetailItem label="Description" value={resource.description} theme={theme} />
              <DetailItem label="Type" value={resource.typeName} theme={theme} />
              <DetailItem label="Created By" value={resource['_createdby_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(resource.modifiedon).toLocaleString()} theme={theme} />
              <ContentViewer resource={resource} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};