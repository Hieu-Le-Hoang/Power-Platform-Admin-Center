import React, { useEffect } from 'react';
import type { Theme } from '../../types';
import { CloseIcon } from '../IconComponents';

export const Notification: React.FC<{ message: string; onDismiss: () => void; type?: 'info' | 'warning', theme: Theme }> = ({ message, onDismiss, type = 'info', theme }) => {
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
