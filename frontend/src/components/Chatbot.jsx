import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Chatbot() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I am AgroBot. Ask me anything about agriculture." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load history from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('chatHistory');
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, []);

    // Save history to sessionStorage on update
    useEffect(() => {
        sessionStorage.setItem('chatHistory', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Using env variable or fallback
            const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
            const response = await fetch(`${API_BASE}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-agri-green text-white shadow-2xl hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
                title="Chat with us"
            >
                <Bot size={32} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div className="bg-agri-green text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <h3 className="font-bold">AgroBot Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-agri-green text-white self-end rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="self-start bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
                                <Loader2 className="animate-spin text-agri-green" size={20} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            placeholder={t('type_message')}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-agri-green text-white p-2 rounded-full hover:bg-agri-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
