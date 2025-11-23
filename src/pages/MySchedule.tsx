import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, Circle, Plus } from 'lucide-react';
import { ScheduleEvent, ChecklistItem } from '../types';
import { MOCK_EVENTS, MOCK_CHECKLIST } from '../constants';

export const MySchedule: React.FC = () => {
    const [events, setEvents] = useState<ScheduleEvent[]>(MOCK_EVENTS);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(MOCK_CHECKLIST);

    const toggleTask = (id: string) => {
        setChecklist(checklist.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
            <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-8">My Schedule Planner</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Calendar View (Simplified Grid) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-stone-800 flex items-center">
                            <CalendarIcon className="mr-2 text-emerald-600" /> June 2024
                        </h3>
                        <button className="text-sm text-emerald-700 font-medium hover:underline">+ Add Event</button>
                    </div>
                    
                    {/* Simple CSS Grid Calendar for Prototype */}
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map(d => (
                            <div key={d} className="text-xs font-bold text-stone-400">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({length: 35}).map((_, i) => {
                            const day = i - 4; // Offset for demo
                            const isCurrentMonth = day > 0 && day <= 30;
                            const hasEvent = isCurrentMonth && events.find(e => new Date(e.date).getDate() === day);
                            
                            return (
                                <div 
                                    key={i} 
                                    className={`aspect-square border rounded-lg p-1 flex flex-col justify-between relative
                                    ${isCurrentMonth ? 'bg-white border-stone-100' : 'bg-stone-50 border-transparent'}
                                    ${hasEvent ? 'ring-1 ring-emerald-500' : ''}`}
                                >
                                    {isCurrentMonth && (
                                        <>
                                            <span className={`text-sm ${hasEvent ? 'font-bold text-emerald-800' : 'text-stone-600'}`}>{day}</span>
                                            {hasEvent && (
                                                <div className="text-[8px] leading-tight bg-emerald-100 text-emerald-800 rounded px-1 py-0.5 truncate">
                                                    {hasEvent.title}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-bold text-stone-500 uppercase">Upcoming Events</h4>
                        {events.map(event => (
                            <div key={event.id} className="flex items-center bg-stone-50 p-3 rounded-lg border-l-4 border-emerald-500">
                                <div className="flex-1">
                                    <p className="font-bold text-stone-800">{event.title}</p>
                                    <p className="text-xs text-stone-500">{event.date} • {event.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Checklist Timeline */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-stone-800">D-Day Checklist</h3>
                        <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round((checklist.filter(c=>c.completed).length / checklist.length) * 100)}% Done
                        </div>
                    </div>

                    <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                        {checklist.map(item => (
                            <div key={item.id} className="relative flex items-start pl-10">
                                <div 
                                    onClick={() => toggleTask(item.id)}
                                    className="absolute left-2 -translate-x-1/2 top-1 bg-white cursor-pointer"
                                >
                                    {item.completed ? (
                                        <CheckCircle className="text-emerald-500 fill-emerald-50" size={20} />
                                    ) : (
                                        <Circle className="text-stone-300" size={20} />
                                    )}
                                </div>
                                <div className={`flex-1 p-3 rounded-lg border transition-all ${item.completed ? 'bg-stone-50 border-stone-100 opacity-70' : 'bg-white border-stone-200 shadow-sm'}`}>
                                    <p className={`font-medium ${item.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                        {item.task}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-1">Due: {item.dueDate}</p>
                                </div>
                            </div>
                        ))}
                        
                        <button className="w-full py-3 border border-dashed border-stone-300 rounded-lg text-stone-400 hover:text-emerald-600 hover:border-emerald-400 flex items-center justify-center space-x-2 ml-8 transition">
                            <Plus size={16} />
                            <span>Add New Task</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};