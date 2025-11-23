
import React from 'react';
import { Sparkles } from 'lucide-react';

interface LandingProps {
    onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 via-white to-emerald-50 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-50/40 rounded-full blur-3xl opacity-60"></div>

            <div className="relative z-10 max-w-3xl text-center space-y-12 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
                {/* Logo Section */}
                <div className="mb-8 transform hover:scale-105 transition-transform duration-500">
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-emerald-950 tracking-tighter drop-shadow-sm">
                        Wedi<span className="text-emerald-600">Fit</span>
                    </h1>
                    <p className="text-emerald-800/70 font-serif italic mt-3 text-xl tracking-wide">
                        AI Wedding Stylist & Planner
                    </p>
                </div>

                {/* Text Section */}
                <div className="space-y-8 backdrop-blur-sm bg-white/30 p-8 rounded-3xl border border-white/50 shadow-sm">
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-800 leading-relaxed font-serif">
                        웨디핏(WediFit)은 결혼식 취향과 스타일을<br className="hidden md:block" /> 
                        분석해주는 간편한 웨딩플랜 서비스입니다.
                    </h2>
                    
                    <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-200 to-emerald-400 mx-auto rounded-full opacity-80"></div>

                    <p className="text-stone-600 leading-loose text-base md:text-lg">
                        간단한 질문으로 나의 <span className="font-bold text-emerald-800 bg-emerald-100/50 px-1 rounded">‘결BTI’</span>를 알아보고,<br />
                        나의 체형에 어울리는 <span className="font-bold text-emerald-800 bg-emerald-100/50 px-1 rounded">드레스 디자인과 가상 피팅 이미지</span>,<br />
                        예산대별 추천 스드메 업체까지 한눈에 확인해보세요.
                    </p>

                    <p className="text-stone-800 font-bold text-lg md:text-xl">
                        합리적이고 아름다운 결혼식을 웨디핏과 함께 디자인해요!
                    </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                    <button 
                        onClick={onStart}
                        className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white transition-all duration-300 bg-emerald-900 rounded-full hover:bg-emerald-800 hover:scale-105 hover:shadow-xl shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-900"
                    >
                        <span>시작하기</span>
                        <Sparkles className="ml-2 w-5 h-5 text-emerald-200 group-hover:text-white transition-colors animate-pulse" />
                    </button>
                </div>
            </div>
            
            {/* Footer Note */}
            <div className="absolute bottom-8 text-stone-400 text-xs">
                © 2024 WediFit AI. All rights reserved.
            </div>
        </div>
    );
};
