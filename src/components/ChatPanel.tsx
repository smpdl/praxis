import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { Bot, User, Send, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    onNewSession: (prompt: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onNewSession }) => {
    const [prompt, setPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onNewSession(prompt);
            setPrompt('');
        }
    };
    
    const Icon = ({ role }: { role: Role }) => {
      if (role === Role.MODEL) {
        return <Bot className="w-6 h-6 text-cyan-400 flex-shrink-0" />;
      }
      return <User className="w-6 h-6 text-green-400 flex-shrink-0" />;
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-sm">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Chat</h2>
                <p className="text-xs text-gray-400">Describe a programming problem you want to solve.</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <Icon role={msg.role} />
                            <div className="prose prose-sm prose-invert prose-p:text-gray-300 prose-strong:text-white max-w-full">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                       <div className="flex items-start gap-4">
                           <Bot className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                           <div className="flex items-center gap-2 pt-1">
                               <Loader className="w-5 h-5 animate-spin" />
                               <span className="text-gray-400">Thinking...</span>
                           </div>
                       </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your query here."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
                        disabled={isLoading}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
