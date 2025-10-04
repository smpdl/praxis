import React, { useState } from 'react';
import { Test, TestResult } from '../types';
import { CheckCircle2, XCircle, ChevronDown, ChevronRight, Play, Loader, Terminal } from 'lucide-react';

interface TestOutputPanelProps {
    tests: Test[];
    results: TestResult[];
    consoleOutput: string[];
    onRunTests: () => void;
    isLoading: boolean;
}

type ActiveTab = 'tests' | 'console';

const TestOutputPanel: React.FC<TestOutputPanelProps> = ({ tests, results, consoleOutput, onRunTests, isLoading }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tests');
    const getResultForTest = (description: string) => {
        return results.find(r => r.description === description);
    };
    return (
        <div className="bg-gray-800 h-full flex flex-col text-sm">
            <div className="flex justify-between items-center p-2 border-b border-gray-700">
                <div className="flex gap-1">
                    <button 
                        onClick={() => setActiveTab('tests')}
                        className={`px-3 py-1 rounded-md text-xs ${activeTab === 'tests' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                       Tests ({tests.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('console')}
                        className={`px-3 py-1 rounded-md text-xs ${activeTab === 'console' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                       <Terminal className="inline w-4 h-4 mr-1"/> Console
                    </button>
                </div>
                <button
                    onClick={onRunTests}
                    disabled={isLoading || tests.length === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-1 px-4 rounded-md flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Tests
                        </>
                    )}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                {activeTab === 'tests' && (
                    <div>
                        <h3 className="font-semibold mb-2">Current Challenge</h3>
                        {tests.length === 0 && <p className="text-gray-400">No tests available. Start a session to get your first challenge.</p>}
                        <ul className="space-y-2">
                            {tests.map((test, index) => {
                                const result = getResultForTest(test.description);
                                return (
                                    <li key={index} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded-md">
                                        {result ? (
                                            result.passed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            )
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className="text-gray-200">{test.description}</p>
                                            {result && !result.passed && result.error && (
                                                <p className="text-red-400 text-xs mt-1 font-mono">Error: {result.error}</p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                 {activeTab === 'console' && (
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Terminal className="w-4 h-4" /> Console Output</h3>
                        <div className="font-mono bg-gray-900 p-2 rounded-md text-xs">
                            {consoleOutput.length > 0 ? (
                                consoleOutput.map((log, i) => <pre key={i} className="whitespace-pre-wrap border-b border-gray-700/50 py-1">{log}</pre>)
                            ) : (
                                <p className="text-gray-500">Run code to see output here...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default TestOutputPanel;
