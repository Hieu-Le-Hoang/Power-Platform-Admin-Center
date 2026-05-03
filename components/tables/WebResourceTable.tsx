import React from 'react';
import type { WebResource, Theme } from '../../types';
import { FormattedDate } from './TableComponents';

interface WebResourceTableProps {
  resources: WebResource[];
  onRowClick: (resource: WebResource) => void;
  theme: Theme;
}

export const WebResourceTable: React.FC<WebResourceTableProps> = ({ resources, onRowClick, theme }) => {
  const themeStyles = {
    dark: {
      headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]',
      rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]',
      text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]',
    },
    light: {
      headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200',
      rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100',
      text: 'text-gray-900', secondaryText: 'text-gray-500',
    },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name & Description</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
            <span className="w-32 text-left">Created By</span>
        </div>
        <div>
            {resources.map((resource) => (
                <div 
                    key={resource.webresourceid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(resource)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRowClick(resource)}
                    aria-label={`View details for ${resource.displayname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{resource.displayname || resource.name}</p>
                         <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{resource.description || 'No description'}</p>
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.text}`}>
                        {resource.typeName}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={resource.modifiedon} />
                    </div>
                    <div className={`w-32 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {resource['_createdby_value@OData.Community.Display.V1.FormattedValue'] || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
