import React from 'react';
import type { ConnectionReference, Theme } from '../../types';
import { FormattedDate } from './TableComponents';

interface ConnectionReferenceTableProps {
  connections: ConnectionReference[];
  onRowClick: (connection: ConnectionReference) => void;
  theme: Theme;
}

export const ConnectionReferenceTable: React.FC<ConnectionReferenceTableProps> = ({ connections, onRowClick, theme }) => {
  const themeStyles = {
    dark: { headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]', rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]' },
    light: { headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200', rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100', text: 'text-gray-900', secondaryText: 'text-gray-500' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Logical Name</span>
            <span>Connector ID</span>
            <span className="w-40 text-left">Owner</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {connections.map((conn) => (
                <div 
                    key={conn.connectionreferenceid} 
                    className={`grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(conn)}
                >
                    <p className={`font-semibold ${currentTheme.text} truncate font-mono`}>{conn.connectionreferencelogicalname}</p>
                    <p className={`text-left text-sm ${currentTheme.secondaryText} truncate font-mono`}>{conn.connectorid}</p>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText} truncate`}>{conn['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A'}</p>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={conn.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};
