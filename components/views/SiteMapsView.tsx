import React, { useState, useEffect } from 'react';
import { fetchSiteMaps, fetchAccessToken } from '../../services/dataverseService';
import type { SiteMap, Theme } from '../../types';
import { SiteMapTable } from '../tables/SiteMapTable';
import { SiteMapDetailModal } from '../details/SiteMapDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_SITEMAPS, SITEMAP_FIELDS } from '../../constants';

const themeStyles = {
    dark: {
        bg: 'bg-[#0B253A]',
        text: 'text-[#F3F4F6]',
        secondaryText: 'text-[#A7B1C2]',
    },
    light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        secondaryText: 'text-gray-500',
    }
};

export const SiteMapsView: React.FC<{ theme: Theme }> = ({ theme }) => {
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
                const url = `${BASE_DATAVERSE_URL_SITEMAPS}?$select=${SITEMAP_FIELDS}&$orderby=sitemapname asc&$top=500`;
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
