import React from 'react';
import type { Workflow, Theme } from '../../types';
import { FormattedDate, StatusIndicator } from './TableComponents';

interface WorkflowTableProps {
  workflows: Workflow[];
  onRowClick: (workflow: Workflow) => void;
  theme: Theme;
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({ workflows, onRowClick, theme }) => {
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
            <span className="w-40 text-left">Category</span>
            <span className="w-40 text-left">Status</span>
            <span className="w-40 text-left">Modified</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-32 text-left">Owner</span>
        </div>
        <div>
            {workflows.map((workflow) => (
                <div 
                    key={workflow.workflowid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(workflow)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(workflow)}
                    aria-label={`View details for ${workflow.name}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{workflow.name}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{workflow.description || 'No description'}</p>
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        {workflow.categoryText || 'N/A'}
                    </div>
                    <div className="w-40 text-left">
                       <StatusIndicator status={workflow.statusText} theme={theme} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={workflow.modifiedon} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={workflow.createdon} />
                    </div>
                    <div className={`w-32 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {workflow['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default WorkflowTable;