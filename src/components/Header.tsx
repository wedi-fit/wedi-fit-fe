import React from 'react';
import { User, Heart, Shirt, LogOut, Menu, UserCircle } from 'lucide-react';
import { PageView, UserState } from '../types';

interface HeaderProps {
    user: UserState;
    onNavigate: (page: PageView) => void;
    onLoginToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLoginToggle }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('HOME')}>
                        <h1 className="text-2xl font-serif font-bold text-emerald-900 tracking-tight">
                            Wedi<span className="text-emerald-600">Fit</span>
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button 
                            onClick={() => onNavigate('MOOD_TEST')}
                            className="flex items-center space-x-2 text-stone-600 hover:text-emerald-700 transition"
                        >
                            <Heart size={18} />
                            <span className="font-medium">AI Mood Test</span>
                        </button>
                        <button 
                            onClick={() => onNavigate('VIRTUAL_FITTING')}
                            className="flex items-center space-x-2 text-stone-600 hover:text-emerald-700 transition"
                        >
                            <Shirt size={18} />
                            <span className="font-medium">AI Fitting</span>
                        </button>
                        
                        {user.isLoggedIn ? (
                            <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-stone-300">
                                <button 
                                    onClick={() => onNavigate('MY_SCHEDULE')}
                                    className="flex items-center space-x-2 text-stone-600 hover:text-emerald-700 transition"
                                >
                                    <UserCircle size={20} />
                                    <span className="font-medium">My Page</span>
                                </button>
                                <button 
                                    onClick={onLoginToggle}
                                    className="flex items-center space-x-1 text-stone-400 hover:text-red-500 transition text-sm"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={onLoginToggle}
                                className="ml-4 px-5 py-2 bg-emerald-800 text-white rounded-full font-medium hover:bg-emerald-900 transition shadow-md"
                            >
                                Login / Signup
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button (Placeholder) */}
                    <div className="md:hidden">
                        <button className="text-stone-600 hover:text-emerald-800">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};