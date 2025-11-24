
import React, { useState, useEffect } from 'react';
import { analyzeMoodFull } from '../services/geminiService';
import { Check, ChevronRight, ArrowLeft, Loader2, Sparkles, Shirt, ArrowRight as ArrowRightIcon, Star, Minus, Plus } from 'lucide-react';
import { MoodTestAnswers, MoodTestResult, PageView, Vendor, VendorCategory } from '../types';
import { fetchStudios } from '../services/studioService';
import { fetchDressVendors } from '../services/dressService';
import { fetchMakeupVendors } from '../services/makeupService';
import { isWithinBudget, formatMinPrice, getMinPriceInManwon } from '../utils/priceFormatter';

// --- Quiz Data & Options ---

import naturalGarden from '../assets/images/natural_garden.jpeg';
import classicHotel from '../assets/images/classic_hotel.jpeg';
import minimalModern from '../assets/images/minimal_modern.jpeg';
import romanticElegance from '../assets/images/romantic_elegance.jpeg';
import vintageRetro from '../assets/images/vintage_retro.jpeg';
import trendySns from '../assets/images/trendy_snssensitivity.jpeg';
import dramaticCinematic from '../assets/images/dramatic_cinematic.jpeg';
import casual from '../assets/images/casual.jpeg';

const MOOD_IMAGES = [
    { id: 'natural_garden', name: '내추럴/가든', src: naturalGarden },
    { id: 'classic_hotel', name: '클래식/호텔', src: classicHotel },
    { id: 'minimal_modern', name: '미니멀/모던', src: minimalModern },
    { id: 'romantic_elegance', name: '로맨틱/엘레강스', src: romanticElegance },
    { id: 'vintage_retro', name: '빈티지/레트로', src: vintageRetro },
    { id: 'trendy_sns', name: '트렌디/SNS감성', src: trendySns },
    { id: 'dramatic_cinematic', name: '드라마틱/시네마틱', src: dramaticCinematic },
    { id: 'casual', name: '캐주얼', src: casual },
];

// --- Type Definitions for Visualization ---
const TYPE_DESCRIPTIONS: Record<string, { title: string, sub: string }> = {
    'G': { title: '감성', sub: 'Emotional' },
    'S': { title: '실리', sub: 'Practical' },
    'B': { title: '규모', sub: 'Big Wedding' },
    'P': { title: '프라이빗', sub: 'Private' },
    'C': { title: '클래식', sub: 'Classic' },
    'M': { title: '트렌디', sub: 'Modern' },
    'L': { title: '주도', sub: 'Lead' },
    'F': { title: '위임', sub: 'Follow' }
};

// --- Component ---

import { BudgetInfo } from '../types';

interface MoodTestProps {
    onComplete: (result: MoodTestResult, budget: BudgetInfo) => void;
    onNavigate: (page: PageView) => void;
    onVendorClick: (vendor: Vendor) => void; // Added Prop
}

