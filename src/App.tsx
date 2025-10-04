import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ChatPanel from './components/ChatPanel';
import CodeEditorPanel from './components/CodeEditorPanel';
import TestOutputPanel from './components/TestOutputPanel';
import { Message, Role, Test, TestResult, TutorResponse } from './types';
import { SYSTEM_PROMPT } from './constants';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [code, setCode] = useState<string>('');
    const [currentTests, setCurrentTests] = useState<Test[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    
    useEffect(() => {
        const key = process.env.API_KEY;
        if (key) {
            setApiKey(key);
            setAi(new GoogleGenAI({ apiKey: key }));
        } else {
            const userKey = window.prompt("Please enter your Gemini API Key:");
            if(userKey) {
                 setApiKey(userKey);
                 setAi(new GoogleGenAI({ apiKey: userKey }));
            }
        }
    }, []);
    const handleNewSession = async (prompt: string) => {
        if (!ai) {
            alert("API Key not configured.");
            return;
        }

        const startingNew = messages.length === 0;

        // Append the user's message to the chat immediately for responsiveness
        setMessages(prev => [...prev, { role: Role.USER, text: prompt }]);

        if (startingNew) {
            // initial session setup
            setCode('// The AI tutor will guide you. Start coding here when ready.');
            setCurrentTests([]);
            setTestResults([]);
            setConsoleOutput([]);
        }

        setIsLoading(true);

        // Build the model 'contents' from the message history (including this new user prompt)
        const history = [...messages, { role: Role.USER, text: prompt }];
        const contents = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            explanation: { type: Type.STRING },
                            challenge: { type: Type.STRING },
                            tests: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        code: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const tutorResponse: TutorResponse = JSON.parse(response.text);

            setMessages(prev => [...prev, { role: Role.MODEL, text: `${tutorResponse.explanation}\n\n**New Challenge:** ${tutorResponse.challenge}` }]);

            if (Array.isArray(tutorResponse.tests)) {
                setCurrentTests(tutorResponse.tests);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: Role.MODEL, text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunTests = async () => {
        if (!ai) {
            alert("API Key not configured.");
            return;
        }
        setIsLoading(true);
        setConsoleOutput([]); 
        
        const results: TestResult[] = await executeCodeAndTests(code, currentTests);
        setTestResults(results);

        const allPassed = results.every(r => r.passed);
        const feedbackPrompt = `The user ran their code against the tests.
        
        User Code:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Test Results:
        ${results.map(r => `- ${r.description}: ${r.passed ? 'PASSED' : 'FAILED'}${r.error ? ` (Error: ${r.error})` : ''}`).join('\n')}
        
        Based on these results, provide the next step. If all tests passed, provide a new, more advanced challenge and new tests. If some failed, provide guidance, hints, and encouragement to help them fix the code. Do not give the direct answer.`;
        
        const history = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [...history, { role: Role.USER, parts: [{text: feedbackPrompt}]}],
                config: {
                     systemInstruction: SYSTEM_PROMPT,
                     responseMimeType: "application/json",
                     responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            explanation: { type: Type.STRING },
                            challenge: { type: Type.STRING },
                            tests: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        code: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const tutorResponse: TutorResponse = JSON.parse(response.text);
            
            setMessages(prev => [...prev, { role: Role.MODEL, text: `${tutorResponse.explanation}\n\n**New Challenge:** ${tutorResponse.challenge}` }]);
            
            if (allPassed) {
                setCurrentTests(tutorResponse.tests);
                setTestResults([]); // Clear results for the new challenge
            }

        } catch (error) {
            console.error("Error getting next step:", error);
            setMessages(prev => [...prev, { role: Role.MODEL, text: "Sorry, I had trouble processing that. Please try running the tests again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const executeCodeAndTests = (userCode: string, tests: Test[]): Promise<TestResult[]> => {
        return new Promise((resolve) => {
            const workerCode = `
                self.onmessage = function(e) {
                    const { userCode, tests } = e.data;
                    const results = [];
                    const consoleLogs = [];

                    const originalLog = console.log;
                    console.log = (...args) => {
                        consoleLogs.push(args.map(arg => {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch {
                                return String(arg);
                            }
                        }).join(' '));
                        originalLog.apply(console, args);
                    };

                    try {
                        // This context will be populated by the user's code
                        const executionContext = {};
                        const fn = new Function('context', \`with(context) { \${userCode} }\`);
                        fn(executionContext);

                        for (const test of tests) {
                            try {
                                const testFn = new Function('context', \`with(context) { return \${test.code} }\`);
                                const passed = testFn(executionContext);
                                if (passed !== true) {
                                    throw new Error('Test returned ' + passed);
                                }
                                results.push({ description: test.description, passed: true });
                            } catch (error) {
                                results.push({ description: test.description, passed: false, error: error.message });
                            }
                        }
                    } catch (e) {
                        // Error in user's code compilation/global execution
                         console.log('Execution Error:', e.message);
                         results.push(...tests.map(t => ({ description: t.description, passed: false, error: 'Global execution error: ' + e.message })));
                    }

                    console.log = originalLog;
                    self.postMessage({ results, consoleLogs });
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));

            worker.onmessage = (e) => {
                setConsoleOutput(e.data.consoleLogs);
                resolve(e.data.results);
                worker.terminate();
            };

            worker.postMessage({ userCode, tests });
        });
    };

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="p-8 bg-gray-800 rounded-lg shadow-xl text-center">
                    <h1 className="text-2xl font-bold mb-4">Praxis</h1>
                    <p>Please provide your Gemini API Key to begin.</p>
                     <p className="text-xs text-gray-400 mt-4">The key is required to use this application and will not be stored.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans">
            <header className="bg-gray-800 p-4 shadow-md z-10 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3">
                    <img src="/praxis.png" alt="App" className="h-12 w-12" />
                </a>
                <nav className="flex items-center gap-4">
                    <a href="/about.html" className="text-sm text-gray-300 hover:text-white">About</a>
                </nav>
            </header>
            <main className="flex-grow flex overflow-hidden">
                <div className="w-1/3 flex flex-col bg-gray-800 border-r border-gray-700">
                    <ChatPanel messages={messages} isLoading={isLoading} onNewSession={handleNewSession} />
                </div>
                <div className="w-2/3 flex flex-col">
                    <div className="flex-grow h-1/2">
                        <CodeEditorPanel code={code} onCodeChange={setCode} />
                    </div>
                    <div className="flex-grow h-1/2 border-t border-gray-700">
                        <TestOutputPanel 
                            tests={currentTests}
                            results={testResults}
                            consoleOutput={consoleOutput}
                            onRunTests={handleRunTests}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
