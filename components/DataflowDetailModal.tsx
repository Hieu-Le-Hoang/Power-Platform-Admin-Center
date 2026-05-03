import React, { useEffect, useState } from 'react';
import type { Workflow, Theme, Dataflow, Solution, AuditLog, EnvironmentVariable, CanvasApp, ModelDrivenApp, CustomControl, WebResource, SiteMap, SecurityRole, FieldSecurityProfile, ConnectionReference } from '../types';
import { CloseIcon, LoadingIcon, SparklesIcon } from './IconComponents';
import { summarizeWorkflow, summarizeDataflow, summarizeSolution } from '../services/geminiService';

interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  onClose: () => void;
  theme: Theme;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; theme: Theme }> = ({ label, value, theme }) => (
    <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{label}</p>
        <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} break-words`}>{value || 'N/A'}</p>
    </div>
);

const TechnicalDetailBox: React.FC<{ title: string; data: string | null | undefined; theme: Theme; showCopyButton?: boolean }> = ({ title, data, theme, showCopyButton = false }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(data).then(() => {
                setCopyStatus('Copied!');
                setTimeout(() => setCopyStatus('Copy'), 2000);
            }, () => {
                setCopyStatus('Failed!');
                setTimeout(() => setCopyStatus('Copy'), 2000);
            });
        }
    };
    
    if (!data && data !== '') return (
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{title}</p>
            <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'}`}>Not available</p>
        </div>
    );

    let formattedData = data;
    try {
        const parsed = JSON.parse(data);
        formattedData = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Not a JSON string, display as is
    }
    
    return (
        <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>{title}</p>
                {showCopyButton && (
                    <button
                        onClick={handleCopy}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${theme === 'dark' ? 'bg-[#143B54] hover:bg-[#0B253A] text-[#A7B1C2]' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        {copyStatus}
                    </button>
                )}
            </div>
            <div className={`mt-1 ${theme === 'dark' ? 'bg-[#011627]' : 'bg-gray-50'} rounded p-2 overflow-x-auto max-h-60 border ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <code className={`text-sm ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} whitespace-pre-wrap font-mono`}>{formattedData}</code>
            </div>
        </div>
    );
};

const GeminiMarkdown: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentTitle = '';
    let currentBody: string[] = [];

    const flushSection = () => {
        if (currentTitle || currentBody.length > 0) {
            elements.push(
                <div key={currentTitle || Math.random()}>
                    {currentTitle && <p className={`font-semibold ${theme === 'dark' ? 'text-[#F3F4F6]' : 'text-gray-900'} mb-1`}>{currentTitle.replace(/:/g, '')}</p>}
                    <p className={theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-700'}>{currentBody.join(' ')}</p>
                </div>
            );
        }
        currentTitle = '';
        currentBody = [];
    };

    lines.forEach((line) => {
        const titleMatch = line.match(/\*\*(.*?)\*\*/);
        if (titleMatch) {
            flushSection();
            currentTitle = titleMatch[1];
        } else if (line.trim()) {
            currentBody.push(line.trim());
        }
    });
    flushSection();

    return <div className="space-y-4 text-base">{elements}</div>;
};


const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({ workflow, onClose, theme }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    setIsSummarizing(false);
  }, [workflow]);

  const handleGenerateSummary = async () => {
    if (!workflow) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const result = await summarizeWorkflow(workflow);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error) {
        setSummaryError(err.message);
      } else {
        setSummaryError('An unknown error occurred while generating the summary.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const isVisible = !!workflow;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
      summaryBg: 'bg-[#0B253A]/80',
      loadingBg: 'bg-[#0B253A]',
      focusRing: 'focus:ring-offset-[#0B253A]',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
      summaryBg: 'bg-gray-100/80',
      loadingBg: 'bg-gray-100',
      focusRing: 'focus:ring-offset-white',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {workflow && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{workflow.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={workflow.description} theme={theme} />
              <DetailItem label="Flow ID" value={workflow.workflowid} theme={theme}/>
              <DetailItem label="Owner" value={workflow['_ownerid_value@OData.Community.Display.V1.FormattedValue']} theme={theme}/>
              <DetailItem label="Status" value={workflow.statusText} theme={theme}/>
              <DetailItem label="Type" value={workflow.categoryText} theme={theme}/>
              <DetailItem label="Last Modified" value={new Date(workflow.modifiedon).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${currentTheme.border}`}>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="h-5 w-5 text-indigo-400" />
                    <p className={`text-sm font-medium ${currentTheme.secondaryText}`}>AI-Powered Summary</p>
                </div>
                
                {!summary && !isSummarizing && !summaryError && (
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className={`w-full flex justify-center items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.focusRing} focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Generate Summary
                    </button>
                )}

                {isSummarizing && (
                    <div className={`flex items-center justify-center gap-4 p-4 ${currentTheme.loadingBg} rounded-lg`}>
                        <LoadingIcon className="h-6 w-6" />
                        <span className={currentTheme.secondaryText}>Analyzing flow...</span>
                    </div>
                )}

                {summaryError && (
                    <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                        <p className="font-bold">Summary Failed</p>
                        <p className="text-sm mt-1">{summaryError}</p>
                    </div>
                )}
                
                {summary && (
                    <div className={`p-4 ${currentTheme.summaryBg} rounded-lg border ${currentTheme.border}`}>
                        <GeminiMarkdown text={summary} theme={theme} />
                    </div>
                )}
              </div>
              
              <TechnicalDetailBox title="Client Data" data={workflow.clientdata} theme={theme}/>

            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailModal;


interface DataflowDetailModalProps {
  dataflow: Dataflow | null;
  onClose: () => void;
  theme: Theme;
}

export const DataflowDetailModal: React.FC<DataflowDetailModalProps> = ({ dataflow, onClose, theme }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    setIsSummarizing(false);
  }, [dataflow]);

  const handleGenerateSummary = async () => {
    if (!dataflow) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const result = await summarizeDataflow(dataflow);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error) {
        setSummaryError(err.message);
      } else {
        setSummaryError('An unknown error occurred while generating the summary.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const isVisible = !!dataflow;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
      summaryBg: 'bg-[#0B253A]/80',
      loadingBg: 'bg-[#0B253A]',
      focusRing: 'focus:ring-offset-[#0B253A]',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
      summaryBg: 'bg-gray-100/80',
      loadingBg: 'bg-gray-100',
      focusRing: 'focus:ring-offset-white',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title-dataflow"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {dataflow && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-dataflow" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{dataflow.msdyn_name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={dataflow.msdyn_description} theme={theme} />
              <DetailItem label="Dataflow ID" value={dataflow.msdyn_dataflowid} theme={theme}/>
              <DetailItem label="Owner" value={dataflow['_ownerid_value@OData.Community.Display.V1.FormattedValue']} theme={theme}/>
              <DetailItem label="Status" value={dataflow.statusText} theme={theme}/>
              <DetailItem label="Last Modified" value={new Date(dataflow.modifiedon).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${currentTheme.border}`}>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="h-5 w-5 text-indigo-400" />
                    <p className={`text-sm font-medium ${currentTheme.secondaryText}`}>AI-Powered Summary</p>
                </div>
                
                {!summary && !isSummarizing && !summaryError && (
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className={`w-full flex justify-center items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.focusRing} focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Generate Summary
                    </button>
                )}

                {isSummarizing && (
                    <div className={`flex items-center justify-center gap-4 p-4 ${currentTheme.loadingBg} rounded-lg`}>
                        <LoadingIcon className="h-6 w-6" />
                        <span className={currentTheme.secondaryText}>Analyzing dataflow...</span>
                    </div>
                )}

                {summaryError && (
                    <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                        <p className="font-bold">Summary Failed</p>
                        <p className="text-sm mt-1">{summaryError}</p>
                    </div>
                )}
                
                {summary && (
                    <div className={`p-4 ${currentTheme.summaryBg} rounded-lg border ${currentTheme.border}`}>
                        <GeminiMarkdown text={summary} theme={theme} />
                    </div>
                )}
              </div>
              <TechnicalDetailBox title="Refresh Settings" data={dataflow.msdyn_refreshsettings} theme={theme}/>
              <TechnicalDetailBox title="Refresh History" data={dataflow.msdyn_refreshhistory} theme={theme}/>
              <TechnicalDetailBox title="Mashup Settings" data={dataflow.msdyn_mashupsettings} theme={theme} showCopyButton={true} />
              <TechnicalDetailBox title="Mashup Document" data={dataflow.msdyn_mashupdocument} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};


interface SolutionDetailModalProps {
  solution: Solution | null;
  onClose: () => void;
  theme: Theme;
}

export const SolutionDetailModal: React.FC<SolutionDetailModalProps> = ({ solution, onClose, theme }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    setIsSummarizing(false);
  }, [solution]);

  const handleGenerateSummary = async () => {
    if (!solution) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const result = await summarizeSolution(solution);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error) {
        setSummaryError(err.message);
      } else {
        setSummaryError('An unknown error occurred while generating the summary.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const isVisible = !!solution;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
      summaryBg: 'bg-[#0B253A]/80',
      loadingBg: 'bg-[#0B253A]',
      focusRing: 'focus:ring-offset-[#0B253A]',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
      summaryBg: 'bg-gray-100/80',
      loadingBg: 'bg-gray-100',
      focusRing: 'focus:ring-offset-white',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title-solution"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {solution && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-solution" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{solution.friendlyname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={solution.description} theme={theme} />
              <DetailItem label="Unique Name" value={solution.uniquename} theme={theme}/>
              <DetailItem label="Publisher" value={solution.publisherName} theme={theme}/>
              <DetailItem label="Version" value={solution.version} theme={theme}/>
              <DetailItem label="Type" value={solution.isManagedText} theme={theme}/>
              <DetailItem label="Last Modified" value={new Date(solution.modifiedon).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${currentTheme.border}`}>
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="h-5 w-5 text-indigo-400" />
                    <p className={`text-sm font-medium ${currentTheme.secondaryText}`}>AI-Powered Summary</p>
                </div>
                
                {!summary && !isSummarizing && !summaryError && (
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className={`w-full flex justify-center items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.focusRing} focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Generate Summary
                    </button>
                )}

                {isSummarizing && (
                    <div className={`flex items-center justify-center gap-4 p-4 ${currentTheme.loadingBg} rounded-lg`}>
                        <LoadingIcon className="h-6 w-6" />
                        <span className={currentTheme.secondaryText}>Analyzing solution...</span>
                    </div>
                )}

                {summaryError && (
                    <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                        <p className="font-bold">Summary Failed</p>
                        <p className="text-sm mt-1">{summaryError}</p>
                    </div>
                )}
                
                {summary && (
                    <div className={`p-4 ${currentTheme.summaryBg} rounded-lg border ${currentTheme.border}`}>
                        <GeminiMarkdown text={summary} theme={theme} />
                    </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
  theme: Theme;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ log, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const isVisible = !!log;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title-auditlog"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {log && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-auditlog" className={`text-xl font-semibold ${currentTheme.text} truncate`}>Audit Log Details</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Timestamp" value={log.timestamp.toLocaleString()} theme={theme} />
              <DetailItem label="Action" value={log.action} theme={theme}/>
              <DetailItem label="Table Name" value={log.tableName} theme={theme}/>
              <DetailItem label="Record ID" value={log.recordId} theme={theme}/>
              <DetailItem label="User" value={log.user.name} theme={theme}/>
              <DetailItem label="User ID" value={log.user.id} theme={theme}/>
              
              <TechnicalDetailBox title="Changed Data" data={log.changes} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface EnvironmentVariableDetailModalProps {
  variable: EnvironmentVariable | null;
  onClose: () => void;
  theme: Theme;
}

export const EnvironmentVariableDetailModal: React.FC<EnvironmentVariableDetailModalProps> = ({ variable, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const isVisible = !!variable;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]',
      border: 'border-[#143B54]',
      text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]',
      headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      secondaryText: 'text-gray-500',
      headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sidebar-title-envvar"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {variable && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-envvar" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{variable.displayname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>

            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Display Name" value={variable.displayname} theme={theme} />
              <DetailItem label="Description" value={variable.description} theme={theme} />
              <DetailItem label="Schema Name" value={<code className="font-mono">{variable.schemaname}</code>} theme={theme} />
              <DetailItem label="Type" value={variable.typeName} theme={theme} />
              <DetailItem label="Owner" value={variable.owner} theme={theme}/>
              <DetailItem label="Last Modified" value={new Date(variable.modifiedon).toLocaleString()} theme={theme}/>

              <TechnicalDetailBox title="Default Value" data={variable.defaultvalue} theme={theme}/>
              <TechnicalDetailBox title="Current Value" data={variable.currentvalue} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface CanvasAppDetailModalProps {
  app: CanvasApp | null;
  onClose: () => void;
  theme: Theme;
}

export const CanvasAppDetailModal: React.FC<CanvasAppDetailModalProps> = ({ app, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!app;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
      secondaryText: 'text-gray-500', headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-canvasapp"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {app && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-canvasapp" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{app.displayname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={app.description} theme={theme} />
              <DetailItem label="Version" value={app.versionnumber} theme={theme} />
              <DetailItem label="App ID" value={app.canvasappid} theme={theme} />
              <DetailItem label="Internal Name" value={<code className="font-mono">{app.name}</code>} theme={theme} />
              <DetailItem label="Owner" value={app['_ownerid_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Created Time" value={new Date(app.createdtime).toLocaleString()} theme={theme}/>
              <DetailItem label="Last Modified Time" value={new Date(app.lastmodifiedtime).toLocaleString()} theme={theme}/>
              <DetailItem label="Last Published Time" value={new Date(app.lastpublishtime).toLocaleString()} theme={theme}/>
              
              <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>Open App</p>
                <a href={app.appopenuri} target="_blank" rel="noopener noreferrer" className={`mt-1 text-base break-all ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>
                    {app.appopenuri}
                </a>
             </div>
             <TechnicalDetailBox title="Commit Message" data={app.commitmessage} theme={theme}/>
             <TechnicalDetailBox title="Database References" data={app.databasereferences} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface ModelDrivenAppDetailModalProps {
  app: ModelDrivenApp | null;
  onClose: () => void;
  theme: Theme;
}

export const ModelDrivenAppDetailModal: React.FC<ModelDrivenAppDetailModalProps> = ({ app, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!app;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
      secondaryText: 'text-gray-500', headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-modelapp"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {app && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-modelapp" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{app.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Description" value={app.description} theme={theme} />
              <DetailItem label="App Module ID" value={app.appmoduleid} theme={theme} />
              <DetailItem label="Unique Name" value={app.uniquename} theme={theme} />
              <DetailItem label="Client Type" value={app.clientTypeText} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(app.modifiedon).toLocaleString()} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface CustomControlDetailModalProps {
  control: CustomControl | null;
  onClose: () => void;
  theme: Theme;
}

export const CustomControlDetailModal: React.FC<CustomControlDetailModalProps> = ({ control, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!control;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
      secondaryText: 'text-gray-500', headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-pcf"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {control && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-pcf" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{control.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Control Name" value={control.name} theme={theme} />
              <DetailItem label="Version" value={control.version} theme={theme} />
              <DetailItem label="Compatible Data Types" value={control.compatibledatatypes} theme={theme} />
              <DetailItem label="Created By" value={control['_createdby_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Created On" value={new Date(control.createdon).toLocaleString()} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(control.modifiedon).toLocaleString()} theme={theme} />
              
              <TechnicalDetailBox title="Manifest" data={control.manifest} theme={theme}/>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

const ContentViewer: React.FC<{ resource: WebResource; theme: Theme }> = ({ resource, theme }) => {
    const textBasedTypes = [1, 2, 3, 4, 10]; // HTML, CSS, JS, XML, SVG

    if (textBasedTypes.includes(resource.webresourcetype)) {
        let decodedContent = "Error decoding content.";
        try {
            // The content is Base64 encoded. We need to decode it.
            decodedContent = atob(resource.content);
        } catch (e) {
            console.error("Failed to decode base64 content:", e);
        }
        return <TechnicalDetailBox title="Content" data={decodedContent} theme={theme} showCopyButton={true} />;
    }

    return (
         <div className={`py-4 border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A7B1C2]' : 'text-gray-500'}`}>Content</p>
            <p className={`mt-1 text-base ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'}`}>
                Binary content ({resource.typeName}) cannot be displayed.
            </p>
        </div>
    );
};

interface WebResourceDetailModalProps {
  resource: WebResource | null;
  onClose: () => void;
  theme: Theme;
}

export const WebResourceDetailModal: React.FC<WebResourceDetailModalProps> = ({ resource, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!resource;
  const themeStyles = {
    dark: {
      bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]',
      secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30',
    },
    light: {
      bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900',
      secondaryText: 'text-gray-500', headerBg: 'bg-gray-100',
    }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-webresource"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {resource && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-webresource" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{resource.displayname || resource.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Name" value={<code className="font-mono">{resource.name}</code>} theme={theme} />
              <DetailItem label="Description" value={resource.description} theme={theme} />
              <DetailItem label="Type" value={resource.typeName} theme={theme} />
              <DetailItem label="Created By" value={resource['_createdby_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(resource.modifiedon).toLocaleString()} theme={theme} />
              <ContentViewer resource={resource} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};


interface SiteMapDetailModalProps {
  sitemap: SiteMap | null;
  onClose: () => void;
  theme: Theme;
}

export const SiteMapDetailModal: React.FC<SiteMapDetailModalProps> = ({ sitemap, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!sitemap;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-sitemap"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {sitemap && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-sitemap" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{sitemap.sitemapname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Sitemap Name" value={sitemap.sitemapname} theme={theme} />
              <DetailItem label="Type" value={sitemap.isManagedText} theme={theme} />
              <DetailItem label="Version" value={sitemap.versionnumber} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(sitemap.modifiedon).toLocaleString()} theme={theme} />
              <TechnicalDetailBox title="Sitemap XML" data={sitemap.sitemapxml} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface SecurityRoleDetailModalProps {
  role: SecurityRole | null;
  onClose: () => void;
  theme: Theme;
}

export const SecurityRoleDetailModal: React.FC<SecurityRoleDetailModalProps> = ({ role, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!role;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-role"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {role && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-role" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{role.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Role Name" value={role.name} theme={theme} />
              <DetailItem label="Business Unit" value={role['_businessunitid_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Type" value={role.isManagedText} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(role.modifiedon).toLocaleString()} theme={theme} />
              <DetailItem label="Role ID" value={role.roleid} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

interface FieldSecurityProfileDetailModalProps {
  profile: FieldSecurityProfile | null;
  onClose: () => void;
  theme: Theme;
}

export const FieldSecurityProfileDetailModal: React.FC<FieldSecurityProfileDetailModalProps> = ({ profile, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!profile;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-fsp"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {profile && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-fsp" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{profile.name}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Profile Name" value={profile.name} theme={theme} />
              <DetailItem label="Description" value={profile.description} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(profile.modifiedon).toLocaleString()} theme={theme} />
              <DetailItem label="Profile ID" value={profile.fieldsecurityprofileid} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};


interface ConnectionReferenceDetailModalProps {
  connection: ConnectionReference | null;
  onClose: () => void;
  theme: Theme;
}

export const ConnectionReferenceDetailModal: React.FC<ConnectionReferenceDetailModalProps> = ({ connection, onClose, theme }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isVisible = !!connection;
  const themeStyles = {
    dark: { bg: 'bg-[#0B253A]', border: 'border-[#143B54]', text: 'text-[#F3F4F6]', secondaryText: 'text-[#A7B1C2]', headerBg: 'bg-[#143B54]/30' },
    light: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', secondaryText: 'text-gray-500', headerBg: 'bg-gray-100' }
  };
  const currentTheme = themeStyles[theme];

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title-connref"
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isVisible ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl ${currentTheme.bg} shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {connection && (
          <>
            <header className={`flex justify-between items-center p-4 border-b ${currentTheme.border} flex-shrink-0 ${currentTheme.headerBg}`}>
              <h2 id="sidebar-title-connref" className={`text-xl font-semibold ${currentTheme.text} truncate`}>{connection.connectionreferencelogicalname}</h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-[#A7B1C2] hover:text-[#F3F4F6]' : 'text-gray-500 hover:text-gray-800'}`} aria-label="Close sidebar">
                <CloseIcon />
              </button>
            </header>
            <main className={`p-6 overflow-y-auto ${theme === 'dark' ? 'text-[#E5E7EB]' : 'text-gray-800'} flex-grow`}>
              <DetailItem label="Logical Name" value={connection.connectionreferencelogicalname} theme={theme} />
              <DetailItem label="Description" value={connection.description} theme={theme} />
              <DetailItem label="Connector ID" value={<code className="font-mono">{connection.connectorid}</code>} theme={theme} />
              <DetailItem label="Owner" value={connection['_ownerid_value@OData.Community.Display.V1.FormattedValue']} theme={theme} />
              <DetailItem label="Last Modified" value={new Date(connection.modifiedon).toLocaleString()} theme={theme} />
              <DetailItem label="Connection Reference ID" value={connection.connectionreferenceid} theme={theme} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};
