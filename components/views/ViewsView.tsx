import React, { useState, useEffect, useCallback } from 'react';
import { fetchViews, fetchAccessToken } from '../../services/dataverseService';
import type { View, Theme } from '../../types';
import { ViewTable } from '../tables/ViewTable';
import { ViewDetailModal } from '../details/ViewDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_VIEWS, VIEW_FIELDS, VIEW_TYPE_OPTIONS } from '../../constants';
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

export const ViewsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
    const [views, setViews] = useState<View[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<View | null>(null);

    const initialFilters = {
        searchTerm: '',
        tableFilter: '',
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
        viewTypeFilter: [] as string[],
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

    const handleFetchData = useCallback(async (urlToFetch: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const accessToken = await fetchAccessToken();
            const result = await fetchViews(accessToken, urlToFetch);
            setViews(result.views);
            setNextLink(result.nextLink);
            if (result.totalCount !== -1) {
                setTotalCount(result.totalCount);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setViews([]);
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
        if (appliedFilters.tableFilter) {
            const table = appliedFilters.tableFilter.replace(/'/g, "''").toLowerCase();
            filterParts.push(`returnedtypecode eq '${table}'`);
        }
        if (appliedFilters.viewTypeFilter.length > 0) {
            const typeConditions = appliedFilters.viewTypeFilter.map(c => `querytype eq ${c}`).join(' or ');
            filterParts.push(`(${typeConditions})`);
        }
        if (appliedFilters.isManagedFilter !== 'all') {
            filterParts.push(`ismanaged eq ${appliedFilters.isManagedFilter === 'managed'}`);
        }
        
        const queryParams: string[] = [
            `$select=${VIEW_FIELDS}`,
            `$count=true`,
            `$top=${pageSize}`,
            `$orderby=${appliedFilters.sortBy} ${appliedFilters.sortOrder}`,
        ];
        if (filterParts.length > 0) {
            queryParams.push(`$filter=${filterParts.join(' and ')}`);
        }

        const newUrl = `${BASE_DATAVERSE_URL_VIEWS}?${queryParams.join('&')}`;
        
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

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-8"><LoadingIcon /></div>;
        if (error) return <div className={`p-4 rounded text-red-400 bg-red-900/50`}>{error}</div>;
        if (views.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Views found.</div>;
        return <ViewTable views={views} onRowClick={setSelectedView} theme={theme} />;
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Views</h2>
                    <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse and inspect entity views in your environment.</p>
                </div>

                {!isLoading && (
                     <div className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <button
                            onClick={() => { setTempFilters(appliedFilters); setIsFilterPanelOpen(true); }}
                            className={`flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${theme === 'dark' ? 'bg-[#0B253A] border-[#143B54] hover:bg-[#143B54] text-[#E5E7EB]' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                        >
                            <FilterIcon className="h-4 w-4" /> Filters & Sort
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
                )}
            </div>

            <main className="flex-grow overflow-y-auto">{renderContent()}</main>

            <ViewDetailModal view={selectedView} onClose={() => setSelectedView(null)} theme={theme} />

            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={() => {setAppliedFilters(tempFilters); setIsFilterPanelOpen(false);}} onClear={() => {setAppliedFilters(initialFilters); setTempFilters(initialFilters); setIsFilterPanelOpen(false);}} theme={theme}>
                 <div className="space-y-6">
                    <div>
                        <label htmlFor="search-term-view" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchIcon /></div>
                            <input
                                type="text"
                                id="search-term-view"
                                value={tempFilters.searchTerm}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                placeholder="By name or description..."
                                className={`w-full pl-10 pr-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="table-filter-view" className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Table Name</label>
                        <input
                            type="text"
                            id="table-filter-view"
                            value={tempFilters.tableFilter}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, tableFilter: e.target.value }))}
                            placeholder="e.g., account"
                            className={`w-full px-4 py-2 text-sm ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2]`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>View Type</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {VIEW_TYPE_OPTIONS.map(option => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        id={`type-${option.value}`}
                                        type="checkbox"
                                        value={option.value}
                                        checked={tempFilters.viewTypeFilter.includes(option.value)}
                                        onChange={(e) => {
                                            const { value, checked } = e.target;
                                            const newTypes = checked
                                                ? [...tempFilters.viewTypeFilter, value]
                                                : tempFilters.viewTypeFilter.filter(c => c !== value);
                                            setTempFilters(prev => ({ ...prev, viewTypeFilter: newTypes }));
                                        }}
                                        className={`h-4 w-4 rounded ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                                    />
                                    <label htmlFor={`type-${option.value}`} className={`ml-3 text-sm ${currentTheme.text}`}>
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Managed State</label>
                        <div className="flex space-x-4">
                            {(['all', 'managed', 'unmanaged'] as const).map(type => (
                            <div key={type} className="flex items-center">
                                <input
                                id={`managed-type-view-${type}`}
                                type="radio"
                                name="managed-type-view"
                                value={type}
                                checked={tempFilters.isManagedFilter === type}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, isManagedFilter: e.target.value as any }))}
                                className={`h-4 w-4 ${theme === 'dark' ? 'bg-[#011627] border-[#143B54]' : 'border-gray-300'} text-indigo-600 focus:ring-indigo-500`}
                                />
                                <label htmlFor={`managed-type-view-${type}`} className={`ml-2 text-sm capitalize ${currentTheme.text}`}>{type}</label>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="sort-by-view" className={`block text-sm font-medium mb-1 ${currentTheme.text}`}>Sort by</label>
                        <div className="flex items-center gap-2">
                            <select
                                id="sort-by-view"
                                value={tempFilters.sortBy}
                                onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className={`w-full ${currentTheme.inputBg} border border-transparent rounded-md focus:outline-none focus:ring-2 ${currentTheme.focusRing} ${currentTheme.text} placeholder-[#A7B1C2] px-3 py-2 text-sm`}
                            >
                                <option value="name">Name</option>
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