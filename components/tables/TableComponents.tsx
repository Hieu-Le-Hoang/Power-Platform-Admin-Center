import React, { useState } from 'react';
import type { Theme, AuditLogAction } from '../../types';
import { CheckIcon, ClipboardIcon } from '../IconComponents';

export const FormattedDate: React.FC<{ dateString: string | Date | null | undefined }> = ({ dateString }) => {
    if (!dateString) {
        return <span className="text-gray-500">N/A</span>;
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
        return <span className="text-gray-500">Invalid Date</span>;
    }
    return <>{date.toLocaleString()}</>;
};

export const StatusIndicator: React.FC<{ status: string | undefined; theme: Theme }> = ({ status, theme }) => {
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


export const ManagedIndicator: React.FC<{ isManaged: string | undefined; theme: Theme }> = ({ isManaged, theme }) => {
    const is_managed = isManaged?.toLowerCase() === 'managed';
    const color = is_managed ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600');
    const bgColor = is_managed ? (theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100') : (theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-100');

    return (
        <div className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${bgColor} ${color}`}>
            {isManaged || 'Unknown'}
        </div>
    );
};

export const CopyRecordId: React.FC<{ recordId: string; theme: Theme }> = ({ recordId, theme }) => {
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

export const ActionIndicator: React.FC<{ action: AuditLogAction; theme: Theme }> = ({ action, theme }) => {
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

export const RefreshStatusIndicator: React.FC<{ status: string | undefined; theme: Theme }> = ({ status, theme }) => {
    const lowerStatus = status?.toLowerCase() || 'unknown';
    let colorClass = '';
    let textClass = '';

    switch (lowerStatus) {
        case 'success':
            colorClass = 'bg-green-500';
            textClass = theme === 'dark' ? 'text-green-400' : 'text-green-700';
            break;
        case 'error':
        case 'failed':
            colorClass = 'bg-red-500';
            textClass = theme === 'dark' ? 'text-red-400' : 'text-red-700';
            break;
        case 'inprogress':
        case 'refreshing':
             colorClass = 'bg-blue-500 animate-pulse';
             textClass = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
            break;
        case 'canceled':
            colorClass = 'bg-yellow-500';
            textClass = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
            break;
        default:
            colorClass = 'bg-gray-500';
            textClass = theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500';
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
            <p className={`font-semibold text-sm ${textClass}`}>{status || 'Unknown'}</p>
        </div>
    );
};
