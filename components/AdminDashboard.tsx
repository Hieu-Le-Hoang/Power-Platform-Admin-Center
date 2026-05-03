import React, { useState } from 'react';
import type { Theme } from '../types';
import { SunIcon, ChevronLeftIcon } from './IconComponents';
import NavigationSidebar from './NavigationSidebar';
import { CloudFlowsView } from './views/CloudFlowsView';
import { DataflowsView } from './views/DataflowsView';
import { SolutionsView } from './views/SolutionsView';
import { AuditLogsView } from './views/AuditLogsView';
import { EnvironmentVariablesView } from './views/EnvironmentVariablesView';
import { CanvasAppsView } from './views/CanvasAppsView';
import { ModelDrivenAppsView } from './views/ModelDrivenAppsView';
import { CustomControlsView } from './views/CustomControlsView';
import { WebResourcesView } from './views/WebResourcesView';
import { SiteMapsView } from './views/SiteMapsView';
import { SecurityRolesView } from './views/SecurityRolesView';
import { FieldSecurityProfilesView } from './views/FieldSecurityProfilesView';
import { ConnectionReferencesView } from './views/ConnectionReferencesView';
import { FormsView } from './views/FormsView';
import { ViewsView } from './views/ViewsView';


interface AdminDashboardProps {
  notification: string | null;
  setNotification: (message: string | null) => void;
  theme: Theme;
  toggleTheme: () => void;
}

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


const AdminDashboard: React.FC<AdminDashboardProps> = ({ notification, setNotification, theme, toggleTheme }) => {
    const [activeView, setActiveView] = useState('Cloud flows');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const renderActiveView = () => {
        const props = { notification, setNotification, theme };
        switch (activeView) {
            case 'Cloud flows':
                return <CloudFlowsView {...props} />;
            case 'Dataflows':
                return <DataflowsView {...props} />;
            case 'Solution Inventory':
                return <SolutionsView {...props} />;
            case 'Audit Logs':
                 return <AuditLogsView {...props} />;
            case 'Environment Variables':
                return <EnvironmentVariablesView {...props} />;
            case 'Canvas Apps':
                return <CanvasAppsView {...props} />;
            case 'Model-driven Apps':
                return <ModelDrivenAppsView {...props} />;
            case 'Plugins & PCF Controls':
                return <CustomControlsView theme={theme} />;
            case 'Web Resources':
                return <WebResourcesView {...props} />;
            case 'Site maps':
                return <SiteMapsView theme={theme} />;
            case 'Security Roles':
                return <SecurityRolesView theme={theme} />;
            case 'Field Security Profiles':
                return <FieldSecurityProfilesView theme={theme} />;
            case 'Connection references':
                return <ConnectionReferencesView theme={theme} />;
            case 'Forms':
                return <FormsView theme={theme} />;
            case 'Views':
                return <ViewsView {...props} />;
            default:
                return (
                    <div className={`p-8 text-center rounded-lg ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-gray-50'}`}>
                        <h2 className={`text-xl font-semibold ${themeStyles[theme].text}`}>View Not Implemented</h2>
                        <p className={`mt-2 text-sm ${themeStyles[theme].secondaryText}`}>The view for "{activeView}" has not been implemented.</p>
                    </div>
                );
        }
    };
    
    return (
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-100'} p-4 gap-4`}>
            <NavigationSidebar 
                isExpanded={isSidebarExpanded} 
                theme={theme} 
                activeView={activeView} 
                onViewChange={setActiveView} 
            />
            <div className={`flex-1 flex flex-col rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-[#0B253A]' : 'bg-white'}`}>
                 <header className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} flex-shrink-0 bg-opacity-90 backdrop-blur-sm`}>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                            <ChevronLeftIcon className={`h-6 w-6 transition-transform ${isSidebarExpanded ? '' : 'rotate-180'} ${themeStyles[theme].text}`} />
                        </button>
                         <h1 className={`text-xl font-bold ${themeStyles[theme].text} whitespace-nowrap overflow-hidden text-ellipsis`}>{activeView}</h1>
                    </div>
                    <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                        <SunIcon className={`h-6 w-6 ${themeStyles[theme].text}`} />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {renderActiveView()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;