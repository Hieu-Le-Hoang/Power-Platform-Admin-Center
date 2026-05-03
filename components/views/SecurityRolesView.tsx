import React, { useState, useEffect } from 'react';
import { fetchSecurityRoles, fetchAccessToken } from '../../services/dataverseService';
import type { SecurityRole, Theme } from '../../types';
import { SecurityRoleTable } from '../tables/SecurityRoleTable';
import { SecurityRoleDetailModal } from '../details/SecurityRoleDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_ROLES, ROLE_FIELDS } from '../../constants';

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

export const SecurityRolesView: React.FC<{ theme: Theme }> = ({ theme }) => {
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
                const url = `${BASE_DATAVERSE_URL_ROLES}?$select=${ROLE_FIELDS}&$expand=businessunitid($select=name)&$orderby=name asc&$top=500`;
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
