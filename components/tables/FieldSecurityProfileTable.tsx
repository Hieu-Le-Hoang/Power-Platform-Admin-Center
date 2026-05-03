import React from 'react';
import type { FieldSecurityProfile, Theme } from '../../types';
import { FormattedDate } from './TableComponents';

interface FieldSecurityProfileTableProps {
  profiles: FieldSecurityProfile[];
  onRowClick: (profile: FieldSecurityProfile) => void;
  theme: Theme;
}

export const FieldSecurityProfileTable: React.FC<FieldSecurityProfileTableProps> = ({ profiles, onRowClick, theme }) => {
  const themeStyles = {
    dark: { headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]', rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]' },
    light: { headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200', rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100', text: 'text-gray-900', secondaryText: 'text-gray-500' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Profile Name</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {profiles.map((profile) => (
                <div 
                    key={profile.fieldsecurityprofileid} 
                    className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(profile)}
                >
                    <div>
                      <p className={`font-semibold ${currentTheme.text} truncate`}>{profile.name}</p>
                      <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{profile.description || 'No description'}</p>
                    </div>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={profile.createdon} /></p>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={profile.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};
