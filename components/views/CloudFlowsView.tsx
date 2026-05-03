import React, { useState, useEffect, useCallback } from 'react';
import { fetchWorkflows, fetchAccessToken } from '../../services/dataverseService';
import type { Workflow, Theme } from '../../types';
import WorkflowTable from '../tables/WorkflowTable';
import { WorkflowDetailModal } from '../details/WorkflowDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL, WORKFLOW_FIELDS, WORKFLOW_CATEGORY_OPTIONS } from '../../constants';
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

// Define categories to exclude from the view and filter options.
const excludedCategories = ['0', '1', '3', '4']; // Workflow, Dialog, Action, Business Process Flow
const userFacingCategoryOptions = WORKFLOW_CATEGORY_OPTIONS.filter(
    option => !excludedCategories.includes(option.value)
);

export const CloudFlowsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  const initialFilters = {
      searchTerm: '',
      ownerFilter: '',
      sortBy: 'createdon',
      sortOrder: 'desc' as 'asc' | 'desc',
      categoryFilter: [] as string[],
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
        const result = await fetchWorkflows(accessToken, urlToFetch);
        setWorkflows(result.workflows);
        setNextLink(result.nextLink);
        if (isNewSearch && result.totalCount !== -1) {
            setTotalCount(result.totalCount);
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to fetch data: ${errorMessage}.`);
        setWorkflows([]);
        setTotalCount(0);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const filterParts: string[] = [];
    if (appliedFilters.searchTerm) {
      const term = appliedFilters.searchTerm.replace(/'/g, "''");
      filterParts.push(`(contains(name, '${term}') or contains(description, '${term}'))`);
    }
    if (appliedFilters.ownerFilter) {
      const owner = appliedFilters.ownerFilter.replace(/'/g, "''");
      filterParts.push(`(contains(owninguser/fullname, '${owner}'))`);
    }

    if (appliedFilters.categoryFilter.length > 0) {
      const categoryConditions = appliedFilters.categoryFilter.map(c => `category eq ${c}`).join(' or ');
      filterParts.push(`(${categoryConditions})`);
    } else {
      // Default filter to exclude system categories if no specific category is chosen
      const exclusionConditions = excludedCategories.map(c => `category ne ${c}`).join(' and ');
      filterParts.push(`(${exclusionConditions})`);
    }

    // Always filter for Unmanaged flows
    filterParts.push(`ismanaged eq false`);
    
    const serverSortField = appliedFilters.sortBy;
    const serverSortOrder = appliedFilters.sortOrder;
    
    const queryParams: string[] = [
      `$select=${WORKFLOW_FIELDS}`,
      `$count=true`,
      `$top=${pageSize}`,
      `$orderby=${serverSortField} ${serverSortOrder}`,
      `$expand=owninguser($select=fullname)`
    ];
    if (filterParts.length > 0) {
      queryParams.push(`$filter=${filterParts.join(' and ')}`);
    }

    const newUrl = `${BASE_DATAVERSE_URL}?${queryParams.join('&')}`;
    
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

  const handleRowClick = (workflow: Workflow) => setSelectedWorkflow(workflow);
  const handleCloseModal = () => setSelectedWorkflow(null);

  const renderContent = () => {
    if (isLoading && workflows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg">
          <LoadingIcon />
          <p className={`mt-4 text-lg ${currentTheme.secondaryText}`}>Fetching flows...</p>
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
    if (workflows.length === 0) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-lg ${currentTheme.secondaryText}`}>No flows found</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-400'}`}>Try adjusting your filter criteria.</p>
            </div>
        );
    }
    return <WorkflowTable workflows={workflows} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
          {notification && <Notification message={notification} onDismiss={() => setNotification(null)} type="warning" theme={theme} />}
          
          <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Cloud flows</h2>
              <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>View and manage your unmanaged flows, monitor run history, and analyze performance.</p>
          </div>

          <div className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
                <button
                onClick={() => setIsFilterPanelOpen(true)}
                className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                <FilterIcon className="h-4 w-4" />
                Filters & Sort
                </button>
                <a
                    href="https://make.powerautomate.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-white ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    <PlusIcon className="h-4 w-4" />
                    New cloud flow
                </a>
            </div>
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
        <WorkflowDetailModal workflow={selectedWorkflow} onClose={handleCloseModal} theme={theme} />
        <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={handleApplyFilters} onClear={handleClearFilters} theme={theme}>
            <div className="space-y-6">
                <div>
                  <label htmlFor="search-term" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      id="search-term"
                      value={tempFilters.searchTerm}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      placeholder="By name or description..."
                      className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                    />
                  </div>
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Category</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {userFacingCategoryOptions.map(option => (
                            <div key={option.value} className="flex items-center">
                                <input
                                    id={`category-${option.value}`}
                                    type="checkbox"
                                    value={option.value}
                                    checked={tempFilters.categoryFilter.includes(option.value)}
                                    onChange={(e) => {
                                        const { value, checked } = e.target;
                                        const newCategories = checked
                                            ? [...tempFilters.categoryFilter, value]
                                            : tempFilters.categoryFilter.filter(c => c !== value);
                                        setTempFilters(prev => ({ ...prev, categoryFilter: newCategories }));
                                    }}
                                    className={`h-4 w-4 rounded ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                                />
                                <label htmlFor={`category-${option.value}`} className={`ml-3 text-sm ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                  <label htmlFor="owner-filter" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Owner</label>
                  <input
                    type="text"
                    id="owner-filter"
                    value={tempFilters.ownerFilter}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, ownerFilter: e.target.value }))}
                    placeholder="Filter by owner name..."
                    className={`w-full px-3 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                  />
                </div>
                <div>
                  <label htmlFor="sort-by" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Sort by</label>
                  <div className="flex items-center gap-2">
                    <select
                      id="sort-by"
                      value={tempFilters.sortBy}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                    >
                      <option value="name">Name</option>
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