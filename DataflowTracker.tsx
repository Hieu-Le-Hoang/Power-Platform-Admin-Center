import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWorkflows, fetchDataflows, fetchSolutions, fetchAccessToken, fetchEnvironmentVariables, fetchCanvasApps, fetchModelDrivenApps, fetchCustomControls, fetchWebResources, fetchSiteMaps, fetchSecurityRoles, fetchFieldSecurityProfiles, fetchConnectionReferences } from './services/dataverseService';
import { fetchAuditLogs } from './services/auditLogService';
import type { Workflow, Theme, Dataflow, Solution, AuditLog, FilterCriteria, EnvironmentVariable, CanvasApp, ModelDrivenApp, CustomControl, WebResource, SiteMap, SecurityRole, FieldSecurityProfile, ConnectionReference } from './types';
import WorkflowTable, { DataflowTable, SolutionTable, AuditLogTable, EnvironmentVariableTable, CanvasAppTable, ModelDrivenAppTable, CustomControlTable, WebResourceTable, SiteMapTable, SecurityRoleTable, FieldSecurityProfileTable, ConnectionReferenceTable } from './components/DataflowTable';
import WorkflowDetailModal, { DataflowDetailModal, SolutionDetailModal, AuditLogDetailModal, EnvironmentVariableDetailModal, CanvasAppDetailModal, ModelDrivenAppDetailModal, CustomControlDetailModal, WebResourceDetailModal, SiteMapDetailModal, SecurityRoleDetailModal, FieldSecurityProfileDetailModal, ConnectionReferenceDetailModal } from './components/DataflowDetailModal';
import { LoadingIcon, CloseIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, SunIcon, CubeIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon, DataflowIcon, AuditLogIcon } from './components/IconComponents';
import { BASE_DATAVERSE_URL, WORKFLOW_FIELDS, BASE_DATAVERSE_URL_DATAFLOWS, DATAFLOW_FIELDS, BASE_DATAVERSE_URL_SOLUTIONS, SOLUTION_FIELDS, WORKFLOW_CATEGORY_OPTIONS, BASE_DATAVERSE_URL_ENVVAR_VALUES, ENVVAR_DEFINITION_FIELDS, BASE_DATAVERSE_URL_CANVAS_APPS, CANVAS_APP_FIELDS, BASE_DATAVERSE_URL_MODEL_DRIVEN_APPS, MODEL_DRIVEN_APP_FIELDS, BASE_DATAVERSE_URL_CUSTOM_CONTROLS, CUSTOM_CONTROL_FIELDS, BASE_DATAVERSE_URL_WEB_RESOURCES, WEB_RESOURCE_FIELDS, WEB_RESOURCE_TYPE_OPTIONS, BASE_DATAVERSE_URL_SITEMAPS, SITEMAP_FIELDS, BASE_DATAVERSE_URL_ROLES, ROLE_FIELDS, BASE_DATAVERSE_URL_FIELD_SECURITY_PROFILES, FIELD_SECURITY_PROFILE_FIELDS, BASE_DATAVERSE_URL_CONNECTION_REFERENCES, CONNECTION_REFERENCE_FIELDS } from './constants';
import FilterSidebar from './components/FilterSidebar';

const Notification: React.FC<{ message: string; onDismiss: () => void; type?: 'info' | 'warning', theme: Theme }> = ({ message, onDismiss, type = 'info', theme }) => {
    const colors = {
        info: theme === 'dark' ? 'bg-blue-900/50 border-blue-700 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-800',
        warning: theme === 'dark' ? 'bg-yellow-900/50 border-yellow-700 text-yellow-300' : 'bg-yellow-100 border-yellow-300 text-yellow-800',
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 7000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`${colors[type]} px-4 py-3 rounded-lg relative mb-6 flex justify-between items-center`} role="alert">
            <div className="flex-grow">
                <strong className="font-bold">{type === 'warning' ? 'Warning' : 'Info'}</strong>
                <span className="block sm:inline ml-2">{message}</span>
            </div>
            <button onClick={onDismiss} className="p-1 -mr-1 rounded-full hover:bg-black/20" aria-label="Dismiss">
                <CloseIcon />
            </button>
        </div>
    );
};

interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onNext: () => void;
    onPrev: () => void;
    hasNextPage: boolean;
    theme: Theme;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onNext, onPrev, hasNextPage, theme }) => {
    if (totalCount <= 0 && currentPage === 1 && !hasNextPage) return null;

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : startIndex + pageSize -1;

    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = !hasNextPage;
    
    const themeStyles = {
        dark: { text: 'text-[#A7B1C2]', strongText: 'text-[#F3F4F6]', button: 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54]' },
        light: { text: 'text-gray-500', strongText: 'text-gray-900', button: 'bg-gray-200 border-gray-200 hover:bg-gray-300' }
    };
    const currentTheme = themeStyles[theme];

    return (
        <div className={`flex items-center justify-between text-sm ${currentTheme.text} flex-wrap gap-4`}>
            <div>
                Showing <span className={`font-semibold ${currentTheme.strongText}`}>{startIndex}</span> to <span className={`font-semibold ${currentTheme.strongText}`}>{endIndex}</span>
                {totalCount > 0 && ` of ${totalCount.toLocaleString()} results`}
            </div>
            <div className="flex items-center space-x-4">
                <span>Page <span className={`font-semibold ${currentTheme.strongText}`}>{currentPage}</span>{totalCount > 0 && totalPages > 0 ? ` of ${totalPages.toLocaleString()}` : ''}</span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onPrev}
                        disabled={isPrevDisabled}
                        className={`px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${currentTheme.button}`}
                        aria-label="Go to previous page"
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={`px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${currentTheme.button}`}
                        aria-label="Go to next page"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

const themeStyles = {
    dark: {
        bg: 'bg-[#0B253A]',
        text: 'text-[#F3F4F6]',
        secondaryText: 'text-[#A7B1C2]',
        inputBg: 'bg-[#011627]',
        focusRing: 'focus:ring-[#2563EB]',
        sidebarButtonBg: 'bg-[#0B253A]',
        sidebarButtonHover: 'hover:bg-[#143B54]',
        sidebarRingOffset: 'focus:ring-offset-[#011627]',
    },
    light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        secondaryText: 'text-gray-500',
        inputBg: 'bg-gray-200',
        focusRing: 'focus:ring-indigo-500',
        sidebarButtonBg: 'bg-gray-200',
        sidebarButtonHover: 'hover:bg-gray-300',
        sidebarRingOffset: 'focus:ring-offset-gray-100',
    }
};

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onClear: () => void;
    children: React.ReactNode;
    theme: Theme;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, onClear, children, theme }) => {
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
            className={`fixed inset-0 z-40 transition-colors duration-300 ease-in-out ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0`}>
                    <h2 id="filter-panel-title" className={`text-lg font-semibold ${currentTheme.text}`}>Filters & Sorting</h2>
                    <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close filter panel">
                        <CloseIcon />
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto flex-grow">
                    {children}
                </main>
                
                <footer className={`flex justify-between items-center p-4 border-t ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0 bg-opacity-50 ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-50'}`}>
                    <button
                        onClick={onClear}
                        className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-600 hover:text-black'}`}
                    >
                        Clear all
                    </button>
                    <button
                        onClick={onApply}
                        className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8] focus:ring-offset-[#0B253A]' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-white'} focus:ring-[#2563EB]`}
                    >
                        Apply
                    </button>
                </footer>
            </div>
        </div>
    );
};

const CloudFlowsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  const initialFilters = {
      searchTerm: '',
      ownerFilter: '',
      sortBy: 'name',
      sortOrder: 'asc' as 'asc' | 'desc',
      categoryFilter: [] as string[],
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

  const handleApplyFilters = useCallback(() => {
      setAppliedFilters(tempFilters);
      setIsFilterPanelOpen(false);
  }, [tempFilters]);

  const handleClearFilters = () => {
      setTempFilters(initialFilters);
      setAppliedFilters(initialFilters);
      setIsFilterPanelOpen(false);
  };

  const handleFetchData = useCallback(async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const result = await fetchWorkflows(accessToken, urlToFetch);
      
      setWorkflows(result.workflows);
      setNextLink(result.nextLink);
      if (result.totalCount !== -1) {
        setTotalCount(result.totalCount);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setWorkflows([]);
      setTotalCount(0);
      setCurrentPage(1);
      setNextLink(null);
      setPageHistory([]);
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
    }
    if (appliedFilters.isManagedFilter !== 'all') {
      filterParts.push(`ismanaged eq ${appliedFilters.isManagedFilter === 'managed'}`);
    }
    
    const serverSortField = appliedFilters.sortBy;
    const serverSortOrder = appliedFilters.sortOrder;
    const current_page_size = pageSize > 0 ? pageSize : 50;
    
    const queryParams: string[] = [
      `$select=${WORKFLOW_FIELDS}`,
      `$count=true`,
      `$top=${current_page_size}`,
      `$orderby=${serverSortField} ${serverSortOrder}`,
      `$expand=owninguser($select=fullname)`
    ];
    if (filterParts.length > 0) {
      queryParams.push(`$filter=${filterParts.join(' and ')}`);
    }

    const newUrl = `${BASE_DATAVERSE_URL}?${queryParams.join('&')}`;
    
    setCurrentPage(1);
    setPageHistory([newUrl]);
    handleFetchData(newUrl);
  }, [appliedFilters, pageSize, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setPageHistory(prev => [...prev, nextLink]);
        setCurrentPage(prev => prev + 1);
        handleFetchData(nextLink);
    }
  };

  const handlePrevPage = () => {
      if (currentPage > 1) {
          const newHistory = [...pageHistory];
          newHistory.pop();
          const prevPageUrl = newHistory[newHistory.length - 1];
          if (prevPageUrl) {
            setPageHistory(newHistory);
            setCurrentPage(prev => prev - 1);
            handleFetchData(prevPageUrl);
          }
      }
  };

  const handleRowClick = (workflow: Workflow) => setSelectedWorkflow(workflow);
  const handleCloseModal = () => setSelectedWorkflow(null);

  const renderContent = () => {
    if (isLoading) {
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
              <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>View and manage your flows, monitor run history, and analyze performance.</p>
          </div>

          {!isLoading && (
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
                  pageSize={pageSize > 0 ? pageSize : 50}
                  onNext={handleNextPage}
                  onPrev={handlePrevPage}
                  hasNextPage={!!nextLink}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
        <main className="flex-grow overflow-y-auto">
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
                        {WORKFLOW_CATEGORY_OPTIONS.map(option => (
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
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Type</label>
                    <div className="flex space-x-4">
                        {(['all', 'managed', 'unmanaged'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                            id={`managed-type-wf-${type}`}
                            type="radio"
                            name="managed-type-wf"
                            value={type}
                            checked={tempFilters.isManagedFilter === type}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, isManagedFilter: e.target.value as any }))}
                            className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                            />
                            <label htmlFor={`managed-type-wf-${type}`} className={`ml-2 text-sm capitalize ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>
                            {type}
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

const DataflowsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [dataflows, setDataflows] = useState<Dataflow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataflow, setSelectedDataflow] = useState<Dataflow | null>(null);
  
  const initialFilters = {
      searchTerm: '',
      ownerFilter: '',
      sortBy: 'name',
      sortOrder: 'asc' as 'asc' | 'desc'
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

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(tempFilters);
    setIsFilterPanelOpen(false);
  }, [tempFilters]);

  const handleClearFilters = () => {
    setTempFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setIsFilterPanelOpen(false);
  };
  
  const handleFetchData = useCallback(async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const result = await fetchDataflows(accessToken, urlToFetch);
      
      setDataflows(result.dataflows);
      setNextLink(result.nextLink);
      if (result.totalCount !== -1) {
        setTotalCount(result.totalCount);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setDataflows([]);
      setTotalCount(0);
      setCurrentPage(1);
      setNextLink(null);
      setPageHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const filterParts: string[] = [];
    if (appliedFilters.searchTerm) {
      const term = appliedFilters.searchTerm.replace(/'/g, "''");
      filterParts.push(`(contains(msdyn_name, '${term}') or contains(msdyn_description, '${term}'))`);
    }
    if (appliedFilters.ownerFilter) {
      const owner = appliedFilters.ownerFilter.replace(/'/g, "''");
      filterParts.push(`(contains(owninguser/fullname, '${owner}'))`);
    }
    
    const serverSortField = appliedFilters.sortBy === 'name' ? 'msdyn_name' : appliedFilters.sortBy;
    const serverSortOrder = appliedFilters.sortOrder;
    const current_page_size = pageSize > 0 ? pageSize : 50;
    
    const queryParams: string[] = [
      `$select=${DATAFLOW_FIELDS}`,
      `$count=true`,
      `$top=${current_page_size}`,
      `$orderby=${serverSortField} ${serverSortOrder}`,
      `$expand=owninguser($select=fullname)`
    ];
    if (filterParts.length > 0) {
      queryParams.push(`$filter=${filterParts.join(' and ')}`);
    }

    const newUrl = `${BASE_DATAVERSE_URL_DATAFLOWS}?${queryParams.join('&')}`;
    
    setCurrentPage(1);
    setPageHistory([newUrl]);
    handleFetchData(newUrl);
  }, [appliedFilters, pageSize, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setPageHistory(prev => [...prev, nextLink]);
        setCurrentPage(prev => prev + 1);
        handleFetchData(nextLink);
    }
  };

  const handlePrevPage = () => {
      if (currentPage > 1) {
          const newHistory = [...pageHistory];
          newHistory.pop();
          const prevPageUrl = newHistory[newHistory.length - 1];
          if (prevPageUrl) {
            setPageHistory(newHistory);
            setCurrentPage(prev => prev - 1);
            handleFetchData(prevPageUrl);
          }
      }
  };

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
    if (dataflows.length === 0) {
        return (
            <div className={`text-center p-8 ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-lg ${currentTheme.secondaryText}`}>No dataflows found</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-400'}`}>Try adjusting your filter criteria.</p>
            </div>
        );
    }
    return <DataflowTable dataflows={dataflows} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
          {notification && <Notification message={notification} onDismiss={() => setNotification(null)} type="warning" theme={theme} />}
          
          <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Dataflows</h2>
              <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>View and manage your dataflows, monitor refresh history, and analyze performance.</p>
          </div>

          {!isLoading && (
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
                  pageSize={pageSize > 0 ? pageSize : 50}
                  onNext={handleNextPage}
                  onPrev={handlePrevPage}
                  hasNextPage={!!nextLink}
                  theme={theme}
                />
              </div>
            </div>
          )}
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
                      placeholder="By name or description..."
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
                  <label htmlFor="sort-by-df" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}`}>Sort by</label>
                  <div className="flex items-center gap-2">
                    <select
                      id="sort-by-df"
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

const SolutionsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
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

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(tempFilters);
    setIsFilterPanelOpen(false);
  }, [tempFilters]);

  const handleClearFilters = () => {
    setTempFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setIsFilterPanelOpen(false);
  };
  
  const handleFetchData = useCallback(async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const result = await fetchSolutions(accessToken, urlToFetch);
      
      setSolutions(result.solutions);
      setNextLink(result.nextLink);
      if (result.totalCount !== -1) {
        setTotalCount(result.totalCount);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setSolutions([]);
      setTotalCount(0);
      setCurrentPage(1);
      setNextLink(null);
      setPageHistory([]);
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
    const current_page_size = pageSize > 0 ? pageSize : 50;
    
    const queryParams: string[] = [
      `$select=${SOLUTION_FIELDS}`,
      `$count=true`,
      `$top=${current_page_size}`,
      `$orderby=${serverSortField} ${serverSortOrder}`,
      `$expand=publisherid($select=friendlyname)`
    ];
    if (filterParts.length > 0) {
      queryParams.push(`$filter=${filterParts.join(' and ')}`);
    }

    const newUrl = `${BASE_DATAVERSE_URL_SOLUTIONS}?${queryParams.join('&')}`;
    
    setCurrentPage(1);
    setPageHistory([newUrl]);
    handleFetchData(newUrl);
  }, [appliedFilters, pageSize, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setPageHistory(prev => [...prev, nextLink]);
        setCurrentPage(prev => prev + 1);
        handleFetchData(nextLink);
    }
  };

  const handlePrevPage = () => {
      if (currentPage > 1) {
          const newHistory = [...pageHistory];
          newHistory.pop();
          const prevPageUrl = newHistory[newHistory.length - 1];
          if (prevPageUrl) {
            setPageHistory(newHistory);
            setCurrentPage(prev => prev - 1);
            handleFetchData(prevPageUrl);
          }
      }
  };

  const handleRowClick = (solution: Solution) => setSelectedSolution(solution);
  const handleCloseModal = () => setSelectedSolution(null);

  const renderContent = () => {
    if (isLoading) {
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

          {!isLoading && (
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
                  pageSize={pageSize > 0 ? pageSize : 50}
                  onNext={handleNextPage}
                  onPrev={handlePrevPage}
                  hasNextPage={!!nextLink}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
        <main className="flex-grow overflow-y-auto">
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

const AuditLogsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
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

  const handleApplyFilters = useCallback(() => {
      setAppliedFilters(tempFilters);
      setIsFilterPanelOpen(false);
      setCurrentPage(1); // Reset to first page on new filter
      setNextLink(null);
  }, [tempFilters]);

  const handleClearFilters = () => {
      setTempFilters(initialFilters);
      setAppliedFilters(initialFilters);
      setIsFilterPanelOpen(false);
      setCurrentPage(1);
      setNextLink(null);
  };
  
  const handleFetchData = useCallback(async (filters: FilterCriteria, link: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLogs(filters, link);
      setLogs(result.logs);
      setNextLink(result.nextLink);
      if (result.totalCount !== -1 && currentPage === 1) {
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
  }, [currentPage]);

  useEffect(() => {
    handleFetchData(appliedFilters, null);
  }, [appliedFilters, handleFetchData]);

  const handleNextPage = () => {
    if (nextLink) {
        setCurrentPage(prev => prev + 1);
        handleFetchData(appliedFilters, nextLink);
    }
  };

  const handlePrevPage = () => {
      setNotification("Going to the previous page is not supported with this API. Please apply filters again to restart from the first page.");
  };

  const handleRowClick = (log: AuditLog) => setSelectedLog(log);
  const handleCloseModal = () => setSelectedLog(null);

  const renderContent = () => {
    if (isLoading) {
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
            {!isLoading && (
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
                            pageSize={appliedFilters.pageSize > 0 ? appliedFilters.pageSize : 50}
                            onNext={handleNextPage}
                            onPrev={handlePrevPage}
                            hasNextPage={!!nextLink}
                            theme={theme}
                        />
                    </div>
                </div>
            )}
        </div>
        <main className="flex-grow overflow-y-auto">
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

const EnvironmentVariablesView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<EnvironmentVariable | null>(null);
  
  const initialFilters = {
    searchTerm: '',
    sortBy: 'displayname',
    sortOrder: 'asc' as 'asc' | 'desc',
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

  const handleFetchData = useCallback(async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const result = await fetchEnvironmentVariables(accessToken, urlToFetch);
      
      setVariables(result.variables);
      setNextLink(result.nextLink);
      if (result.totalCount !== -1) {
        setTotalCount(result.totalCount);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setVariables([]);
      setTotalCount(0);
      setCurrentPage(1);
      setNextLink(null);
      setPageHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sortedAndFilteredVariables = React.useMemo(() => {
    let items = [...variables];
    // Client-side filtering
    if (appliedFilters.searchTerm) {
        const term = appliedFilters.searchTerm.toLowerCase();
        items = items.filter(v => 
            v.displayname.toLowerCase().includes(term) ||
            v.schemaname.toLowerCase().includes(term) ||
            v.description?.toLowerCase().includes(term)
        );
    }
    // Client-side sorting
    items.sort((a, b) => {
        const field = appliedFilters.sortBy as keyof EnvironmentVariable;
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return appliedFilters.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return appliedFilters.sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    return items;
  }, [variables, appliedFilters]);

  useEffect(() => {
    const queryParams: string[] = [
      `$count=true`,
      `$top=1000`, // Fetch a large number for client-side filtering/sorting
      `$expand=environmentvariabledefinitionid($select=${ENVVAR_DEFINITION_FIELDS};$expand=owninguser($select=fullname))`
    ];
    
    const newUrl = `${BASE_DATAVERSE_URL_ENVVAR_VALUES}?${queryParams.join('&')}`;
    
    setCurrentPage(1);
    setPageHistory([newUrl]);
    handleFetchData(newUrl);
  }, [handleFetchData]); // Run once on mount

  const handleRowClick = (variable: EnvironmentVariable) => setSelectedVariable(variable);
  const handleCloseModal = () => setSelectedVariable(null);
  
  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
    if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
    if (sortedAndFilteredVariables.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No environment variables found.</div>;
    return <EnvironmentVariableTable variables={sortedAndFilteredVariables} onRowClick={handleRowClick} theme={theme} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Environment Variables</h2>
        <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Manage configuration data for your applications and flows.</p>
      </div>
       <div className="pb-4">
          <button
            onClick={() => { setTempFilters(appliedFilters); setIsFilterPanelOpen(true); }}
            className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
          >
            <FilterIcon className="h-4 w-4" /> Filters & Sort
          </button>
      </div>
      <main className="flex-grow overflow-y-auto">{renderContent()}</main>
      <EnvironmentVariableDetailModal variable={selectedVariable} onClose={handleCloseModal} theme={theme} />
{/* FIX: Add children to FilterPanel to resolve missing prop error. */}
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={() => { setAppliedFilters(tempFilters); setIsFilterPanelOpen(false); }} onClear={() => { setAppliedFilters(initialFilters); setTempFilters(initialFilters); setIsFilterPanelOpen(false); }} theme={theme}>
        <div className="space-y-6">
            <div>
                <label htmlFor="search-term-envvar" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchIcon /></div>
                    <input
                        type="text"
                        id="search-term-envvar"
                        value={tempFilters.searchTerm}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        placeholder="By name, schema, or description..."
                        className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="sort-by-envvar" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Sort by</label>
                <div className="flex items-center gap-2">
                    <select
                        id="sort-by-envvar"
                        value={tempFilters.sortBy}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                    >
                        <option value="displayname">Display Name</option>
                        <option value="schemaname">Schema Name</option>
                        <option value="modifiedon">Modified Date</option>
                        <option value="typeName">Type</option>
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

const CanvasAppsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
    const [apps, setApps] = useState<CanvasApp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<CanvasApp | null>(null);

    const initialFilters = {
        searchTerm: '',
        ownerFilter: '',
        isManagedFilter: 'all' as 'all' | 'managed' | 'unmanaged',
        sortBy: 'createdtime',
        sortOrder: 'desc' as 'asc' | 'desc',
    };
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [tempFilters, setTempFilters] = useState(initialFilters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const currentTheme = themeStyles[theme];

    const handleFetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const accessToken = await fetchAccessToken();
            // Virtual tables have limitations, so we fetch a large set and filter/sort on the client.
            const queryParams = [
                `$select=${CANVAS_APP_FIELDS}`,
                `$top=1000` // Fetch up to 1000 apps
            ];
            const url = `${BASE_DATAVERSE_URL_CANVAS_APPS}?${queryParams.join('&')}`;
            const result = await fetchCanvasApps(accessToken, url);
            setApps(result.apps);
        } catch (err) {
            if (err instanceof Error) setError(`Failed to fetch data: ${err.message}.`);
            else setError('An unknown error occurred.');
            setApps([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        handleFetchData();
    }, [handleFetchData]);

    const sortedAndFilteredApps = React.useMemo(() => {
        let items = [...apps];
        // Client-side filtering
        if (appliedFilters.searchTerm) {
            const term = appliedFilters.searchTerm.toLowerCase();
            items = items.filter(app =>
                app.displayname.toLowerCase().includes(term) ||
                (app.description && app.description.toLowerCase().includes(term))
            );
        }
        if (appliedFilters.ownerFilter) {
            const owner = appliedFilters.ownerFilter.toLowerCase();
            items = items.filter(app =>
                app['_ownerid_value@OData.Community.Display.V1.FormattedValue']?.toLowerCase().includes(owner)
            );
        }
        if (appliedFilters.isManagedFilter !== 'all') {
            const isManaged = appliedFilters.isManagedFilter === 'managed';
            items = items.filter(app => app.ismanaged === isManaged);
        }

        // Client-side sorting
        items.sort((a, b) => {
            const field = appliedFilters.sortBy as keyof CanvasApp;
            const valA = a[field] ?? '';
            const valB = b[field] ?? '';
            
            // Handle date sorting
            if (field === 'createdtime' || field === 'lastmodifiedtime' || field === 'lastpublishtime') {
                const dateA = new Date(valA.toString()).getTime();
                const dateB = new Date(valB.toString()).getTime();
                 if (dateA < dateB) return appliedFilters.sortOrder === 'asc' ? -1 : 1;
                 if (dateA > dateB) return appliedFilters.sortOrder === 'asc' ? 1 : -1;
                 return 0;
            }

            if (valA < valB) return appliedFilters.sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return appliedFilters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return items;
    }, [apps, appliedFilters]);

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (sortedAndFilteredApps.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Canvas Apps found.</div>;
        return <CanvasAppTable apps={sortedAndFilteredApps} onRowClick={setSelectedApp} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Canvas Apps</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse and manage Canvas Apps in the environment.</p>
            </div>
            <div className="pb-4">
                <button
                    onClick={() => { setTempFilters(appliedFilters); setIsFilterPanelOpen(true); }}
                    className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                    <FilterIcon className="h-4 w-4" /> Filters & Sort
                </button>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <CanvasAppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} theme={theme} />
{/* FIX: Add children to FilterPanel to resolve missing prop error. */}
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={() => { setAppliedFilters(tempFilters); setIsFilterPanelOpen(false); }} onClear={() => { setAppliedFilters(initialFilters); setTempFilters(initialFilters); setIsFilterPanelOpen(false); }} theme={theme}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="search-term-canvas" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchIcon /></div>
                            <input
                                type="text"
                                id="search-term-canvas"
                                value={tempFilters.searchTerm}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                placeholder="By name or description..."
                                className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="owner-filter-canvas" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Owner</label>
                        <input
                            type="text"
                            id="owner-filter-canvas"
                            value={tempFilters.ownerFilter}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, ownerFilter: e.target.value }))}
                            placeholder="Filter by owner name..."
                            className={`w-full px-3 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Type</label>
                        <div className="flex space-x-4">
                            {(['all', 'managed', 'unmanaged'] as const).map(type => (
                            <div key={type} className="flex items-center">
                                <input
                                    id={`managed-type-canvas-${type}`}
                                    type="radio"
                                    name="managed-type-canvas"
                                    value={type}
                                    checked={tempFilters.isManagedFilter === type}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, isManagedFilter: e.target.value as any }))}
                                    className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                                />
                                <label htmlFor={`managed-type-canvas-${type}`} className={`ml-2 text-sm capitalize ${currentTheme.text}`}>{type}</label>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="sort-by-canvas" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Sort by</label>
                        <div className="flex items-center gap-2">
                            <select
                                id="sort-by-canvas"
                                value={tempFilters.sortBy}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                            >
                                <option value="displayname">Name</option>
                                <option value="createdtime">Created Date</option>
                                <option value="lastmodifiedtime">Modified Date</option>
                                <option value="lastpublishtime">Published Date</option>
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

const ModelDrivenAppsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
    const [apps, setApps] = useState<ModelDrivenApp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<ModelDrivenApp | null>(null);

    const initialFilters = {
        searchTerm: '',
        isManagedFilter: 'all' as 'all' | 'managed' | 'unmanaged',
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
    };
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [tempFilters, setTempFilters] = useState(initialFilters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const currentTheme = themeStyles[theme];

    const handleFetchData = useCallback(async (url: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const accessToken = await fetchAccessToken();
            const result = await fetchModelDrivenApps(accessToken, url);
            setApps(result.apps);
        } catch (err) {
            if (err instanceof Error) setError(`Failed to fetch data: ${err.message}.`);
            else setError('An unknown error occurred.');
            setApps([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const filterParts: string[] = [];
        if (appliedFilters.searchTerm) {
            const term = appliedFilters.searchTerm.replace(/'/g, "''");
            filterParts.push(`(contains(name, '${term}') or contains(uniquename, '${term}'))`);
        }
        if (appliedFilters.isManagedFilter !== 'all') {
            filterParts.push(`ismanaged eq ${appliedFilters.isManagedFilter === 'managed'}`);
        }

        const queryParams = [
            `$select=${MODEL_DRIVEN_APP_FIELDS}`,
            `$top=1000`, // Fetch up to 1000 apps
            `$orderby=${appliedFilters.sortBy} ${appliedFilters.sortOrder}`,
        ];
        if (filterParts.length > 0) {
            queryParams.push(`$filter=${filterParts.join(' and ')}`);
        }
        const newUrl = `${BASE_DATAVERSE_URL_MODEL_DRIVEN_APPS}?${queryParams.join('&')}`;
        handleFetchData(newUrl);
    }, [appliedFilters, handleFetchData]);
    
    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (apps.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Model-driven Apps found.</div>;
        return <ModelDrivenAppTable apps={apps} onRowClick={setSelectedApp} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Model-driven Apps</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse and manage Model-driven Apps in the environment.</p>
            </div>
            <div className="pb-4">
                 <button
                    onClick={() => { setTempFilters(appliedFilters); setIsFilterPanelOpen(true); }}
                    className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                    <FilterIcon className="h-4 w-4" /> Filters & Sort
                </button>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <ModelDrivenAppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} theme={theme} />
{/* FIX: Add children to FilterPanel to resolve missing prop error. */}
             <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={() => { setAppliedFilters(tempFilters); setIsFilterPanelOpen(false); }} onClear={() => { setAppliedFilters(initialFilters); setTempFilters(initialFilters); setIsFilterPanelOpen(false); }} theme={theme}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="search-term-model" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchIcon /></div>
                            <input
                                type="text"
                                id="search-term-model"
                                value={tempFilters.searchTerm}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                placeholder="By name or unique name..."
                                className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Type</label>
                        <div className="flex space-x-4">
                            {(['all', 'managed', 'unmanaged'] as const).map(type => (
                            <div key={type} className="flex items-center">
                                <input
                                    id={`managed-type-model-${type}`}
                                    type="radio"
                                    name="managed-type-model"
                                    value={type}
                                    checked={tempFilters.isManagedFilter === type}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, isManagedFilter: e.target.value as any }))}
                                    className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                                />
                                <label htmlFor={`managed-type-model-${type}`} className={`ml-2 text-sm capitalize ${currentTheme.text}`}>{type}</label>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="sort-by-model" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Sort by</label>
                        <div className="flex items-center gap-2">
                            <select
                                id="sort-by-model"
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

const CustomControlsView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [controls, setControls] = useState<CustomControl[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedControl, setSelectedControl] = useState<CustomControl | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_CUSTOM_CONTROLS}?$select=${CUSTOM_CONTROL_FIELDS}&$orderby=name asc`;
                const result = await fetchCustomControls(token, url);
                setControls(result.controls);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredControls = controls.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (filteredControls.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No PCF Controls found.</div>;
        return <CustomControlTable controls={filteredControls} onRowClick={setSelectedControl} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>PCF Controls</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse Power Apps Component Framework controls in the environment.</p>
            </div>
            {/* Add filter button here */}
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <CustomControlDetailModal control={selectedControl} onClose={() => setSelectedControl(null)} theme={theme} />
        </div>
    );
};

const WebResourcesView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [resources, setResources] = useState<WebResource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedResource, setSelectedResource] = useState<WebResource | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const currentTheme = themeStyles[theme];
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_WEB_RESOURCES}?$select=${WEB_RESOURCE_FIELDS}&$orderby=name asc`;
                const result = await fetchWebResources(token, url);
                setResources(result.resources);
            } catch (err) {
                 if (err instanceof Error) setError(err.message);
                 else setError('An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredResources = resources.filter(r => 
        (r.displayname?.toLowerCase() || r.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

     const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (filteredResources.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Web Resources found.</div>;
        return <WebResourceTable resources={filteredResources} onRowClick={setSelectedResource} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Web Resources</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse images, scripts, and stylesheets used in your apps.</p>
            </div>
            {/* Add filter button here */}
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <WebResourceDetailModal resource={selectedResource} onClose={() => setSelectedResource(null)} theme={theme} />
        </div>
    );
};

const SiteMapsView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [sitemaps, setSitemaps] = useState<SiteMap[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSitemap, setSelectedSitemap] = useState<SiteMap | null>(null);
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_SITEMAPS}?$select=${SITEMAP_FIELDS}&$orderby=sitemapname asc`;
                const result = await fetchSiteMaps(token, url);
                setSitemaps(result.sitemaps);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (sitemaps.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Site Maps found.</div>;
        return <SiteMapTable sitemaps={sitemaps} onRowClick={setSelectedSitemap} theme={theme} />;
    };

    return (
         <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Site Maps</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Inspect the navigation structure of your Model-driven Apps.</p>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <SiteMapDetailModal sitemap={selectedSitemap} onClose={() => setSelectedSitemap(null)} theme={theme} />
        </div>
    );
};

const SecurityRolesView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [roles, setRoles] = useState<SecurityRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<SecurityRole | null>(null);
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_ROLES}?$select=${ROLE_FIELDS}&$expand=businessunitid($select=name)&$orderby=name asc`;
                const result = await fetchSecurityRoles(token, url);
                setRoles(result.roles);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (roles.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Security Roles found.</div>;
        return <SecurityRoleTable roles={roles} onRowClick={setSelectedRole} theme={theme} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Security Roles</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Audit and manage user permissions and access levels.</p>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <SecurityRoleDetailModal role={selectedRole} onClose={() => setSelectedRole(null)} theme={theme} />
        </div>
    );
};

const FieldSecurityProfilesView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [profiles, setProfiles] = useState<FieldSecurityProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<FieldSecurityProfile | null>(null);
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_FIELD_SECURITY_PROFILES}?$select=${FIELD_SECURITY_PROFILE_FIELDS}&$orderby=name asc`;
                const result = await fetchFieldSecurityProfiles(token, url);
                setProfiles(result.profiles);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (profiles.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Field Security Profiles found.</div>;
        return <FieldSecurityProfileTable profiles={profiles} onRowClick={setSelectedProfile} theme={theme} />;
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Field Security Profiles</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Manage access to specific fields within your tables.</p>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <FieldSecurityProfileDetailModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} theme={theme} />
        </div>
    );
};

const ConnectionReferencesView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [connections, setConnections] = useState<ConnectionReference[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<ConnectionReference | null>(null);
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_CONNECTION_REFERENCES}?$select=${CONNECTION_REFERENCE_FIELDS}&$expand=ownerid($select=fullname)&$orderby=connectionreferencelogicalname asc`;
                const result = await fetchConnectionReferences(token, url);
                setConnections(result.connections);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className="p-4 text-red-400 bg-red-900/50 rounded">{error}</div>;
        if (connections.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Connection References found.</div>;
        return <ConnectionReferenceTable connections={connections} onRowClick={setSelectedConnection} theme={theme} />;
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Connection References</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Review how your apps and flows connect to services and data.</p>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <ConnectionReferenceDetailModal connection={selectedConnection} onClose={() => setSelectedConnection(null)} theme={theme} />
        </div>
    );
};

interface PowerAutomateTrackerProps {
  notification: string | null;
  setNotification: (message: string | null) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const PowerAutomateTracker: React.FC<PowerAutomateTrackerProps> = ({ notification, setNotification, theme, toggleTheme }) => {
    const [activeView, setActiveView] = useState('Cloud flows');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const renderActiveView = () => {
        const props = { notification, setNotification, theme };
        switch (activeView) {
            case 'Cloud flows':
                return <CloudFlowsView {...props} />;
            case 'Dataflows':
                return <DataflowsView {...props} />;
            case 'Solution Inventory':
                return <SolutionsView {...props} />;
            case 'Audit Logs':
                 return <AuditLogsView {...props} />;
            case 'Environment Variables':
                return <EnvironmentVariablesView {...props} />;
            case 'Canvas Apps':
                return <CanvasAppsView {...props} />;
            case 'Model-driven Apps':
                return <ModelDrivenAppsView {...props} />;
            case 'Plugins & PCF Controls':
                return <CustomControlsView theme={theme} />;
            case 'Web Resources':
                return <WebResourcesView theme={theme} />;
            case 'Site maps':
                return <SiteMapsView theme={theme} />;
            case 'Security Roles':
                return <SecurityRolesView theme={theme} />;
            case 'Field Security Profiles':
                return <FieldSecurityProfilesView theme={theme} />;
            case 'Connection references':
                return <ConnectionReferencesView theme={theme} />;
            default:
                return (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'}`}>
                        <h2 className={`text-xl font-semibold ${themeStyles[theme].text}`}>View Not Implemented</h2>
                        <p className={`mt-2 text-sm ${themeStyles[theme].secondaryText}`}>The view for "{activeView}" has not been implemented.</p>
                    </div>
                );
        }
    };
    
    return (
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-100'} p-4 gap-4`}>
            <FilterSidebar 
                isExpanded={isSidebarExpanded} 
                theme={theme} 
                activeView={activeView} 
                onViewChange={setActiveView} 
            />
            <div className={`flex-1 flex flex-col rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-white'}`}>
                 <header className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0 bg-opacity-90 backdrop-blur-sm`}>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                            <ChevronLeftIcon className={`h-6 w-6 transition-transform ${isSidebarExpanded ? '' : 'rotate-180'} ${themeStyles[theme].text}`} />
                        </button>
                         <h1 className={`text-xl font-bold ${themeStyles[theme].text} whitespace-nowrap overflow-hidden text-ellipsis`}>{activeView}</h1>
                    </div>
                    <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                        <SunIcon className={`h-6 w-6 ${themeStyles[theme].text}`} />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {renderActiveView()}
                </div>
            </div>
        </div>
    );
};

export default PowerAutomateTracker;