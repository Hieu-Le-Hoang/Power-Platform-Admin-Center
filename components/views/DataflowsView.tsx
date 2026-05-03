import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchDataflows, fetchAccessToken } from '../../services/dataverseService';
import type { Dataflow, Theme } from '../../types';
import { DataflowTable } from '../tables/DataflowTable';
import { DataflowDetailModal } from '../details/DataflowDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_DATAFLOWS, DATAFLOW_FIELDS } from '../../constants';
import { Notification } from '../shared/Notification';
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

export const DataflowsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [dataflows, setDataflows] = useState<Dataflow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataflow, setSelectedDataflow] = useState<Dataflow | null>(null);
  
  const initialFilters = {
      searchTerm: '',
      ownerFilter: '',
      sortBy: 'createdon',
      sortOrder: 'desc' as 'asc' | 'desc',
      refreshStatusFilter: 'all' as 'all' | 'success' | 'failed' | 'other',
  };
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

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
  
  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const urlToFetch = `${BASE_DATAVERSE_URL_DATAFLOWS}?$select=${DATAFLOW_FIELDS}&$top=1000&$expand=owninguser($select=fullname)`;
      const result = await fetchDataflows(accessToken, urlToFetch);
      setDataflows(result.dataflows);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setDataflows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const sortedAndFilteredDataflows = useMemo(() => {
    let items = [...dataflows];
    
    // Client-side filtering
    if (appliedFilters.searchTerm) {
        const term = appliedFilters.searchTerm.toLowerCase();
        items = items.filter(df =>
            df.msdyn_name.toLowerCase().includes(term) ||
            (df.msdyn_description && df.msdyn_description.toLowerCase().includes(term)) ||
            df.msdyn_dataflowid.toLowerCase().includes(term)
        );
    }
    if (appliedFilters.ownerFilter) {
        const owner = appliedFilters.ownerFilter.toLowerCase();
        items = items.filter(df =>
            df['_ownerid_value@OData.Community.Display.V1.FormattedValue']?.toLowerCase().includes(owner)
        );
    }
    if (appliedFilters.refreshStatusFilter !== 'all') {
        const status = appliedFilters.refreshStatusFilter;
        items = items.filter(df => {
            const dfStatus = (df.refreshStatus || 'unknown').toLowerCase();
            if (status === 'success') return dfStatus === 'success';
            if (status === 'failed') return dfStatus === 'failed' || dfStatus === 'error';
            if (status === 'other') return dfStatus !== 'success' && dfStatus !== 'failed' && dfStatus !== 'error';
            return true;
        });
    }

    // Client-side sorting
    items.sort((a, b) => {
        const field = appliedFilters.sortBy as keyof Dataflow | 'name';
        let valA, valB;
        
        if (field === 'name') {
            valA = a.msdyn_name ?? '';
            valB = b.msdyn_name ?? '';
        } else {
            valA = a[field as keyof Dataflow] ?? '';
            valB = b[field as keyof Dataflow] ?? '';
        }

        if (field === 'createdon' || field === 'modifiedon') {
            const dateA = new Date(valA.toString()).getTime();
            const dateB = new Date(valB.toString()).getTime();
            if (dateA < dateB) return appliedFilters.sortOrder === 'asc' ? -1 : 1;
            if (dateA > dateB) return appliedFilters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        }

        if (String(valA) < String(valB)) return appliedFilters.sortOrder === 'asc' ? -1 : 1;
        if (String(valA) > String(valB)) return appliedFilters.sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    return items;
  }, [dataflows, appliedFilters]);


  const handleRowClick = (dataflow: Dataflow) => setSelectedDataflow(dataflow);
  const handleCloseModal = () => setSelectedDataflow(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg">
          <LoadingIcon />
          <p className={`mt-4 text-lg ${currentTheme.secondaryText}`}>Fetching dataflows...</p>
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
    if (sortedAndFilteredDataflows.length === 0) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-lg ${currentTheme.secondaryText}`}>No dataflows found</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-400'}`}>Try adjusting your filter criteria.</p>
            </div>
        );
    }
    return <DataflowTable dataflows={sortedAndFilteredDataflows} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
          {notification && <Notification message={notification} onDismiss={() => setNotification(null)} type="warning" theme={theme} />}
          
          <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Dataflows</h2>
              <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>View and manage your dataflows, monitor refresh history, and analyze performance.</p>
          </div>

          <div className="pb-4">
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
            >
              <FilterIcon className="h-4 w-4" />
              Filters & Sort
            </button>
          </div>
        </div>
        <main className="flex-grow overflow-y-auto">
            {renderContent()}
        </main>
        <DataflowDetailModal dataflow={selectedDataflow} onClose={handleCloseModal} theme={theme} />
        <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={handleApplyFilters} onClear={handleClearFilters} theme={theme}>
            <div className="space-y-6">
                <div>
                  <label htmlFor="search-term-df" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      id="search-term-df"
                      value={tempFilters.searchTerm}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      placeholder="By name, description, or ID..."
                      className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="owner-filter-df" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Owner</label>
                  <input
                    type="text"
                    id="owner-filter-df"
                    value={tempFilters.ownerFilter}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, ownerFilter: e.target.value }))}
                    placeholder="Filter by owner name..."
                    className={`w-full px-3 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                  />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Refresh Status</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {(['all', 'success', 'failed', 'other'] as const).map(status => (
                        <div key={status} className="flex items-center">
                            <input
                            id={`refresh-status-${status}`}
                            type="radio"
                            name="refresh-status"
                            value={status}
                            checked={tempFilters.refreshStatusFilter === status}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, refreshStatusFilter: e.target.value as any }))}
                            className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                            />
                            <label htmlFor={`refresh-status-${status}`} className={`ml-2 text-sm capitalize ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>
                            {status}
                            </label>
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                  <label htmlFor="sort-by-df" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Sort by</label>
                  <div className="flex items-center gap-2">
                    <select
                      id="sort-by-df"
                      value={tempFilters.sortBy}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                    >
                      <option value="msdyn_name">Name</option>
                      <option value="createdon">Created Date</option>
                      <option value="modifiedon">Modified Date</option>
                    </select>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className={`p-2 ${currentTheme.inputBg} border border-transparent rounded-md transition-colors ${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6] hover:bg-[#0B253A]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                      aria-label={`Set sort order to ${tempFilters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      {tempFilters.sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </button>
                  </div>
                </div>
            </div>
        </FilterPanel>
    </div>
  );
};