import React, { useState, useEffect } from 'react';
import { fetchConnectionReferences, fetchAccessToken } from '../../services/dataverseService';
import type { ConnectionReference, Theme } from '../../types';
import { ConnectionReferenceTable } from '../tables/ConnectionReferenceTable';
import { ConnectionReferenceDetailModal } from '../details/ConnectionReferenceDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_CONNECTION_REFERENCES, CONNECTION_REFERENCE_FIELDS } from '../../constants';

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

export const ConnectionReferencesView: React.FC<{ theme: Theme }> = ({ theme }) => {
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
                const url = `${BASE_DATAVERSE_URL_CONNECTION_REFERENCES}?$select=${CONNECTION_REFERENCE_FIELDS}&$expand=ownerid($select=fullname)&$orderby=connectionreferencelogicalname asc&$top=500`;
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
