import React, { useState, useEffect, useCallback } from 'react';
import { fetchEnvironmentVariables, fetchAccessToken } from '../../services/dataverseService';
import type { EnvironmentVariable, Theme } from '../../types';
import { EnvironmentVariableTable } from '../tables/EnvironmentVariableTable';
import { EnvironmentVariableDetailModal } from '../details/EnvironmentVariableDetailModal';
import { LoadingIcon, SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_ENVVAR_VALUES, ENVVAR_DEFINITION_FIELDS } from '../../constants';
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

export const EnvironmentVariablesView: React.FC<{ notification: string | null; setNotification: (message: string | null) => void; theme: Theme }> = ({ notification, setNotification, theme }) => {
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
  
  const currentTheme = themeStyles[theme];

  const handleFetchData = useCallback(async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken();
      const result = await fetchEnvironmentVariables(accessToken, urlToFetch);
      setVariables(result.variables);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}.`);
      } else {
        setError('An unknown error occurred.');
      }
      setVariables([]);
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