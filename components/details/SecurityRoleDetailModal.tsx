import React, { useEffect } from 'react';
import type { SecurityRole, Theme } from '../../types';
import { CloseIcon } from '../IconComponents';
import { DetailItem } from './DetailComponents';

interface SecurityRoleDetailModalProps {
  role: SecurityRole | null;
  onClose: () => void;
  theme: Theme;
}

export const SecurityRoleDetailModal: React.FC<SecurityRoleDetailModalProps> = ({ role, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!role;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-role"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {role && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-role" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{role.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Role Name" value={role.name} theme={theme} />
              <DetailItem label="Business Unit" value={role['_businessunitid_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Type" value={role.isManagedText} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(role.modifiedon).toLocaleString()} theme={theme} />
              <DetailItem label="Role ID" value={role.roleid} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};