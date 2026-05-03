import React, { useState, useEffect, useCallback } from 'react';
import { fetchAuditLogs } from '../../services/auditLogService';
import type { AuditLog, FilterCriteria, Theme } from '../../types';
import { AuditLogTable } from '../tables/AuditLogTable';
import { AuditLogDetailModal } from '../details/AuditLogDetailModal';
import { LoadingIcon, FilterIcon } from '../IconComponents';
import { Notification } from '../shared/Notification';
import { Pagination } from '../shared/Pagination';
import { FilterPanel } from '../shared/FilterPanel';

const themeStyles = {
    dark: {
        bg: 'bg-[#0B253A]',
        text: 'text-[#F3F4F6]',
        secondaryText: 'text-[#A7B1C2]',
        inputBg: 'bg-[#011627]',
        focusRing: 'focus:ring-[#2563EB]',
    },
    light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        secondaryText: 'text-gray-500',
        inputBg: 'bg-gray-200',
        focusRing: 'focus:ring-indigo-500',
    }
};

export const AuditLogsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const initialFilters: FilterCriteria = {
      startDate: today,
      endDate: today,
      tableName: '',
      action: 'ALL',
      recordId: '',
      userId: '',
      pageSize: 50,
  };

  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextLink, setNextLink] = useState<string | null>(null);
  
  const currentTheme = themeStyles[theme];

  useEffect(() => {
      if (isFilterPanelOpen) {
          setTempFilters(appliedFilters);
      }
  }, [isFilterPanelOpen, appliedFilters]);

  const handleApplyFilters = () => {
      setAppliedFilters(tempFilters);
      setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
      setTempFilters(initialFilters);
      setAppliedFilters(initialFilters);
      setIsFilterPanelOpen(false);
  };
  
  const handleFetchData = useCallback(async (filters: FilterCriteria, link: string | null, isNewSearch: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLogs(filters, link);
      setLogs(result.logs);
      setNextLink(result.nextLink);
      if (isNewSearch && result.totalCount !== -1) {
        setTotalCount(result.totalCount);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch audit logs: ${err.message}.`);
      } else {
        setError('An unknown error occurred while fetching audit logs.');
      }
      setLogs([]);
      setTotalCount(0);
      setNextLink(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
    handleFetchData(appliedFilters, null, true);
  }, [appliedFilters, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setCurrentPage(prev => prev + 1);
        handleFetchData(appliedFilters, nextLink, false);
    }
  };

  const handlePrevPage = () => {
      setNotification("Going to the previous page is not supported for Audit Logs. Please apply filters again to restart from the first page.");
  };

  const handleRowClick = (log: AuditLog) => setSelectedLog(log);
  const handleCloseModal = () => setSelectedLog(null);

  const renderContent = () => {
    if (isLoading && logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg">
          <LoadingIcon />
          <p className={`mt-4 text-lg ${currentTheme.secondaryText}`}>Fetching audit logs...</p>
        </div>
      );
    }
     if (error) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} rounded-lg`}>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>Error Fetching Data</p>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
        );
    }
    if (logs.length === 0) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-lg ${currentTheme.secondaryText}`}>No audit logs found</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-400'}`}>Try adjusting your filter criteria.</p>
            </div>
        );
    }
    return <AuditLogTable logs={logs} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
            {notification && <Notification message={notification} onDismiss={() => setNotification(null)} theme={theme} />}
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Audit Logs</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Review system and user activity across the environment.</p>
            </div>
            <div className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                    onClick={() => setIsFilterPanelOpen(true)}
                    className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                    <FilterIcon className="h-4 w-4" />
                    Filters
                </button>
                <div className="flex-shrink-0">
                    <Pagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={appliedFilters.pageSize}
                        onNext={handleNextPage}
                        onPrev={handlePrevPage}
                        hasNextPage={!!nextLink}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
        <main className="flex-grow overflow-y-auto relative">
            {isLoading && <div className="absolute inset-0 bg-black/10 z-10" />}
            {renderContent()}
        </main>
        <AuditLogDetailModal log={selectedLog} onClose={handleCloseModal} theme={theme} />
        <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={handleApplyFilters} onClear={handleClearFilters} theme={theme}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Start Date</label>
                        <input type="date" id="start-date" value={tempFilters.startDate} onChange={e => setTempFilters(p => ({...p, startDate: e.target.value}))} className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md p-2 text-sm`}/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>End Date</label>
                        <input type="date" id="end-date" value={tempFilters.endDate} onChange={e => setTempFilters(p => ({...p, endDate: e.target.value}))} className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md p-2 text-sm`}/>
                    </div>
                </div>
                <div>
                  <label htmlFor="table-name" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Table Name</label>
                  <input type="text" id="table-name" placeholder="e.g., account" value={tempFilters.tableName} onChange={e => setTempFilters(p => ({...p, tableName: e.target.value}))} className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md p-2 text-sm`}/>
                </div>
                <div>
                  <label htmlFor="record-id" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Record ID (GUID)</label>
                  <input type="text" id="record-id" placeholder="e.g., a0b1c2..." value={tempFilters.recordId} onChange={e => setTempFilters(p => ({...p, recordId: e.target.value}))} className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md p-2 text-sm`}/>
                </div>
                <div>
                  <label htmlFor="user-id" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>User ID (GUID)</label>
                  <input type="text" id="user-id" placeholder="e.g., d4e5f6..." value={tempFilters.userId} onChange={e => setTempFilters(p => ({...p, userId: e.target.value}))} className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md p-2 text-sm`}/>
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Action</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {(['ALL', 'CREATE', 'UPDATE', 'DELETE'] as const).map(action => (
                        <div key={action} className="flex items-center">
                            <input
                            id={`action-type-${action}`}
                            type="radio"
                            name="action-type"
                            value={action}
                            checked={tempFilters.action === action}
                            onChange={(e) => setTempFilters(p => ({ ...p, action: e.target.value as any }))}
                            className={`h-4 w-4 ${currentTheme.inputBg} border-transparent text-indigo-600 focus:ring-indigo-500`}
                            />
                            <label htmlFor={`action-type-${action}`} className={`ml-2 text-sm capitalize ${currentTheme.text}`}>
                            {action}
                            </label>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </FilterPanel>
    </div>
  );
};
