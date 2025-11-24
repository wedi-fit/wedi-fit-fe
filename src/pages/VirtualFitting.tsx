
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle, Wand2, ArrowLeft } from 'lucide-react';
import { analyzeBodyTypeFromImage, createCompositeImages } from '../services/bodyTypeService';
import { fetchRecommendedDresses, getDressImageUrl, Dress } from '../services/dressService';
import { MoodTestResult } from '../types';

interface VirtualFittingProps {
    moodResult: MoodTestResult | null;
}

export const VirtualFitting: React.FC<VirtualFittingProps> = ({ moodResult }) => {
    // Flow: 'UPLOAD' -> 'RESULT' -> 'FITTING_ROOM'
    const [step, setStep] = useState<'UPLOAD' | 'RESULT' | 'FITTING_ROOM'>('UPLOAD');

    // Upload State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Result State
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    // Dress Selection State
    const [selectedDressIds, setSelectedDressIds] = useState<string[]>([]);
    const [recommendedDresses, setRecommendedDresses] = useState<Dress[]>([]);
    const [isLoadingDresses, setIsLoadingDresses] = useState(false);

    // Fitting Room State
    const [compositeResults, setCompositeResults] = useState<any[]>([]);
    const [isGeneratingFitting, setIsGeneratingFitting] = useState(false);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImageFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerAIAnalysis = async () => {
        if (!uploadedImageFile) return;
        setIsAnalyzing(true);

        try {
            // MediaPipe 기반 신체 유형 분석
            const result = await analyzeBodyTypeFromImage(uploadedImageFile);

            if (!result.success) {
                alert(result.error || '신체 유형 분석에 실패했습니다.');
                setIsAnalyzing(false);
                return;
            }

            setAnalysisResult({
                bodyType: result.body_type,
                bodyTypeKey: result.body_type_key,
                confidence: result.confidence,
                analysis: result.analysis,
                recommendedSilhouettes: result.recommended_silhouettes || [],
                avoidSilhouettes: result.avoid_silhouettes || [],
                visualizationImageUrl: result.visualization_image_url
            });
            setIsAnalyzing(false);
            setStep('RESULT');
        } catch (error) {
            console.error('신체 유형 분석 오류:', error);
            alert('신체 유형 분석 중 오류가 발생했습니다.');
            setIsAnalyzing(false);
        }
    };

    const toggleDressSelection = (id: string) => {
        if (selectedDressIds.includes(id)) {
            setSelectedDressIds(prev => prev.filter(did => did !== id));
        } else {
            if (selectedDressIds.length < 6) {
                setSelectedDressIds(prev => [...prev, id]);
            }
        }
    };

    const startVirtualFitting = async () => {
        if (!uploadedImageFile || selectedDressIds.length === 0) return;

        setIsGeneratingFitting(true);
        setStep('FITTING_ROOM');

        try {
            console.log(`가상 피팅 시작: 선택한 드레스 ${selectedDressIds.length}개`, selectedDressIds);
            
            // 실제 이미지 합성 API 호출
            const result = await createCompositeImages(uploadedImageFile, selectedDressIds);
            
            console.log('가상 피팅 API 응답:', result);
            console.log('선택한 드레스 개수:', selectedDressIds.length);
            console.log('API 응답 결과 개수:', result?.results?.length || 0);

            // API 응답 형식 확인 및 처리
            let allResults: any[] = [];

            if (result && result.results && Array.isArray(result.results)) {
                // results 배열이 있는 경우
                allResults = result.results;
                console.log('처리할 결과 개수:', allResults.length);
            } else if (result && Array.isArray(result)) {
                // 결과가 직접 배열인 경우
                allResults = result;
                console.log('직접 배열 형식, 처리할 결과 개수:', allResults.length);
            } else if (result && result.success_count !== undefined && result.results) {
                // success_count 형식인 경우
                allResults = result.results;
                console.log('success_count 형식, 처리할 결과 개수:', allResults.length);
            }

            if (allResults.length > 0) {
                // 모든 결과를 표시 (성공/실패 모두 포함)
                // 선택한 드레스 개수와 결과 개수 비교
                if (allResults.length < selectedDressIds.length) {
                    console.warn(`경고: 선택한 드레스 ${selectedDressIds.length}개 중 ${allResults.length}개만 결과가 반환되었습니다.`);
                }

                // 결과를 선택한 드레스 ID 순서대로 정렬 (있는 경우)
                const sortedResults = allResults.sort((a, b) => {
                    const aIndex = selectedDressIds.indexOf(a.dress_id || a.id);
                    const bIndex = selectedDressIds.indexOf(b.dress_id || b.id);
                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });

                setCompositeResults(sortedResults);
                console.log('최종 표시할 결과 개수:', sortedResults.length);
            } else {
                // 결과가 없는 경우
                console.error('가상 피팅 결과가 없습니다:', result);
                setCompositeResults([]);
                alert('가상 피팅 생성에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('가상 피팅 생성 오류:', error);
            setCompositeResults([]);
            alert(`가상 피팅 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setIsGeneratingFitting(false);
        }
    };

    // RESULT 단계에서 추천 드레스 목록 로드
    useEffect(() => {
        if (step === 'RESULT' && recommendedDresses.length === 0 && !isLoadingDresses) {
            setIsLoadingDresses(true);
            fetchRecommendedDresses()
                .then(dresses => {
                    if (dresses.length > 0) {
                        setRecommendedDresses(dresses);
                    }
                })
                .catch(error => {
                    console.error('Failed to load recommended dresses:', error);
                })
                .finally(() => {
                    setIsLoadingDresses(false);
                });
        }
    }, [step]);

    // --- Views ---

    // 1. Upload (INTRO 제거됨 - 바로 사진 업로드)
    if (step === 'UPLOAD') {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
                <div className="mb-8 animate-in fade-in zoom-in duration-500 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-emerald-700 w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                        AI 체형 분석 & 가상 피팅
                    </h2>
                    <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
                        전신 사진을 업로드하면 AI가 자동으로 체형을 분석하고<br/>
                        가장 어울리는 웨딩드레스를 추천해드립니다.
                    </p>
                </div>

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
                                <p className="text-stone-400 text-sm mt-2">얼굴부터 발끝까지 전신이 보이는 사진</p>
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
                        {isAnalyzing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                AI 체형 분석 중...
                            </>
                        ) : (
                            '체형 분석 시작하기'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // 2. Result & Dress Selection
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
                                    <Sparkles size={24} className="text-emerald-800"/>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Body Analysis</h3>
                                    <p className="text-xl font-serif font-bold text-stone-900">{analysisResult.bodyType}</p>
                                </div>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed mb-6">
                                {analysisResult.analysis}
                            </p>

                            {/* 시각화 이미지 */}
                            {analysisResult.visualizationImageUrl && (
                                <div className="mb-6 rounded-xl overflow-hidden border-2 border-emerald-200">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'https://api.wedifit.me'}${analysisResult.visualizationImageUrl}`}
                                        alt="체형 분석 시각화"
                                        className="w-full h-auto"
                                        onError={(e) => {
                                            console.error('시각화 이미지 로드 실패');
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="bg-emerald-50 px-3 py-2 text-center">
                                        <p className="text-xs text-emerald-800 font-medium">
                                            측정 결과 시각화
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-stone-50 p-4 rounded-xl mb-4">
                                <p className="text-xs font-bold text-stone-400 uppercase mb-2">Best Silhouette</p>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.recommendedSilhouettes?.map((s: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-white border border-stone-200 rounded text-sm font-medium text-emerald-800">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {analysisResult.avoidSilhouettes && analysisResult.avoidSilhouettes.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">피하면 좋은 스타일</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.avoidSilhouettes.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-white border border-red-200 rounded text-sm font-medium text-red-700">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-24">
                             <h3 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                                <span>가상 피팅 장바구니</span>
                                <span className="text-emerald-600 text-sm">{selectedDressIds.length} / 6</span>
                             </h3>
                             <p className="text-xs text-stone-500 mb-4">마음에 드는 드레스를 선택해서 가상 피팅을 진행해보세요.</p>

                             <button
                                onClick={startVirtualFitting}
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
                            {isLoadingDresses ? (
                                <div className="col-span-full text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                                    <p className="text-stone-500">추천 드레스를 불러오는 중...</p>
                                </div>
                            ) : recommendedDresses.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-stone-500">추천 드레스를 찾을 수 없습니다.</p>
                                </div>
                            ) : (
                                recommendedDresses.map((dress) => {
                                    const isSelected = selectedDressIds.includes(dress.id);
                                    return (
                                        <div
                                            key={dress.id}
                                            onClick={() => toggleDressSelection(dress.id)}
                                            className={`group relative bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all duration-200
                                                ${isSelected ? 'ring-4 ring-emerald-500 transform scale-[1.02] z-10' : 'hover:shadow-xl hover:-translate-y-1'}`}
                                        >
                                            <div className="aspect-[3/4] overflow-hidden relative">
                                                <img
                                                    src={getDressImageUrl(dress.imageUrl)}
                                                    alt={dress.name}
                                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=500&q=80';
                                                    }}
                                                />
                                                {dress.style && (
                                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white">
                                                        {dress.style}
                                                    </div>
                                                )}
                                                <div className={`absolute inset-0 bg-emerald-900/40 flex items-center justify-center transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`}>
                                                    {isSelected && <CheckCircle size={48} className="text-white drop-shadow-lg" />}
                                                </div>
                                            </div>
                                            <div className={`p-3 ${isSelected ? 'bg-emerald-50' : 'bg-white'}`}>
                                                <h4 className="font-bold text-stone-800 text-sm truncate">{dress.name}</h4>
                                                {dress.style && (
                                                    <p className="text-xs text-stone-500">{dress.style}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Fitting Room (실제 합성 이미지 표시)
    if (step === 'FITTING_ROOM') {
         return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-8">
                     <button onClick={() => setStep('RESULT')} className="text-stone-500 hover:text-stone-800 flex items-center">
                        <ArrowLeft className="mr-2" size={20}/> 드레스 다시 고르기
                    </button>
                    <h2 className="text-2xl font-serif font-bold text-emerald-900">가상 피팅 결과</h2>
                </div>

                {isGeneratingFitting ? (
                    <div className="bg-white rounded-3xl p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-6"></div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">AI 피팅 생성 중...</h3>
                        <p className="text-stone-500">선택하신 드레스와 고객님의 체형을 합성하고 있습니다.</p>
                    </div>
                ) : compositeResults.length > 0 ? (
                    <div>
                        <div className="mb-4 text-sm text-stone-600">
                            선택한 드레스 {selectedDressIds.length}개 중 {compositeResults.length}개의 피팅 결과를 표시합니다.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {compositeResults.map((result, index) => {
                                // result가 성공했는지 확인 (success가 false가 아니고, image_url이 있는 경우)
                                const isSuccess = result.success !== false && result.image_url;
                                const imageUrl = isSuccess 
                                    ? (result.image_url.startsWith('http') 
                                        ? result.image_url 
                                        : `${import.meta.env.VITE_API_URL || 'https://api.wedifit.me'}${result.image_url}`)
                                    : null;
                                
                                // 고유 키 생성 (dress_id, id, 또는 index 사용)
                                const uniqueKey = result.dress_id || result.id || `dress-${index}`;

                                return (
                                    <div key={uniqueKey} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                                        <div className="aspect-[3/4] bg-stone-100 relative">
                                            {isSuccess && imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={result.dress_name || `드레스 ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error(`이미지 로드 실패: ${imageUrl}`);
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        // 에러 메시지 표시를 위한 div 생성
                                                        const errorDiv = document.createElement('div');
                                                        errorDiv.className = 'w-full h-full flex items-center justify-center bg-red-50';
                                                        errorDiv.innerHTML = '<p class="text-red-600 text-sm px-4 text-center">이미지를 불러올 수 없습니다</p>';
                                                        target.parentElement?.appendChild(errorDiv);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-red-50">
                                                    <p className="text-red-600 text-sm px-4 text-center">
                                                        {result.error_message || '합성 실패'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-stone-900 mb-1">
                                                {result.dress_name || `드레스 ${index + 1}`}
                                            </h4>
                                            {result.style && (
                                                <p className="text-sm text-stone-500">{result.style}</p>
                                            )}
                                            {isSuccess && (
                                                <div className="mt-3 flex items-center text-emerald-600 text-sm">
                                                    <CheckCircle size={16} className="mr-1" />
                                                    <span>피팅 완료</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center">
                        <p className="text-stone-500 mb-4">가상 피팅 결과가 없습니다.</p>
                        <button
                            onClick={() => setStep('RESULT')}
                            className="text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                            드레스를 다시 선택해주세요
                        </button>
                    </div>
                )}
            </div>
         );
    }

    return null;
};
