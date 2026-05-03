import React, { useState, useEffect } from 'react';
import { fetchForms, fetchAccessToken } from '../../services/dataverseService';
import type { Form, Theme } from '../../types';
import { FormTable } from '../tables/FormTable';
import { FormDetailModal } from '../details/FormDetailModal';
import { LoadingIcon } from '../IconComponents';
import { BASE_DATAVERSE_URL_FORMS, FORM_FIELDS } from '../../constants';

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

export const FormsView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const currentTheme = themeStyles[theme];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await fetchAccessToken();
                const url = `${BASE_DATAVERSE_URL_FORMS}?$select=${FORM_FIELDS}&$orderby=name asc&$top=500`;
                const result = await fetchForms(token, url);
                setForms(result.forms);
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
        if (error) return <div className={`p-4 rounded text-red-400 bg-red-900/50`}>{error}</div>;
        if (forms.length === 0) return <div className={`p-8 text-center ${currentTheme.secondaryText}`}>No Forms found.</div>;
        return <FormTable forms={forms} onRowClick={setSelectedForm} theme={theme} />;
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className={`mb-6 border-b pb-4 ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Forms</h2>
                <p className={`mt-1 text-sm ${currentTheme.secondaryText}`}>Browse and inspect entity forms in your environment.</p>
            </div>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <FormDetailModal form={selectedForm} onClose={() => setSelectedForm(null)} theme={theme} />
        </div>
    );
};
