import React, { useState, useEffect, useCallback } from 'react';
import { fetchSolutions, fetchAccessToken } from '../../services/dataverseService';
import type { Solution, Theme } from '../../types';
import { SolutionTable } from '../tables/SolutionTable';
import { SolutionDetailModal } from '../details/SolutionDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_SOLUTIONS, SOLUTION_FIELDS } from '../../constants';
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

export const SolutionsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  
  const initialFilters = {
    searchTerm: '',
    publisherFilter: '',
    sortBy: 'friendlyname',
    sortOrder: 'asc' as 'asc' | 'desc',
    isManagedFilter: 'all' as 'all' | 'managed' | 'unmanaged',
  };
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  
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
  
  const handleFetchData = useCallback(async (urlToFetch: string, isNewSearch: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
        const accessToken = await fetchAccessToken();
        const result = await fetchSolutions(accessToken, urlToFetch);
        setSolutions(result.solutions);
        setNextLink(result.nextLink);
        if (isNewSearch && result.totalCount !== -1) {
            setTotalCount(result.totalCount);
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to fetch data: ${errorMessage}.`);
        setSolutions([]);
        setTotalCount(0);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const filterParts: string[] = [];
    if (appliedFilters.searchTerm) {
      const term = appliedFilters.searchTerm.replace(/'/g, "''");
      filterParts.push(`(contains(friendlyname, '${term}') or contains(uniquename, '${term}'))`);
    }
    if (appliedFilters.publisherFilter) {
      const publisher = appliedFilters.publisherFilter.replace(/'/g, "''");
      filterParts.push(`(contains(publisherid/friendlyname, '${publisher}'))`);
    }
    if (appliedFilters.isManagedFilter !== 'all') {
      filterParts.push(`ismanaged eq ${appliedFilters.isManagedFilter === 'managed'}`);
    }
    
    const serverSortField = appliedFilters.sortBy;
    const serverSortOrder = appliedFilters.sortOrder;
    
    const queryParams: string[] = [
      `$select=${SOLUTION_FIELDS}`,
      `$count=true`,
      `$top=${pageSize}`,
      `$orderby=${serverSortField} ${serverSortOrder}`,
      `$expand=publisherid($select=friendlyname)`
    ];
    if (filterParts.length > 0) {
      queryParams.push(`$filter=${filterParts.join(' and ')}`);
    }

    const newUrl = `${BASE_DATAVERSE_URL_SOLUTIONS}?${queryParams.join('&')}`;
    
    setCurrentPage(1);
    setPageHistory([newUrl]);
    handleFetchData(newUrl, true);
  }, [appliedFilters, pageSize, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setPageHistory(prev => [...prev, nextLink]);
        setCurrentPage(prev => prev + 1);
        handleFetchData(nextLink, false);
    }
  };

  const handlePrevPage = () => {
      setPageHistory(currentHistory => {
        if (currentHistory.length > 1) {
            const newHistory = currentHistory.slice(0, -1);
            const prevPageUrl = newHistory[newHistory.length - 1];
            if (prevPageUrl) {
                setCurrentPage(prev => prev - 1);
                handleFetchData(prevPageUrl, false);
            }
            return newHistory;
        }
        return currentHistory;
      });
  };

  const handleRowClick = (solution: Solution) => setSelectedSolution(solution);
  const handleCloseModal = () => setSelectedSolution(null);

  const renderContent = () => {
    if (isLoading && solutions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg">
          <LoadingIcon />
          <p className={`mt-4 text-lg ${currentTheme.secondaryText}`}>Fetching solutions...</p>
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
    if (solutions.length === 0) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-lg ${currentTheme.secondaryText}`}>No solutions found</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-400'}`}>Try adjusting your filter criteria.</p>
            </div>
        );
    }
    return <SolutionTable solutions={solutions} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
          {notification && <Notification message={notification} onDismiss={() => setNotification(null)} type="warning" theme={theme} />}
          
          <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Solution Inventory</h2>
              <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>View and manage your solutions for Application Lifecycle Management (ALM).</p>
          </div>

          <div className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <button
              onClick={() => setIsFilterPanelOpen(true)}
              className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
            >
              <FilterIcon className="h-4 w-4" />
              Filters & Sort
            </button>
            <div className="flex-shrink-0">
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
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
        <SolutionDetailModal solution={selectedSolution} onClose={handleCloseModal} theme={theme} />
        <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={handleApplyFilters} onClear={handleClearFilters} theme={theme}>
            <div className="space-y-6">
                <div>
                  <label htmlFor="search-term-sol" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      id="search-term-sol"
                      value={tempFilters.searchTerm}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      placeholder="By name or unique name..."
                      className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                    />
                  </div>
                </div>
                 <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Type</label>
                    <div className="flex space-x-4">
                        {(['all', 'managed', 'unmanaged'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                            id={`managed-type-sol-${type}`}
                            type="radio"
                            name="managed-type-sol"
                            value={type}
                            checked={tempFilters.isManagedFilter === type}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, isManagedFilter: e.target.value as any }))}
                            className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                            />
                            <label htmlFor={`managed-type-sol-${type}`} className={`ml-2 text-sm capitalize ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>
                            {type}
                            </label>
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                  <label htmlFor="publisher-filter" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Publisher</label>
                  <input
                    type="text"
                    id="publisher-filter"
                    value={tempFilters.publisherFilter}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, publisherFilter: e.target.value }))}
                    placeholder="Filter by publisher name..."
                    className={`w-full px-3 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                  />
                </div>
                <div>
                  <label htmlFor="sort-by-sol" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Sort by</label>
                  <div className="flex items-center gap-2">
                    <select
                      id="sort-by-sol"
                      value={tempFilters.sortBy}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                    >
                      <option value="friendlyname">Name</option>
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
