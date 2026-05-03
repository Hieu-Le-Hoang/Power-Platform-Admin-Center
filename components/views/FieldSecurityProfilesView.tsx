import React, { useState, useEffect } from 'react';
import { fetchFieldSecurityProfiles, fetchAccessToken } from '../../services/dataverseService';
import type { FieldSecurityProfile, Theme } from '../../types';
import { FieldSecurityProfileTable } from '../tables/FieldSecurityProfileTable';
import { FieldSecurityProfileDetailModal } from '../details/FieldSecurityProfileDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_FIELD_SECURITY_PROFILES, FIELD_SECURITY_PROFILE_FIELDS } from '../../constants';

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

export const FieldSecurityProfilesView: React.FC<{ theme: Theme }> = ({ theme }) => {
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
                const url = `${BASE_DATAVERSE_URL_FIELD_SECURITY_PROFILES}?$select=${FIELD_SECURITY_PROFILE_FIELDS}&$orderby=name asc&$top=500`;
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
