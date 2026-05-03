import React, { useState, useEffect, useCallback } from 'react';
import { fetchCanvasApps, fetchAccessToken } from '../../services/dataverseService';
import type { CanvasApp, Theme } from '../../types';
import { CanvasAppTable } from '../tables/CanvasAppTable';
import { CanvasAppDetailModal } from '../details/CanvasAppDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_CANVAS_APPS, CANVAS_APP_FIELDS } from '../../constants';
import { FilterPanel } from '../shared/FilterPanel';

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

export const CanvasAppsView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
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
                (app.description && app.description.toLowerCase().includes(term)) ||
                app.canvasappid.toLowerCase().includes(term)
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
                                placeholder="By name, description, or ID..."
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