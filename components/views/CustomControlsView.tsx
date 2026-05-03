import React, { useState, useEffect } from 'react';
import { fetchCustomControls, fetchAccessToken } from '../../services/dataverseService';
import type { CustomControl, Theme } from '../../types';
import { CustomControlTable } from '../tables/CustomControlTable';
import { CustomControlDetailModal } from '../details/CustomControlDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_CUSTOM_CONTROLS, CUSTOM_CONTROL_FIELDS } from '../../constants';

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

export const CustomControlsView: React.FC<{ theme: Theme }> = ({ theme }) => {
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
                const url = `${BASE_DATAVERSE_URL_CUSTOM_CONTROLS}?$select=${CUSTOM_CONTROL_FIELDS}&$expand=createdby($select=fullname)&$orderby=name asc&$top=500`;
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
