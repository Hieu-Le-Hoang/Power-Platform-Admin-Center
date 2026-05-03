import React, { useState } from 'react';
import type { Workflow, Theme, Dataflow, Solution, AuditLog, AuditLogAction, EnvironmentVariable, CanvasApp, ModelDrivenApp, CustomControl, WebResource, SiteMap, SecurityRole, FieldSecurityProfile, ConnectionReference } from '../types';
import { CheckIcon, ClipboardIcon } from './IconComponents';

interface WorkflowTableProps {
  workflows: Workflow[];
  onRowClick: (workflow: Workflow) => void;
  theme: Theme;
}

const FormattedDate: React.FC<{ dateString: string | Date | null | undefined }> = ({ dateString }) => {
    if (!dateString) {
        return <span className="text-gray-500">N/A</span>;
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
        return <span className="text-gray-500">Invalid Date</span>;
    }
    return <>{date.toLocaleString()}</>;
};

const StatusIndicator: React.FC<{ status: string | undefined; theme: Theme }> = ({ status, theme }) => {
    const is_on = status?.toLowerCase() === 'on' || status?.toLowerCase() === 'active';
    const color = is_on ? 'bg-green-500' : 'bg-gray-500';
    const textColor = is_on 
        ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
        : (theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500');

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
            <p className={`font-semibold ${textColor}`}>{status || 'Unknown'}</p>
        </div>
    );
};

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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Description</span>
            <span className="w-40 text-left">Status</span>
            <span className="w-40 text-left">Modified</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-32 text-left">Owner</span>
        </div>
        <div>
            {workflows.map((workflow) => (
                <div 
                    key={workflow.workflowid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Description</span>
            <span className="w-40 text-left">Status</span>
            <span className="w-40 text-left">Modified</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-32 text-left">Owner</span>
        </div>
        <div>
            {dataflows.map((dataflow) => (
                <div 
                    key={dataflow.msdyn_dataflowid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
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
                    <div className="w-40 text-left">
                       <StatusIndicator status={dataflow.statusText} theme={theme} />
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

interface SolutionTableProps {
  solutions: Solution[];
  onRowClick: (solution: Solution) => void;
  theme: Theme;
}

const ManagedIndicator: React.FC<{ isManaged: string | undefined; theme: Theme }> = ({ isManaged, theme }) => {
    const is_managed = isManaged?.toLowerCase() === 'managed';
    const color = is_managed ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600');
    const bgColor = is_managed ? (theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100') : (theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-100');

    return (
        <div className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${bgColor} ${color}`}>
            {isManaged || 'Unknown'}
        </div>
    );
};

export const SolutionTable: React.FC<SolutionTableProps> = ({ solutions, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Unique Name</span>
            <span className="w-40 text-left">Version</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
            <span className="w-40 text-left">Publisher</span>
        </div>
        <div>
            {solutions.map((solution) => (
                <div 
                    key={solution.solutionid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(solution)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(solution)}
                    aria-label={`View details for ${solution.friendlyname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{solution.friendlyname}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{solution.uniquename || 'No unique name'}</p>
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        {solution.version}
                    </div>
                    <div className="w-40 text-left">
                       <ManagedIndicator isManaged={solution.isManagedText} theme={theme} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={solution.modifiedon} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {solution.publisherName || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

interface AuditLogTableProps {
  logs: AuditLog[];
  onRowClick: (log: AuditLog) => void;
  theme: Theme;
}

const CopyRecordId: React.FC<{ recordId: string; theme: Theme }> = ({ recordId, theme }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        navigator.clipboard.writeText(recordId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const themeClasses = theme === 'dark'
        ? 'text-gray-400 hover:text-white'
        : 'text-gray-500 hover:text-gray-800';
    
    const copiedThemeClasses = theme === 'dark'
        ? 'text-green-400'
        : 'text-green-600';

    return (
        <button
            onClick={handleCopy}
            className={`p-1 rounded-full transition-colors relative group ${copied ? copiedThemeClasses : themeClasses}`}
            aria-label="Copy Record ID"
        >
            {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
            <span className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${theme === 'dark' ? 'bg-[#011627] text-white' : 'bg-gray-700 text-white'}`}>
                {copied ? 'Copied!' : 'Copy ID'}
            </span>
        </button>
    );
};

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
  
  const ActionIndicator: React.FC<{ action: AuditLogAction; theme: Theme }> = ({ action, theme }) => {
    const styles = {
        CREATE: theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700',
        UPDATE: theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700',
        DELETE: theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${styles[action]}`}>
            {action}
        </span>
    );
  };


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

interface EnvironmentVariableTableProps {
  variables: EnvironmentVariable[];
  onRowClick: (variable: EnvironmentVariable) => void;
  theme: Theme;
}

export const EnvironmentVariableTable: React.FC<EnvironmentVariableTableProps> = ({ variables, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Display Name</span>
            <span>Schema Name</span>
            <span className="w-40 text-left">Type</span>
        </div>
        <div>
            {variables.map((variable) => (
                <div 
                    key={variable.environmentvariablevalueid} 
                    className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(variable)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(variable)}
                    aria-label={`View details for ${variable.displayname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{variable.displayname}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{variable.description || 'No description'}</p>
                    </div>
                    <div className={`truncate font-mono text-sm ${currentTheme.secondaryText}`}>
                        {variable.schemaname}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.text}`}>
                       {variable.typeName}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

interface CanvasAppTableProps {
  apps: CanvasApp[];
  onRowClick: (app: CanvasApp) => void;
  theme: Theme;
}

export const CanvasAppTable: React.FC<CanvasAppTableProps> = ({ apps, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name &amp; Description</span>
            <span className="w-24 text-left">Version</span>
            <span className="w-40 text-left">Last Published</span>
            <span className="w-40 text-left">Created</span>
            <span className="w-32 text-left">Owner</span>
        </div>
        <div>
            {apps.map((app) => (
                <div 
                    key={app.canvasappid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(app)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRowClick(app)}
                    aria-label={`View details for ${app.displayname}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{app.displayname}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{app.description || 'No description'}</p>
                    </div>
                    <div className={`w-24 text-left text-sm ${currentTheme.secondaryText}`}>
                        {app.versionnumber}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={app.lastpublishtime} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={app.createdtime} />
                    </div>
                    <div className={`w-32 text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {app['_ownerid_value@OData.Community.Display.V1.FormattedValue'] || 'N/A'}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

interface ModelDrivenAppTableProps {
  apps: ModelDrivenApp[];
  onRowClick: (app: ModelDrivenApp) => void;
  theme: Theme;
}

export const ModelDrivenAppTable: React.FC<ModelDrivenAppTableProps> = ({ apps, onRowClick, theme }) => {
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
            <span>Name &amp; Unique Name</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Modified</span>
            <span className="w-40 text-left">Created</span>
        </div>
        <div>
            {apps.map((app) => (
                <div 
                    key={app.appmoduleid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(app)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRowClick(app)}
                    aria-label={`View details for ${app.name}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{app.name}</p>
                        <p className={`text-sm ${currentTheme.secondaryText} truncate`}>{app.uniquename || 'No unique name'}</p>
                    </div>
                     <div className={`w-40 text-left text-sm ${currentTheme.text}`}>
                        {app.clientTypeText}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={app.modifiedon} />
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={app.createdon} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

interface CustomControlTableProps {
  controls: CustomControl[];
  onRowClick: (control: CustomControl) => void;
  theme: Theme;
}

export const CustomControlTable: React.FC<CustomControlTableProps> = ({ controls, onRowClick, theme }) => {
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
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name</span>
            <span className="w-24 text-left">Version</span>
            <span className="text-left">Compatible Data Types</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {controls.map((control) => (
                <div 
                    key={control.customcontrolid} 
                    className={`grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover} transition-colors duration-150`}
                    onClick={() => onRowClick(control)}
                    role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onRowClick(control)}
                    aria-label={`View details for ${control.name}`}
                >
                    <div className="truncate">
                        <p className={`font-semibold ${currentTheme.text} truncate`}>{control.name}</p>
                    </div>
                    <div className={`w-24 text-left text-sm ${currentTheme.secondaryText}`}>
                        {control.version}
                    </div>
                    <div className={`w-full text-left text-sm ${currentTheme.secondaryText} truncate`}>
                        {control.compatibledatatypes || 'N/A'}
                    </div>
                    <div className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>
                        <FormattedDate dateString={control.modifiedon} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

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

interface SiteMapTableProps {
  sitemaps: SiteMap[];
  onRowClick: (sitemap: SiteMap) => void;
  theme: Theme;
}

export const SiteMapTable: React.FC<SiteMapTableProps> = ({ sitemaps, onRowClick, theme }) => {
  const themeStyles = {
    dark: { headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]', rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]' },
    light: { headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200', rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100', text: 'text-gray-900', secondaryText: 'text-gray-500' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Name</span>
            <span className="w-40 text-left">Version</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {sitemaps.map((sitemap) => (
                <div 
                    key={sitemap.sitemapid} 
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(sitemap)}
                >
                    <p className={`font-semibold ${currentTheme.text} truncate`}>{sitemap.sitemapname || 'No Name'}</p>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}>{sitemap.versionnumber}</p>
                    <div className="w-40 text-left"><ManagedIndicator isManaged={sitemap.isManagedText} theme={theme} /></div>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={sitemap.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};

interface SecurityRoleTableProps {
  roles: SecurityRole[];
  onRowClick: (role: SecurityRole) => void;
  theme: Theme;
}

export const SecurityRoleTable: React.FC<SecurityRoleTableProps> = ({ roles, onRowClick, theme }) => {
  const themeStyles = {
    dark: { headerBg: 'bg-[#011627]', headerText: 'text-[#A7B1C2]', headerBorder: 'border-[#143B54]', rowBorder: 'border-[#143B54]', rowHover: 'hover:bg-[#0B253A]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]' },
    light: { headerBg: 'bg-gray-50', headerText: 'text-gray-500', headerBorder: 'border-gray-200', rowBorder: 'border-gray-200', rowHover: 'hover:bg-gray-100', text: 'text-gray-900', secondaryText: 'text-gray-500' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div>
        <div className={`sticky top-0 z-10 ${currentTheme.headerBg} grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-semibold ${currentTheme.headerText} uppercase tracking-wider border-b-2 ${currentTheme.headerBorder}`}>
            <span>Role Name</span>
            <span>Business Unit</span>
            <span className="w-40 text-left">Type</span>
            <span className="w-40 text-left">Last Modified</span>
        </div>
        <div>
            {roles.map((role) => (
                <div 
                    key={role.roleid} 
                    className={`grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center p-4 border-b ${currentTheme.rowBorder} cursor-pointer ${currentTheme.rowHover}`}
                    onClick={() => onRowClick(role)}
                >
                    <p className={`font-semibold ${currentTheme.text} truncate`}>{role.name}</p>
                    <p className={`text-left text-sm ${currentTheme.secondaryText} truncate`}>{role['_businessunitid_value@OData.Community.Display.V1.FormattedValue']}</p>
                    <div className="w-40 text-left"><ManagedIndicator isManaged={role.isManagedText} theme={theme} /></div>
                    <p className={`w-40 text-left text-sm ${currentTheme.secondaryText}`}><FormattedDate dateString={role.modifiedon} /></p>
                </div>
            ))}
        </div>
    </div>
  );
};

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
