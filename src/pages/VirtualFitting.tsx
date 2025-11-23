
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, User, Camera, CheckCircle, ArrowRight, Wand2, ShoppingBag, X, ArrowLeft } from 'lucide-react';
import { analyzeBodyType } from '../services/geminiService';
import { MoodTestResult } from '../types';

interface VirtualFittingProps {
    moodResult: MoodTestResult | null;
}

export const VirtualFitting: React.FC<VirtualFittingProps> = ({ moodResult }) => {
    // Flow: 'INTRO' -> 'ANALYSIS_MODE' -> 'RESULT' -> 'FITTING_ROOM'
    const [step, setStep] = useState<'INTRO' | 'ANALYSIS_MODE' | 'RESULT' | 'FITTING_ROOM'>('INTRO');
    const [analysisMode, setAnalysisMode] = useState<'UPLOAD' | 'MANUAL'>('UPLOAD');

    // Upload State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Input State
    const [manualBodyShape, setManualBodyShape] = useState('');
    const [manualConcern, setManualConcern] = useState('');
    const [manualCorrectionGoal, setManualCorrectionGoal] = useState(''); // New Question

    // Result State
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    
    // Dress Selection State
    const [selectedDressIds, setSelectedDressIds] = useState<number[]>([]);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerAIAnalysis = async () => {
        if (!imagePreview) return;
        setIsAnalyzing(true);
        
        // Mocking interaction with Gemini
        const result = await analyzeBodyType("A full body photo of a person. Analyze body shape for wedding dress.");
        
        setAnalysisResult(result);
        setIsAnalyzing(false);
        setStep('RESULT');
    };

    const submitManual = () => {
        setAnalysisResult({
            bodyType: manualBodyShape,
            analysis: `선택하신 ${manualBodyShape}은(는) 우아한 라인이 돋보이는 체형입니다. ${manualConcern}을 커버하고 ${manualCorrectionGoal} 효과를 주는 스타일링을 제안합니다.`,
            recommendedSilhouettes: ['A라인', '벨라인', '오프숄더'],
            avoidSilhouettes: ['머메이드']
        });
        setStep('RESULT');
    };

    const toggleDressSelection = (id: number) => {
        if (selectedDressIds.includes(id)) {
            setSelectedDressIds(prev => prev.filter(did => did !== id));
        } else {
            if (selectedDressIds.length < 6) {
                setSelectedDressIds(prev => [...prev, id]);
            }
        }
    };

    // --- Views ---

    // 1. Intro
    if (step === 'INTRO') {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 pb-32 text-center">
                <div className="mb-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-emerald-700 w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                        AI 체형 분석 & 가상 피팅
                    </h2>
                    <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
                        가장 완벽한 드레스 핏을 위해 고객님의 체형을 분석합니다.<br/>
                        사진을 업로드하거나, 알고 있는 체형을 선택해주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button 
                        onClick={() => { setAnalysisMode('UPLOAD'); setStep('ANALYSIS_MODE'); }}
                        className="group bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300"
                    >
                        <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                            <Camera className="text-stone-600 group-hover:text-emerald-700" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">사진으로 분석하기</h3>
                        <p className="text-sm text-stone-500">전신 사진을 올리면 AI가 자동으로 체형을 분석합니다.</p>
                    </button>

                    <button 
                        onClick={() => { setAnalysisMode('MANUAL'); setStep('ANALYSIS_MODE'); }}
                        className="group bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300"
                    >
                        <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                            <User className="text-stone-600 group-hover:text-emerald-700" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">직접 선택하기</h3>
                        <p className="text-sm text-stone-500">나의 체형을 이미 알고 있다면 직접 선택해주세요.</p>
                    </button>
                </div>
            </div>
        );
    }

    // 2. Analysis Mode (Upload or Manual)
    if (step === 'ANALYSIS_MODE') {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
                <button onClick={() => setStep('INTRO')} className="text-stone-400 hover:text-stone-800 mb-8 flex items-center">
                    <ArrowRight className="rotate-180 mr-2" size={18}/> 뒤로가기
                </button>

                {analysisMode === 'UPLOAD' ? (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 text-center max-w-xl mx-auto">
                        <h3 className="text-2xl font-bold text-stone-800 mb-6">전신 사진 업로드</h3>
                        
                        <div 
                            className={`relative border-2 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer mb-6
                            ${imagePreview ? 'border-emerald-500 bg-stone-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100'}`}
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Uploaded" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <div className="bg-white p-4 rounded-full shadow-md mb-4">
                                        <Upload size={32} className="text-emerald-600" />
                                    </div>
                                    <p className="text-stone-500 font-medium">클릭하여 사진 업로드</p>
                                </>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                             {imagePreview && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                    className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm hover:bg-black/70 backdrop-blur"
                                >
                                    사진 변경
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={triggerAIAnalysis}
                            disabled={!imagePreview || isAnalyzing}
                            className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-900 disabled:opacity-50 transition flex items-center justify-center"
                        >
                            {isAnalyzing ? 'AI 분석중...' : '체형 분석 시작하기'}
                        </button>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto space-y-8">
                        {/* Q1 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-200">
                            <h3 className="text-lg font-bold text-stone-800 mb-4">Q. 나의 체형은?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['모래시계형', '삼각형 (골반 발달)', '역삼각형 (어깨 발달)', '직사각형 (일자 허리)'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setManualBodyShape(opt)}
                                        className={`p-4 rounded-lg text-sm border font-medium transition
                                            ${manualBodyShape === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q2 */}
                        <div className="bg-white p-6 rounded-xl border border-stone-200">
                            <h3 className="text-lg font-bold text-stone-800 mb-4">Q. 체형 고민 부위는?</h3>
                            <div className="flex flex-wrap gap-3">
                                {['팔뚝살', '아랫배/복부', '키/비율', '승모근/어깨', '고민 없음'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setManualConcern(opt)}
                                        className={`px-5 py-3 rounded-full text-sm border font-medium transition
                                            ${manualConcern === opt ? 'bg-emerald-800 text-white border-emerald-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q3 New Question */}
                        <div className="bg-white p-6 rounded-xl border border-stone-200">
                            <h3 className="text-lg font-bold text-stone-800 mb-4">Q. 개선 방향은? (어떻게 보이고 싶나요?)</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    '단점은 완벽하게 커버하고 싶어요',
                                    '자연스럽게 드러내고 싶어요',
                                    '장점을 더 부각시키고 싶어요'
                                ].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setManualCorrectionGoal(opt)}
                                        className={`p-4 text-left rounded-lg text-sm border font-medium transition
                                            ${manualCorrectionGoal === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={submitManual}
                            disabled={!manualBodyShape || !manualConcern || !manualCorrectionGoal}
                            className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-900 disabled:opacity-50 transition"
                        >
                            결과 보기
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // 3. Result & Dress Selection
    if (step === 'RESULT') {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in slide-in-from-bottom duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Analysis Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <User size={24} className="text-emerald-800"/>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Body Analysis</h3>
                                    <p className="text-xl font-serif font-bold text-stone-900">{analysisResult.bodyType}</p>
                                </div>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed mb-6">
                                {analysisResult.analysis}
                            </p>
                            
                            <div className="bg-stone-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-stone-400 uppercase mb-2">Best Silhouette</p>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.recommendedSilhouettes?.map((s: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-white border border-stone-200 rounded text-sm font-medium text-emerald-800">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-24">
                             <h3 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                                <span>가상 피팅 장바구니</span>
                                <span className="text-emerald-600 text-sm">{selectedDressIds.length} / 6</span>
                             </h3>
                             <p className="text-xs text-stone-500 mb-4">마음에 드는 드레스를 선택해서 가상 피팅을 진행해보세요.</p>
                             
                             <button 
                                onClick={() => setStep('FITTING_ROOM')}
                                disabled={selectedDressIds.length === 0}
                                className="w-full bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-900 disabled:bg-stone-300 disabled:cursor-not-allowed transition flex items-center justify-center"
                            >
                                <Wand2 className="mr-2" size={18}/>
                                가상 피팅 시작하기
                            </button>
                        </div>
                    </div>

                    {/* Right: Dress Gallery */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center justify-between">
                            <span>
                                {moodResult ? `${moodResult.typeName}님을 위한 추천 드레스` : '추천 드레스 컬렉션'}
                            </span>
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             {[1,2,3,4,5,6,7,8,9].map(i => {
                                const isSelected = selectedDressIds.includes(i);
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => toggleDressSelection(i)}
                                        className={`group relative bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all duration-200
                                            ${isSelected ? 'ring-4 ring-emerald-500 transform scale-[1.02] z-10' : 'hover:shadow-xl hover:-translate-y-1'}`}
                                    >
                                        <div className="aspect-[3/4] overflow-hidden relative">
                                            <img 
                                                src={`https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=500&q=80`} 
                                                alt="Dress" 
                                                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                            />
                                            {/* Match Badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white">
                                                {95 - i}% Match
                                            </div>
                                            {/* Selection Overlay */}
                                            <div className={`absolute inset-0 bg-emerald-900/40 flex items-center justify-center transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`}>
                                                {isSelected && <CheckCircle size={48} className="text-white drop-shadow-lg" />}
                                            </div>
                                        </div>
                                        <div className={`p-3 ${isSelected ? 'bg-emerald-50' : 'bg-white'}`}>
                                            <h4 className="font-bold text-stone-800 text-sm truncate">Silk Mermaid Line {i}</h4>
                                            <p className="text-xs text-stone-500">Grace Kelly Bride</p>
                                        </div>
                                    </div>
                                );
                             })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Fitting Room (Virtual Try-on Simulation)
    if (step === 'FITTING_ROOM') {
         return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-8">
                     <button onClick={() => setStep('RESULT')} className="text-stone-500 hover:text-stone-800 flex items-center">
                        <ArrowLeft className="mr-2" size={20}/> 드레스 다시 고르기
                    </button>
                    <h2 className="text-2xl font-serif font-bold text-emerald-900">가상 피팅룸</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Preview Area */}
                    <div className="lg:col-span-2 bg-stone-900 rounded-3xl p-8 relative overflow-hidden min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-white text-2xl font-bold mb-2">AI 피팅 생성 완료!</h3>
                            <p className="text-stone-400 mb-8">선택하신 드레스와 고객님의 체형을 합성한 결과입니다.</p>
                            
                            {/* Mock Result Display */}
                            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                                {selectedDressIds.slice(0, 2).map((id) => (
                                    <div key={id} className="aspect-[3/4] bg-stone-800 rounded-xl overflow-hidden relative border border-stone-700 group">
                                         <img 
                                            src={`https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=500&q=80`} 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                            alt="Fitting Result"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-center text-white text-xs">
                                            Fitting #{id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 h-fit">
                        <h3 className="font-bold text-stone-800 mb-6">피팅 리스트 ({selectedDressIds.length})</h3>
                        <div className="space-y-4 mb-8">
                            {selectedDressIds.map(id => (
                                <div key={id} className="flex items-center justify-between p-3 border border-stone-100 rounded-lg bg-stone-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-stone-200 rounded-md overflow-hidden">
                                             <img src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover"/>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-stone-800">Dress #{id}</div>
                                            <div className="text-xs text-stone-500">Generating...</div>
                                        </div>
                                    </div>
                                    <CheckCircle size={16} className="text-emerald-500" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full border border-stone-300 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-50 transition">
                            이미지 전체 다운로드
                        </button>
                    </div>
                </div>
            </div>
         );
    }

    return null;
};