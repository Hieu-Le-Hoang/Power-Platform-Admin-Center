import React from 'react';
import type { Dataflow, Theme } from '../../types';
import { FormattedDate, StatusIndicator, RefreshStatusIndicator } from './TableComponents';

interface DataflowTableProps {
  dataflows: Dataflow[];
  onRowClick: (dataflow: Dataflow) => void;
  theme: Theme;
}

export const DataflowTable: React.FC<DataflowTableProps> = ({ dataflows, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Description</span>
            <span className="w-32 text-left">Status</span>
            <span className="w-40 text-left">Last Refresh</span>
            <span className="w-40 text-left">Modified</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-32 text-left">Owner</span>
        </div>
        <div>
            {dataflows.map((dataflow) => (
                <div 
                    key={dataflow.msdyn_dataflowid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(dataflow)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(dataflow)}
                    aria-label={`View details for ${dataflow.msdyn_name}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{dataflow.msdyn_name}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{dataflow.msdyn_description || 'No description'}</p>
                    </div>
                    <div className="w-32 text-left">
                       <StatusIndicator status={dataflow.statusText} theme={theme} />
                    </div>
                    <div className="w-40 text-left">
                       <RefreshStatusIndicator status={dataflow.refreshStatus} theme={theme} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={dataflow.modifiedon} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={dataflow.createdon} />
                    </div>
                    <div className={`w-32 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {dataflow['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
