import React, { useState } from 'react';
import { ChevronDownIcon, EnvironmentIcon, SolutionsIcon, MonitoringIcon, SecurityIcon, BackupIcon, AutomationIcon, CubeIcon, EnvVarIcon, CloudFlowsIcon, DataflowIcon, WebResourceIcon, CanvasAppIcon, ModelDrivenAppIcon, AuditLogIcon, SiteMapIcon, SecurityRoleIcon, FieldSecurityProfileIcon, ConnectionReferenceIcon } from './IconComponents';
import type { Theme } from '../types';

interface NavigationSidebarProps {
    isExpanded: boolean;
    theme: Theme;
    activeView: string;
    onViewChange: (viewName: string) => void;
}

const sidebarConfig = [
    { name: 'Environment & Capacity', icon: EnvironmentIcon, sections: ['Environment Health & KPI', 'Dataverse DB/File/Log Usage', 'Growth Trend & Forecast', 'Licensing & Consumption'] },
    { 
        name: 'Solution Components', 
        icon: SolutionsIcon, 
        sections: [
            'Solution Inventory',
            'Canvas Apps', 
            'Model-driven Apps',
            'Cloud flows', 
            'Web Resources',
            'Connection references',
            'Site maps',
            'Tables',
            'Choices',
            'Cards',
            'Component libraries',
        ] 
    },
    { name: 'Monitoring & Observability', icon: MonitoringIcon, sections: ['Dataflows', 'Environment Variables', 'Unified Error Center', 'Top Issues & Runbook Link', 'Feature Flags'] },
    { 
        name: 'Security & Compliance', 
        icon: SecurityIcon, 
        sections: [
            'Audit Logs', 
            'Security Roles',
            'Field Security Profiles',
            'Compliance Posture'
        ] 
    },
    { name: 'Backup & Recovery', icon: BackupIcon, sections: ['Backup Schedule', 'Restore Points', 'Integrity Check'] },
    { name: 'Operations & Automation', icon: AutomationIcon, sections: ['Maintenance Jobs', 'Alert Rules', 'Alert Channels'] },
];

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ isExpanded, theme, activeView, onViewChange }) => {
    const [openCategory, setOpenCategory] = useState<string | null>('Solution Components');

    const themeStyles = {
        dark: {
            bg: 'bg-[#0B253A]',
            text: 'text-[#A7B1C2]',
            textHover: 'hover:text-[#F3F4F6]',
            categoryBg: 'hover:bg-[#143B54]',
            activeSection: 'text-[#FFFFFF] bg-[#2563EB]/30 border-[#2563EB]',
            sectionHover: 'hover:bg-[#143B54]/50',
            border: 'border-[#143B54]',
        },
        light: {
            bg: 'bg-white',
            text: 'text-gray-500',
            textHover: 'hover:text-gray-900',
            categoryBg: 'hover:bg-gray-100',
            activeSection: 'text-indigo-600 bg-indigo-100 border-indigo-500',
            sectionHover: 'hover:bg-gray-100',
            border: 'border-gray-200',
        },
    };
    const currentTheme = themeStyles[theme];

    const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
        e.preventDefault();
        onViewChange(section);
    };

    return (
        <aside className={`${currentTheme.bg} rounded-xl h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-80' : 'w-0'}`} role="navigation">
            <div className={`flex items-center gap-3 p-4 flex-shrink-0 transition-opacity duration-150 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <CubeIcon className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h1 className={`text-xl font-bold whitespace-nowrap ${theme === 'dark' ? 'text-[#F3F4F6]' : 'text-gray-800'}`}>Admin Center</h1>
            </div>
            <div className={`flex-grow overflow-y-auto transition-opacity duration-150 border-t ${currentTheme.border} ${isExpanded ? 'opacity-100 p-4' : 'opacity-0 p-0'}`}>
                <nav className="space-y-2">
                    {sidebarConfig.map((category) => (
                        <div key={category.name}>
                            <button
                                onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                                className={`w-full flex items-center justify-between text-left p-2 rounded-md transition-colors ${currentTheme.categoryBg} ${currentTheme.text} ${currentTheme.textHover}`}
                                aria-expanded={openCategory === category.name}
                            >
                                <div className="flex items-center gap-3">
                                    <category.icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="font-semibold text-sm">{category.name}</span>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${openCategory === category.name ? 'rotate-180' : ''}`} />
                            </button>
                            {openCategory === category.name && (
                                <ul className="mt-2 pl-4 border-l-2 ml-2 space-y-1" style={{borderColor: theme==='dark' ? '#143B54' : '#e5e7eb'}}>
                                    {category.sections.map((section) => {
                                        const isActive = section === activeView;
                                        return (
                                            <li key={section}>
                                                <a
                                                    href="#"
                                                    onClick={(e) => handleSectionClick(e, section)}
                                                    className={`block w-full text-left text-sm p-2 rounded-md border-l-4 transition-all ${currentTheme.text} ${isActive ? currentTheme.activeSection : `border-transparent ${currentTheme.sectionHover}`}`}
                                                >
                                                    {section}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default NavigationSidebar;
