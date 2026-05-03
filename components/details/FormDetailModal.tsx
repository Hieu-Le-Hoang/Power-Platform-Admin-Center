import React, { useEffect } from 'react';
import type { Form, Theme } from '../../types';
import { CloseIcon } from '../IconComponents';
import { DetailItem, TechnicalDetailBox } from './DetailComponents';

interface FormDetailModalProps {
  form: Form | null;
  onClose: () => void;
  theme: Theme;
}

export const FormDetailModal: React.FC<FormDetailModalProps> = ({ form, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!form;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-form"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {form && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-form" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{form.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Form Name" value={form.name} theme={theme} />
              <DetailItem label="Description" value={form.description} theme={theme} />
              <DetailItem label="Table Name (Object Type Code)" value={form.objecttypecode} theme={theme} />
              <DetailItem label="Form Type" value={form.typeName} theme={theme} />
              <DetailItem label="Managed" value={form.isManagedText} theme={theme} />
              <TechnicalDetailBox title="Form XML" data={form.formxml} theme={theme} showCopyButton={true} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};