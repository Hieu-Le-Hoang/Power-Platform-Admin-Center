import React from 'react';
import type { AuditLog, Theme } from '../../types';
import { FormattedDate, CopyRecordId, ActionIndicator } from './TableComponents';

interface AuditLogTableProps {
  logs: AuditLog[];
  onRowClick: (log: AuditLog) => void;
  theme: Theme;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[auto_1fr_1fr_auto_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span className="w-48 text-left">Timestamp</span>
            <span className="text-left">User</span>
            <span className="text-left">Table</span>
            <span className="w-24 text-left">Action</span>
            <span className="text-left">Changes</span>
            <span className="w-16 text-center">ID</span>
        </div>
        <div>
            {logs.map((log) => (
                <div 
                    key={log.id} 
                    className={`grid grid-cols-[auto_1fr_1fr_auto_1fr_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(log)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(log)}
                    aria-label={`View details for audit log on ${log.tableName} at ${log.timestamp.toLocaleString()}`}
                >
                    <div className={`w-48 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={log.timestamp} />
                    </div>
                     <div className={`text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {log.user.name || 'N/A'}
                    </div>
                    <div className={`truncate font-mono text-sm ${currentTheme.text}`}>
                        {log.tableName}
                    </div>
                    <div className="w-24 text-left">
                       <ActionIndicator action={log.action} theme={theme} />
                    </div>
                    <div className={`truncate text-sm ${currentTheme.secondaryText}`}>
                       {log.changeSummary}
                    </div>
                    <div className="w-16 flex justify-center items-center">
                        <CopyRecordId recordId={log.recordId} theme={theme} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
