import React, { useEffect, useState } from 'react';
import type { Workflow, Theme, FlowRun } from '../../types';
import { CloseIcon, LoadingIcon, SparklesIcon } from '../IconComponents';
import { summarizeWorkflow } from '../../services/geminiService';
import { fetchWorkflowRuns, fetchAccessToken } from '../../services/dataverseService';
import { DetailItem, TechnicalDetailBox, GeminiMarkdown } from './DetailComponents';

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

const getRunStatusIndicator = (status: string, theme: Theme) => {
    const s = status.toLowerCase();
    let dotColor = 'bg-gray-400';
    let textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

    if (s === 'succeeded') {
        dotColor = 'bg-green-500';
        textColor = theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (s === 'failed') {
        dotColor = 'bg-red-500';
        textColor = theme === 'dark' ? 'text-red-400' : 'text-red-500';
    } else if (s === 'cancelled') {
        dotColor = 'bg-yellow-500';
        textColor = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500';
    } else if (s === 'running') {
        dotColor = 'bg-blue-500 animate-pulse';
        textColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-500';
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
            <span className={`font-semibold ${textColor}`}>{status}</span>
        </div>
    );
};

const calculateDuration = (start: string, end: string | null): string => {
    if (!end) return 'Running...';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 1000) return `${diffMs}ms`;
    const diffSecs = diffMs / 1000;
    if (diffSecs < 60) return `${diffSecs.toFixed(1)}s`;
    const diffMins = diffSecs / 60;
    return `${diffMins.toFixed(1)}m`;
}

const RunHistoryRow: React.FC<{ run: FlowRun, theme: Theme }> = ({ run, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentTheme = themeStyles[theme];

    return (
        <div className={`border-b ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} last:border-b-0`}>
            <div 
                className={`grid grid-cols-[1fr_1.5fr_1fr] gap-4 p-2 text-sm ${run.errormessage ? 'cursor-pointer hover:bg-white/5' : ''}`}
                onClick={() => run.errormessage && setIsExpanded(!isExpanded)}
                role={run.errormessage ? 'button' : 'row'}
                aria-expanded={isExpanded}
            >
                <div>{getRunStatusIndicator(run.statusText || 'Unknown', theme)}</div>
                <div className={currentTheme.secondaryText}>{new Date(run.startedon).toLocaleString()}</div>
                <div className={currentTheme.secondaryText}>{calculateDuration(run.startedon, run.completedon)}</div>
            </div>
            {isExpanded && run.errormessage && (
                <div className={`p-3 border-t ${theme === 'dark' ? 'border-red-900/50 bg-red-900/20' : 'border-red-200 bg-red-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>Error Details</p>
                    <code className={`block text-xs whitespace-pre-wrap font-mono ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                        {run.errormessage}
                    </code>
                </div>
            )}
        </div>
    );
};

const RunHistory: React.FC<{ runs: FlowRun[], isLoading: boolean, error: string | null, theme: Theme }> = ({ runs, isLoading, error, theme }) => {
    const currentTheme = themeStyles[theme];

    if (isLoading) {
        return <div className="flex items-center justify-center gap-2 p-4"><LoadingIcon className="h-5 w-5" /><span className={currentTheme.secondaryText}>Loading run history...</span></div>;
    }
    if (error) {
        return <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">{error}</div>;
    }
    if (runs.length === 0) {
        return <div className={`p-4 text-center ${currentTheme.secondaryText} text-sm`}>No recent runs found.</div>;
    }

    return (
        <div className={`border rounded-lg ${theme === 'dark' ? 'border-[#143B54]' : 'border-gray-200'} overflow-hidden`}>
            <div className={`grid grid-cols-[1fr_1.5fr_1fr] gap-4 p-2 text-xs font-semibold ${currentTheme.secondaryText} border-b ${theme === 'dark' ? 'border-[#143B54] bg-black/10' : 'border-gray-200 bg-gray-50'}`}>
                <span>Status</span>
                <span>Start Time</span>
                <span>Duration</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {runs.map(run => (
                    <RunHistoryRow key={run.flowsessionid} run={run} theme={theme} />
                ))}
            </div>
        </div>
    );
};

interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  onClose: () => void;
  theme: Theme;
}

export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({ workflow, onClose, theme }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState<boolean>(false);
  const [runsError, setRunsError] = useState<string | null>(null);
  
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
    
    setRuns([]);
    setRunsError(null);

    if (workflow) {
        const loadRuns = async () => {
            setIsLoadingRuns(true);
            try {
                const accessToken = await fetchAccessToken();
                const fetchedRuns = await fetchWorkflowRuns(accessToken, workflow.workflowid);
                setRuns(fetchedRuns);
            } catch (err) {
                if (err instanceof Error) {
                    setRunsError(err.message);
                } else {
                    setRunsError('An unknown error occurred while fetching run history.');
                }
            } finally {
                setIsLoadingRuns(false);
            }
        };
        loadRuns();
    }
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
              
              <div className={`py-4 border-b ${currentTheme.border}`}>
                  <h3 className={`text-sm font-medium ${currentTheme.secondaryText} mb-2`}>Recent Runs</h3>
                  <RunHistory runs={runs} isLoading={isLoadingRuns} error={runsError} theme={theme} />
              </div>

              <TechnicalDetailBox title="Client Data" data={workflow.clientdata} theme={theme}/>

            </main>
          </>
        )}
      </div>
    </div>
  );
};
