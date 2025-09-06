import React, { useState, useRef, useEffect } from 'react';
import { ask } from '../service/BotService';
import { knowledgeBase } from '../types/ChatBotDto';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Hi! I\'m your personal fitness coach! 💪 Ready to crush your fitness goals? Ask me about workouts, nutrition, or health tips!',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [knowledegeBase, setKnowledgeBase] = useState<knowledgeBase>();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (localStorage.getItem("knowledge_base")) {
            const kb = JSON.parse(localStorage.getItem("knowledge_base") || "");
            setKnowledgeBase(kb);
        } else {
            setKnowledgeBase({ input: "", summary: "", response: "" });
            localStorage.setItem("knowledge_base", JSON.stringify({ input: "", summary: "", response: "" }));
        }
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isTyping) return;

        const userMessage = inputMessage.trim();
        const newUserMessage: Message = {
            id: Date.now(),
            text: userMessage,
            sender: 'user',
            timestamp: new Date()
        };

        // Add user message immediately
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            console.log("Sending message:", userMessage);
            const response = await ask(userMessage, knowledegeBase!);

            if (response) {
                // Update knowledge base
                localStorage.setItem("knowledge_base", JSON.stringify(response.knowledge_base));
                setKnowledgeBase(response.knowledge_base);

                // Add bot response
                const botMessage: Message = {
                    id: Date.now() + 1,
                    text: response.answer,
                    sender: 'bot',
                    timestamp: new Date()
                };

                setMessages(prevMessages => [...prevMessages, botMessage]);
            }
        } catch (error) {
            console.error("Error fetching response:", error);

            // Add error message
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (!isTyping) {
            setInputMessage(suggestion);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 relative overflow-hidden">
            {/* Background Animation - Fitness Theme */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-20">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                </div>
            </div>

            {/* Header - Fitness Coach */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                {/* Fitness/Dumbbell Icon */}
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 21.29 21.29 19.86 19.86 18.43 22 16.29 20.57 14.86z"/>
                                    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                                </svg>
                            </div>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isTyping ? 'bg-amber-400 animate-pulse' : 'bg-green-400 animate-pulse'
                            }`}></div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center">
                            FitBot Coach 💪
                        </h1>
                        <p className="text-sm text-green-200 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isTyping ? 'bg-amber-400' : 'bg-green-400'
                                }`}></span>
                            {isTyping ? 'Analyzing your fitness query...' : 'Ready to train! 🏋️‍♀️'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-transparent">
                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`flex items-start space-x-3 max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar - Fitness Themed */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                ? 'bg-gradient-to-tr from-teal-400 to-emerald-500'
                                : 'bg-gradient-to-tr from-green-400 to-emerald-500'
                                }`}>
                                {message.sender === 'user' ? (
                                    // User Avatar - Person exercising
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2zm-2 2H5v9h14v-9z"/>
                                    </svg>
                                ) : (
                                    // Bot Avatar - Fitness coach/strong arm
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                )}
                            </div>

                            {/* Message Bubble - Fitness Theme */}
                            <div className={`relative px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${message.sender === 'user'
                                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white ml-auto'
                                : 'bg-white/95 text-gray-800 border border-green-200/30'
                                }`}>
                                <p className="text-sm leading-relaxed">{message.text}</p>
                                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'
                                    }`}>
                                    {formatTime(message.timestamp)}
                                </p>

                                {/* Message tail */}
                                <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${message.sender === 'user'
                                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600 -right-1'
                                    : 'bg-white/95 -left-1'
                                    }`}></div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator - Fitness Themed */}
                {isTyping && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="flex items-start space-x-3 max-w-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-green-400 to-emerald-500">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                            <div className="relative px-5 py-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-green-200/30 shadow-xl">
                                <div className="flex space-x-2 items-center">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">Coach is thinking... 🤔</span>
                                </div>
                                <div className="absolute top-4 w-3 h-3 transform rotate-45 bg-white/95 -left-1"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fitness Theme */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20 p-6">
                <div className="flex items-end space-x-4">
                    {/* Fitness attachment button */}
                    <button
                        className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isTyping}
                        title="Attach workout photo or video"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Input container */}
                    <div className="flex-1 relative">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isTyping ? "FitBot is analyzing..." : "Ask about workouts, nutrition, or health tips..."}
                            className="w-full resize-none bg-white/95 backdrop-blur-sm border border-green-200/30 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-800 placeholder-gray-500 shadow-xl transition-all duration-200 disabled:opacity-70"
                            rows={1}
                            style={{ minHeight: '56px', maxHeight: '120px' }}
                            disabled={isTyping}
                        />

                        {/* Character count */}
                        {inputMessage && (
                            <div className="absolute bottom-2 left-6 text-xs text-gray-400">
                                {inputMessage.length}/500
                            </div>
                        )}
                    </div>

                    {/* Send button - Fitness themed */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping}
                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent"
                        title="Send message"
                    >
                        {isTyping ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Quick suggestions - Fitness focused */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {['🏋️‍♀️ Create workout plan', '🥗 Healthy meal ideas', '💪 Build muscle tips', '🏃‍♂️ Cardio routines', '🧘‍♀️ Recovery advice', '📈 Track progress'].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isTyping}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
