import React from 'react';
import { Calendar, CheckSquare, ArrowRight } from 'lucide-react';
import { ChecklistItem, PageView } from '../types';

interface SideWidgetProps {
    weddingDate?: string;
    checklist: ChecklistItem[];
    onNavigate: (page: PageView) => void;
}

export const SideWidget: React.FC<SideWidgetProps> = ({ weddingDate, checklist, onNavigate }) => {
    // Calculate D-Day
    const getDDay = () => {
        if (!weddingDate) return 'Set Date';
        const today = new Date();
        const target = new Date(weddingDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
    };

    const pendingCount = checklist.filter(c => !c.completed).length;

    return (
        <div className="hidden lg:block w-80 fixed right-8 top-24 z-40 space-y-4">
            {/* D-Day Card */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-stone-500 text-sm font-semibold uppercase">Wedding Day</h3>
                    <Calendar className="text-emerald-600" size={20} />
                </div>
                <div className="text-4xl font-bold text-emerald-900 font-serif tracking-tight">
                    {getDDay()}
                </div>
                <p className="text-stone-400 text-sm mt-1">
                    {weddingDate || 'Please set your wedding date'}
                </p>
            </div>

            {/* Checklist Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-stone-800 font-bold text-lg">Checklist</h3>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                        {pendingCount} Left
                    </span>
                </div>
                
                <ul className="space-y-3">
                    {checklist.slice(0, 3).map(item => (
                        <li key={item.id} className="flex items-start space-x-3">
                            <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                                ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300'}`}
                            >
                                {item.completed && <CheckSquare size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                                {item.task}
                            </span>
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => onNavigate('MY_SCHEDULE')}
                    className="w-full mt-4 text-emerald-700 text-sm font-semibold flex items-center justify-center space-x-1 hover:underline"
                >
                    <span>View Full Schedule</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};