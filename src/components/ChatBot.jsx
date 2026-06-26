import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { checkRateLimit, formatRateLimitMessage } from '../utils/rateLimit';

/**
 * COMPONENT: ChatBot
 * PURPOSE: Glassmorphic AI Copilot with dynamic telemetry integration.
 */
const ChatBot = ({ userProfile, tasks = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Initializing secure operational channels..." }
    ]);

    useEffect(() => {
        // Kunci Pengaman: Jika userProfile belum ada (belum login), langsung STOP!
        if (!userProfile || !userProfile.name) return;
        const myActiveCount = tasks.filter(t => {
            const isActive = t.status === 'To Do' || t.status === 'In Progress' || t.status === 'Revision Needed';
            if (userProfile.role === 'supervisor') return isActive;
            return isActive && (t.assigned_to || []).some(id => String(id) === String(userProfile.id));
        }).length;

        if (messages.length <= 1) {
            // Gunakan optional chaining (?.) agar aman dari kehancuran data undefined
            const firstName = userProfile?.name?.split(' ')[0] || 'User';
            setMessages([{ role: 'assistant', text: `Hi ${firstName}! I have indexed your workspace. There are ${myActiveCount} active assignments currently monitored.` }]);
        }
    }, [tasks, userProfile]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!userProfile || !userProfile.name) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Please log in first to use the chat feature.' }]);
            return;
        }

        const rateLimit = checkRateLimit('chat-send-message', 8000);
        if (!rateLimit.allowed) {
            setMessages(prev => [...prev, { role: 'assistant', text: formatRateLimitMessage(rateLimit.retryAfterMs) }]);
            return;
        }

        // Keep secrets off the browser. The server must hold the Anthropic key.
        const apiUrl = import.meta.env.VITE_CHAT_API_URL || '/api/chat';
        const userMessage = { role: 'user', text: input };
        const updatedHistory = [...messages, userMessage];
        
        setMessages(updatedHistory);
        setInput('');
        setIsLoading(true);

        // Prepare Context & Variables
        const sharedTasksContext = tasks.filter(t => {
            const isNotDone = !['Completed', 'Approved'].includes(t.status);
            if (userProfile?.role === 'supervisor') return isNotDone;
            return isNotDone && (t.assigned_to || []).some(id => String(id) === String(userProfile?.id));
        });
        
        const taskContext = sharedTasksContext.length > 0 
            ? sharedTasksContext.map(t => `| ${t.title} | ${t.status} |`).join('\n')
            : "No active tasks found.";

        const systemPrompt = `You are a professional Customs AI assistant for ${userProfile?.name || 'User'}. Current Workspace Context: ${taskContext}. Output all tables in Markdown.`;

        const formattedHistory = updatedHistory
            .filter(msg => !msg.text.includes("Initializing") && !msg.text.includes("Hi "))
            .map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text }));

        try {
            // Send the prompt to our own backend instead of calling Anthropic directly from the browser.
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-opus-4-6',
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: formattedHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData?.retryAfterMs
                    ? formatRateLimitMessage(errorData.retryAfterMs)
                    : (errorData?.error || 'Chat service is not configured.');
                throw new Error(message);
            }

            const data = await response.json();
            const assistantText = data?.content?.[0]?.text || 'No response returned.';
            setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Error: Chat backend is unavailable.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="w-80 h-96 rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-4 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-xs tracking-wider uppercase">✨ Claude AI Workspace Copilot</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40 dark:bg-gray-950/20">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-3 rounded-2xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto rounded-br-none' : 'bg-white shadow-sm border border-gray-100 rounded-bl-none dark:bg-gray-800 dark:text-gray-200'}`}>
                                <ReactMarkdown components={{
                                    table: ({node, ...props}) => <table className="w-full text-[10px] border-collapse border border-gray-300" {...props} />,
                                    th: ({node, ...props}) => <th className="border border-gray-300 p-1 bg-gray-100" {...props} />,
                                    td: ({node, ...props}) => <td className="border border-gray-300 p-1" {...props} />
                                }}>
                                    {m.text}
                                </ReactMarkdown>
                            </div>
                        ))}
                        {isLoading && <div className="text-[10px] text-gray-400 animate-pulse">Claude is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t flex gap-2 dark:bg-gray-800 dark:border-gray-700">
                        <input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 p-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Ask Claude to analyze..."
                        />
                        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-xl text-xs font-bold hover:bg-blue-700">Send</button>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-xl">
                ✨
            </button>
        </div>
    );
};

export default ChatBot;