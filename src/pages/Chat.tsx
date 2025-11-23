import React, { useState } from 'react';
import { Send, Paperclip, MoreVertical } from 'lucide-react';

export const Chat: React.FC = () => {
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState([
        { id: 1, sender: 'vendor', text: 'Hello! Thank you for your interest in Lumiere Studio. How can I help you today?', time: '10:30 AM' },
        { id: 2, sender: 'user', text: 'Hi, I wanted to ask about the outdoor shooting add-on. Is it available in rainy weather?', time: '10:32 AM' },
    ]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        setChats([...chats, { id: Date.now(), sender: 'user', text: message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        setMessage('');

        // Simulating reply
        setTimeout(() => {
            setChats(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: 'vendor', 
                text: 'Usually we have an indoor alternative prepared, or we can reschedule if the schedule permits!', 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            }]);
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto px-0 md:px-4 py-0 md:py-8 h-[calc(100vh-64px)]">
            <div className="bg-white md:rounded-2xl shadow-xl border border-stone-200 h-full flex flex-col overflow-hidden">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold">LS</div>
                        <div>
                            <h3 className="font-bold text-stone-800">Lumiere Studio</h3>
                            <span className="flex items-center text-xs text-emerald-600">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span> Online
                            </span>
                        </div>
                    </div>
                    <button className="text-stone-400 hover:text-stone-600">
                        <MoreVertical size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
                    <div className="text-center text-xs text-stone-400 my-4">Today</div>
                    {chats.map(chat => (
                        <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm
                                ${chat.sender === 'user' 
                                    ? 'bg-emerald-800 text-white rounded-br-none' 
                                    : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'}`}
                            >
                                {chat.text}
                                <p className={`text-[10px] mt-1 text-right ${chat.sender === 'user' ? 'text-emerald-200' : 'text-stone-400'}`}>
                                    {chat.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-stone-200">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <button type="button" className="text-stone-400 hover:text-emerald-600 p-2">
                            <Paperclip size={20} />
                        </button>
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border border-stone-200 rounded-full px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-stone-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!message.trim()}
                            className="bg-emerald-600 text-white p-2.5 rounded-full hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};