export const MoodTest: React.FC<MoodTestProps> = ({ onComplete, onNavigate, onVendorClick }) => {
    // Steps: 1(Decision) -> 2(Mood) -> 3(Budget) -> 4(Result)
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MoodTestResult | null>(null);

    // Form State
    const [answers, setAnswers] = useState<MoodTestAnswers>({
        q1_photo_budget: 'emotional',
        q2_guest_count: 'large',
        q3_style: 'classic',
        q4_prep_style: 'lead',
        q6_entrance_personality: 'introvert',
        q7_entrance_style: 'emotional',
        q5_moods: [],
        // Default Budget (Unit: Man-won)
        budget_studio: 150,
        budget_dress: 200,
        budget_makeup: 100
    });

    const updateAnswer = (key: keyof MoodTestAnswers, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const toggleMood = (id: string) => {
        const current = answers.q5_moods;
        if (current.includes(id)) {
            updateAnswer('q5_moods', []);
        } else {
            updateAnswer('q5_moods', [id]);
        }
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handlePrev = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const analysis = await analyzeMoodFull(answers);
            // Ensure we have a result before state updates
            if (analysis) {
                setResult(analysis);
                // 예산 정보도 함께 전달
                const budgetInfo: BudgetInfo = {
                    budget_studio: answers.budget_studio,
                    budget_dress: answers.budget_dress,
                    budget_makeup: answers.budget_makeup
                };
                onComplete(analysis, budgetInfo); // Notify App.tsx
                setStep(4); // Explicitly move to result step
            }
        } catch (e) {
            console.error("Mood Analysis Failed", e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Total Budget
    const totalBudget = answers.budget_studio + answers.budget_dress + answers.budget_makeup;

    // --- Render Steps ---

    const renderProgressBar = () => (
        <div className="w-full bg-stone-200 h-1.5 mb-8">
            <div 
                className="bg-emerald-600 h-1.5 transition-all duration-500 ease-out" 
                style={{ width: `${(step / 3) * 100}%` }}
            ></div>
        </div>
    );

    // STEP 1: Decision Style
    if (step === 1) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-12 pb-32 animate-in fade-in duration-500">
                {renderProgressBar()}
                <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">Step 1. 결혼식 취향 질문</h2>
                <p className="text-stone-500 mb-8">당신의 결혼식 취향을 알아보기 위한 간단한 질문입니다.</p>

                <div className="space-y-8">
                    <QuestionBlock 
                        question="Q1. 결혼식 사진, 예쁘면 예산 좀 더 써도 괜찮아?"
                        options={[
                            { label: "인생 한 번인데 예쁘게 남겨야지!", value: 'emotional', desc: "G형 (감성형)" },
                            { label: "적당히 예쁘면 됐지, 가성비가 더 중요해.", value: 'practical', desc: "S형 (실리형)" }
                        ]}
                        selected={answers.q1_photo_budget}
                        onSelect={(v) => updateAnswer('q1_photo_budget', v)}
                    />
                     <QuestionBlock 
                        question="Q2. 하객은 얼마나 오면 좋을까?"
                        options={[
                            { label: "많을수록 축하 받는 느낌이 나! 다 불러야지.", value: 'large', desc: "B형 (대형식형)" },
                            { label: "진짜 소중한 사람들만 부르고 싶어.", value: 'private', desc: "P형 (프라이빗형)" }
                        ]}
                        selected={answers.q2_guest_count}
                        onSelect={(v) => updateAnswer('q2_guest_count', v)}
                    />
                    <QuestionBlock 
                        question="Q3. 드레스나 식장 분위기, 어떤 스타일이 더 끌려?"
                        options={[
                            { label: "클래식하게, 정통 웨딩 느낌으로!", value: 'classic', desc: "C형 (클래식형)" },
                            { label: "요즘 감성으로 세련되고 미니멀하게.", value: 'modern', desc: "M형 (모던형)" }
                        ]}
                        selected={answers.q3_style}
                        onSelect={(v) => updateAnswer('q3_style', v)}
                    />
                    <QuestionBlock 
                        question="Q4. 웨딩 준비는 어떻게 하고 싶어?"
                        options={[
                            { label: "내가 직접 비교하고 결정해야 맘이 놓여!", value: 'lead', desc: "L형 (주도형)" },
                            { label: "전문가가 알아서 정리해주는 게 속 편하지.", value: 'delegate', desc: "F형 (위임형)" }
                        ]}
                        selected={answers.q4_prep_style}
                        onSelect={(v) => updateAnswer('q4_prep_style', v)}
                    />
                    <QuestionBlock 
                        question="Q6. 결혼식에서 나는 하객들 앞에서 어떤 모습일까?"
                        options={[
                            { label: "살짝 긴장했지만 차분하게 입장!", value: 'introvert', desc: "내향형" },
                            { label: "오예~ 손 흔들고 웃으며 입장!", value: 'extrovert', desc: "외향형" }
                        ]}
                        selected={answers.q6_entrance_personality}
                        onSelect={(v) => updateAnswer('q6_entrance_personality', v)}
                    />
                    <QuestionBlock 
                        question="Q7. 입장할 때 나는 어떤 스타일?"
                        options={[
                            { label: "음악과 감정을 느끼며, 한 걸음 한 걸음 천천히 가고 싶어!", value: 'emotional', desc: "감성형" },
                            { label: "마음 편하게, 자연스럽게 즐기며 걷고 싶어!", value: 'natural', desc: "자연형" }
                        ]}
                        selected={answers.q7_entrance_style}
                        onSelect={(v) => updateAnswer('q7_entrance_style', v)}
                    />
                </div>

                <div className="mt-12 flex justify-end">
                    <button onClick={handleNext} className="bg-emerald-800 text-white px-8 py-3 rounded-full flex items-center hover:bg-emerald-900 transition font-bold">
                        다음 단계로 <ChevronRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        );
    }

    // STEP 2: Mood Images
    if (step === 2) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 pb-32 animate-in fade-in duration-500">
                {renderProgressBar()}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">Step 2. 무드/취향</h2>
                    <p className="text-stone-500">결혼식을 어떤 무드의 사진으로 남기고 싶나요? (1개 선택)</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {MOOD_IMAGES.map((mood) => (
                        <div 
                            key={mood.id}
                            onClick={() => toggleMood(mood.id)}
                            className={`relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4] group transition-all border-2 shadow-sm
                                ${answers.q5_moods.includes(mood.id) ? 'border-emerald-500 ring-2 ring-emerald-500/30 transform scale-105 z-10' : 'border-transparent hover:border-stone-200'}`}
                        >
                            <img src={mood.src} alt={mood.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                                <span className="text-white font-medium text-sm tracking-wide">{mood.name}</span>
                            </div>
                            {answers.q5_moods.includes(mood.id) && (
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                    <Check size={14} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between">
                    <button onClick={handlePrev} className="text-stone-500 hover:text-stone-800 px-6 py-3 flex items-center">
                        <ArrowLeft size={18} className="mr-2" /> 이전
                    </button>
                    <button 
                        onClick={handleNext} 
                        disabled={answers.q5_moods.length === 0}
                        className="bg-emerald-800 text-white px-8 py-3 rounded-full flex items-center hover:bg-emerald-900 transition disabled:opacity-50 font-bold"
                    >
                        다음 단계로 <ChevronRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        );
    }

    // STEP 3: Budget (Revised)
    if (step === 3) {
        if (loading) return <LoadingView />;

        return (
            <div className="max-w-2xl mx-auto px-6 py-12 pb-32 animate-in fade-in duration-500">
                {renderProgressBar()}
                <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">Step 3. 예산/비용</h2>
                <p className="text-stone-500 mb-8">현실적인 스드메(스튜디오/드레스/메이크업) 예산을 직접 조정해보세요.</p>

                <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-lg mb-8">
                    <div className="flex justify-between items-end mb-8 pb-4 border-b border-stone-100">
                        <div>
                            <span className="text-sm font-bold text-stone-400 uppercase tracking-wide">Total Estimate</span>
                            <div className="text-4xl font-bold text-emerald-900 font-serif">
                                {totalBudget}<span className="text-lg text-stone-600 ml-1">만원</span>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-stone-400 mb-1">합리적인 예산 배분인가요?</div>
                            <div className="text-emerald-600 font-medium">AI가 예산에 맞는 업체를 찾고 있어요</div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <BudgetSlider 
                            label="스튜디오 (촬영)" 
                            icon="📸"
                            value={answers.budget_studio} 
                            onChange={(val) => updateAnswer('budget_studio', val)} 
                            min={100} max={500} 
                        />
                        <BudgetSlider 
                            label="드레스 (본식+촬영)" 
                            icon="👗"
                            value={answers.budget_dress} 
                            onChange={(val) => updateAnswer('budget_dress', val)} 
                            min={80} max={600} 
                        />
                        <BudgetSlider 
                            label="메이크업 (신랑/신부)" 
                            icon="💄"
                            value={answers.budget_makeup} 
                            onChange={(val) => updateAnswer('budget_makeup', val)} 
                            min={50} max={200} 
                        />
                    </div>
                </div>

                <div className="mt-12 flex justify-between items-center">
                    <button onClick={handlePrev} className="text-stone-500 hover:text-stone-800 px-6 py-3 flex items-center">
                        <ArrowLeft size={18} className="mr-2" /> 이전
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="bg-emerald-900 text-white px-10 py-4 rounded-full flex items-center font-bold text-lg shadow-xl hover:bg-emerald-950 transition transform hover:-translate-y-1"
                    >
                        <Sparkles className="mr-2 animate-pulse" size={20}/> 결과 확인하기
                    </button>
                </div>
            </div>
        );
    }

    // STEP 4: Result View
    if (step === 4 && result) {
        return <ResultView 
            result={result} 
            budget={answers}
            onNavigate={onNavigate} 
            onVendorClick={onVendorClick} 
        />;
    }

    return null;
};

// --- Sub-Components ---

const QuestionBlock = ({ question, options, selected, onSelect }: any) => (
    <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
        <h3 className="text-lg font-bold text-stone-800 mb-4">{question}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onSelect(opt.value)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200
                        ${selected === opt.value 
                            ? 'border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500' 
                            : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'}`}
                >
                    <div className={`font-bold mb-1 ${selected === opt.value ? 'text-emerald-900' : 'text-stone-700'}`}>
                        {opt.label}
                    </div>
                    <div className="text-xs text-stone-400">{opt.desc}</div>
                </button>
            ))}
        </div>
    </div>
);

interface BudgetSliderProps {
    label: string;
    icon: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
}

const BudgetSlider: React.FC<BudgetSliderProps> = ({ label, icon, value, onChange, min, max }) => {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <label className="font-bold text-stone-700 flex items-center">
                    <span className="text-xl mr-2">{icon}</span> {label}
                </label>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">{value}만원</span>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => onChange(Math.max(min, value - 10))}
                    className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
                >
                    <Minus size={16} />
                </button>
                <div className="flex-1">
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        step="10" 
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                </div>
                <button 
                    onClick={() => onChange(Math.min(max, value + 10))}
                    className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};

const LoadingView = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-700">
        <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">취향을 분석하고 있습니다...</h2>
        <p className="text-stone-500">AI 웨딩 플래너가 당신에게 딱 맞는 결혼식을 디자인 중입니다.</p>
    </div>
);

// --- Result View Component ---

const ResultView = ({ 
    result, 
    budget,
    onNavigate,
    onVendorClick 
}: { 
    result: MoodTestResult, 
    budget: MoodTestAnswers,
    onNavigate: (page: PageView) => void,
    onVendorClick: (vendor: Vendor) => void 
}) => {
    const [recommendedVendors, setRecommendedVendors] = useState<Vendor[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(true);

    // 예산 기반으로 실제 업체 추천
    useEffect(() => {
        const loadRecommendedVendors = async () => {
            setLoadingVendors(true);
            try {
                const allVendors: Vendor[] = [];
                
                // 각 카테고리별로 업체 가져오기
                try {
                    const studios = await fetchStudios();
                    allVendors.push(...studios);
                } catch (error) {
                    console.error('Failed to load studios:', error);
                }
                
                try {
                    const dressVendors = await fetchDressVendors();
                    allVendors.push(...dressVendors);
                } catch (error) {
                    console.error('Failed to load dress vendors:', error);
                }
                
                try {
                    const makeupVendors = await fetchMakeupVendors();
                    allVendors.push(...makeupVendors);
                } catch (error) {
                    console.error('Failed to load makeup vendors:', error);
                }

                // 예산 기반으로 필터링 및 추천
                const filtered: Vendor[] = [];
                
                console.log(`[추천 업체] 예산 설정 - 스튜디오: ${budget.budget_studio}만원, 드레스: ${budget.budget_dress}만원, 메이크업: ${budget.budget_makeup}만원`);
                console.log(`[추천 업체] 전체 업체 개수: ${allVendors.length}개`);
                
                // 스튜디오 추천 (예산 내)
                const studiosInBudget = allVendors
                    .filter(v => {
                        if (v.category !== VendorCategory.STUDIO) return false;
                        const isWithin = isWithinBudget(v.basePrice, budget.budget_studio);
                        console.log(`[스튜디오] ${v.name}: basePrice="${v.basePrice}", 예산=${budget.budget_studio}만원, 포함=${isWithin}`);
                        return isWithin;
                    })
                    .sort((a, b) => {
                        const priceA = getMinPriceInManwon(a.basePrice);
                        const priceB = getMinPriceInManwon(b.basePrice);
                        return priceA - priceB; // 가격 낮은 순
                    });
                console.log(`[스튜디오] 예산 내 업체: ${studiosInBudget.length}개`);
                if (studiosInBudget.length > 0) {
                    filtered.push(studiosInBudget[0]); // 가장 저렴한 것 하나
                    console.log(`[스튜디오] 추천: ${studiosInBudget[0].name} (${studiosInBudget[0].basePrice})`);
                }

                // 드레스 추천 (예산 내)
                const dressesInBudget = allVendors
                    .filter(v => {
                        if (v.category !== VendorCategory.DRESS) return false;
                        const isWithin = isWithinBudget(v.basePrice, budget.budget_dress);
                        console.log(`[드레스] ${v.name}: basePrice="${v.basePrice}", 예산=${budget.budget_dress}만원, 포함=${isWithin}`);
                        return isWithin;
                    })
                    .sort((a, b) => {
                        const priceA = getMinPriceInManwon(a.basePrice);
                        const priceB = getMinPriceInManwon(b.basePrice);
                        return priceA - priceB;
                    });
                console.log(`[드레스] 예산 내 업체: ${dressesInBudget.length}개`);
                if (dressesInBudget.length > 0) {
                    filtered.push(dressesInBudget[0]);
                    console.log(`[드레스] 추천: ${dressesInBudget[0].name} (${dressesInBudget[0].basePrice})`);
                }

                // 메이크업 추천 (예산 내)
                const makeupInBudget = allVendors
                    .filter(v => {
                        if (v.category !== VendorCategory.MAKEUP) return false;
                        const isWithin = isWithinBudget(v.basePrice, budget.budget_makeup);
                        console.log(`[메이크업] ${v.name}: basePrice="${v.basePrice}", 예산=${budget.budget_makeup}만원, 포함=${isWithin}`);
                        return isWithin;
                    })
                    .sort((a, b) => {
                        const priceA = getMinPriceInManwon(a.basePrice);
                        const priceB = getMinPriceInManwon(b.basePrice);
                        return priceA - priceB;
                    });
                console.log(`[메이크업] 예산 내 업체: ${makeupInBudget.length}개`);
                if (makeupInBudget.length > 0) {
                    filtered.push(makeupInBudget[0]);
                    console.log(`[메이크업] 추천: ${makeupInBudget[0].name} (${makeupInBudget[0].basePrice})`);
                }
                
                console.log(`[추천 업체] 최종 추천 개수: ${filtered.length}개`);

                setRecommendedVendors(filtered);
            } catch (error) {
                console.error('Error loading recommended vendors:', error);
            } finally {
                setLoadingVendors(false);
            }
        };

        loadRecommendedVendors();
    }, [budget]);

    // Breakdown the type code (e.g., "GBCL")
    const typeLetters = result.typeCode.split('');

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Result Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden mb-12">
                <div className="bg-emerald-900 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
                    <span className="inline-block px-3 py-1 bg-emerald-800/50 border border-emerald-700 text-emerald-100 text-xs font-bold rounded-full mb-4 tracking-widest">
                        GYEOL-BTI RESULT
                    </span>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2 tracking-tight">
                        {result.typeCode}
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-emerald-200 mb-6">{result.typeName}</h2>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        {result.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded-full text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="p-8 md:p-10">
                    {/* Type Breakdown Visualization */}
                    <div className="mb-8">
                        <div className="text-center text-xs font-bold text-stone-400 uppercase mb-4 tracking-wide">나의 WBTI 분석</div>
                        <div className="flex justify-center gap-2 sm:gap-4">
                            {typeLetters.map((letter, idx) => {
                                const desc = TYPE_DESCRIPTIONS[letter] || { title: letter, sub: '' };
                                return (
                                    <div key={idx} className="flex flex-col items-center bg-stone-50 px-3 py-3 rounded-xl w-20 sm:w-24 border border-stone-100 shadow-sm">
                                        <span className="text-2xl font-serif font-bold text-emerald-800 mb-1">{letter}</span>
                                        <span className="text-xs font-bold text-stone-700">{desc.title}</span>
                                        <span className="text-[10px] text-stone-400 uppercase">{desc.sub}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-lg text-stone-700 leading-relaxed text-center font-medium mb-8 max-w-2xl mx-auto whitespace-pre-line">
                        {result.description}
                    </div>

                    {/* Q6-Q7 Entrance Style Result */}
                    {result.entranceStyle && (
                        <div className="mt-10 pt-8 border-t border-stone-200">
                            <h3 className="text-xl font-serif font-bold text-emerald-900 mb-4 text-center">
                                입장 스타일 분석
                            </h3>
                            <div className="text-base text-stone-700 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                                {result.entranceStyle}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                         <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 text-center">
                            <div className="text-xs font-bold text-orange-800 uppercase mb-1">추천 업체 스타일</div>
                            <div className="text-lg font-bold text-stone-800">{result.recommendedVendorCategory}</div>
                        </div>
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 text-center">
                            <div className="text-xs font-bold text-purple-800 uppercase mb-1">추천 드레스 핏</div>
                            <div className="text-lg font-bold text-stone-800">{result.recommendedDressStyle}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Vendors Section */}
            <div className="mb-12">
                <h3 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center">
                    <Star className="mr-2 fill-emerald-900" size={24}/>
                    "{result.typeName}" 맞춤 추천 업체
                </h3>
                {loadingVendors ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mr-3" />
                        <span className="text-stone-600">예산에 맞는 업체를 찾고 있습니다...</span>
                    </div>
                ) : recommendedVendors.length === 0 ? (
                    <div className="text-center py-12 text-stone-500">
                        예산 범위 내의 추천 업체를 찾을 수 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {recommendedVendors.map((vendor) => (
                            <div 
                                key={`${vendor.category}-${vendor.id}`} 
                                onClick={() => onVendorClick(vendor)}
                                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer"
                            >
                                <div className="h-48 bg-stone-200 overflow-hidden">
                                    <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs font-bold text-emerald-600 uppercase">{vendor.category}</div>
                                    </div>
                                    <div className="font-serif font-bold text-lg text-stone-800 mb-2 truncate">{vendor.name}</div>
                                    <div className="text-emerald-900 font-bold">
                                        {vendor.basePrice ? formatMinPrice(vendor.basePrice) : '가격 문의'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA to Virtual Fitting */}
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
                 <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">이제 드레스를 입어볼까요?</h3>
                    <p className="text-stone-300">AI가 내 체형을 분석하고, 인생 드레스를 찾아드립니다.</p>
                 </div>
                 <button 
                    onClick={() => onNavigate('VIRTUAL_FITTING')}
                    className="relative z-10 bg-white text-stone-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition flex items-center shadow-lg"
                >
                    <Shirt className="mr-2" size={20}/>
                    AI 가상 피팅 시작하기 <ArrowRightIcon className="ml-2" size={20}/>
                </button>
            </div>
        </div>
    );
};
