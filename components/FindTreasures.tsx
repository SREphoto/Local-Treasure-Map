
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ChatMode, Location } from '../types';
import { getGeneralResponse, getWebSearchResponse, getLocalSearchResponse, getDeepAnalysisResponse } from '../services/geminiService';
import { SendIcon, SparklesIcon, WebIcon, LocationIcon, BrainIcon, UserIcon, BotIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

const ChatModeSelector: React.FC<{ selectedMode: ChatMode; onSelectMode: (mode: ChatMode) => void; }> = ({ selectedMode, onSelectMode }) => {
    const modes = [
        { mode: ChatMode.General, icon: <SparklesIcon />, label: "General" },
        { mode: ChatMode.WebSearch, icon: <WebIcon />, label: "Web Search" },
        { mode: ChatMode.LocalSearch, icon: <LocationIcon />, label: "Local" },
        { mode: ChatMode.DeepAnalysis, icon: <BrainIcon />, label: "Analysis" },
    ];

    const getModeDescription = (mode: ChatMode) => {
        switch(mode) {
            case ChatMode.General: return "Fast answers for general questions. (Flash-Lite)";
            case ChatMode.WebSearch: return "Up-to-date info from the web. (Search Grounding)";
            case ChatMode.LocalSearch: return "Find places and sales near you. (Maps Grounding)";
            case ChatMode.DeepAnalysis: return "For complex problems and analysis. (Pro Thinking Mode)";
        }
    }

    return (
        <div className="mb-4 p-3 bg-white rounded-xl shadow">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {modes.map(({mode, icon, label}) => (
                    <button
                        key={mode}
                        onClick={() => onSelectMode(mode)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            selectedMode === mode ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 pt-2">{getModeDescription(selectedMode)}</p>
        </div>
    );
};


export const FindTreasures: React.FC = () => {
    const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.General);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            let response;
            if (chatMode === ChatMode.LocalSearch) {
                 const location = await new Promise<Location>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({latitude: position.coords.latitude, longitude: position.coords.longitude}),
                        (error) => reject(error)
                    );
                });
                response = await getLocalSearchResponse(input, location);
            } else if (chatMode === ChatMode.WebSearch) {
                response = await getWebSearchResponse(input);
            } else if (chatMode === ChatMode.DeepAnalysis) {
                response = await getDeepAnalysisResponse(input);
            } else {
                response = await getGeneralResponse(input);
            }

            const modelMessage: ChatMessage = { role: 'model', text: response.text, sources: response.sources };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message.includes('geolocation') 
                ? 'Could not get your location. Please enable location services.'
                : 'Sorry, something went wrong. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chatMode]);

    return (
        <div className="flex flex-col h-[75vh] bg-white rounded-xl shadow-md animate-fade-in">
            <ChatModeSelector selectedMode={chatMode} onSelectMode={setChatMode} />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 pt-10">Ask me anything about finding local treasures!</div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><BotIcon /></div>}
                        <div className={`max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                           <div className="prose prose-sm max-w-none">
                             <ReactMarkdown>{msg.text}</ReactMarkdown>
                           </div>
                           {msg.sources && msg.sources.length > 0 && (
                               <div className="mt-2 border-t pt-2">
                                   <h4 className="text-xs font-bold mb-1">Sources:</h4>
                                   <ul className="list-disc list-inside space-y-1">
                                       {msg.sources.map((source, i) => (
                                           <li key={i} className="text-xs">
                                               <a href={source.web?.uri || source.maps?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                   {source.web?.title || source.maps?.title || 'Source link'}
                                               </a>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           )}
                        </div>
                         {msg.role === 'user' && <div className="p-2 bg-gray-200 text-gray-700 rounded-full"><UserIcon /></div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><BotIcon /></div>
                         <div className="max-w-lg p-3 rounded-xl bg-gray-100 text-gray-800">
                             <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                         </div>
                    </div>
                )}
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about items, sales, or trends..."
                        className="flex-1 bg-transparent p-2 text-sm text-gray-800 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 rounded-md bg-blue-600 text-white disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
