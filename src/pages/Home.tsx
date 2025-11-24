
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';
import { Vendor, UserState, MoodTestResult, PageView, VendorCategory, BudgetInfo } from '../types';
import { fetchStudios } from '../services/studioService';
import { fetchDressVendors } from '../services/dressService';
import { fetchMakeupVendors } from '../services/makeupService';
import { formatMinPrice, isWithinBudget } from '../utils/priceFormatter';

interface HomeProps {
    user: UserState;
    moodResult: MoodTestResult | null;
    budget: BudgetInfo | null;
    onVendorClick: (vendor: Vendor) => void;
    onNavigate: (page: PageView) => void;
}

type SortType = 'POPULARITY' | 'PRICE_ASC' | 'PRICE_DESC';

export const Home: React.FC<HomeProps> = ({ user, moodResult, budget, onVendorClick, onNavigate }) => {
    const [sortType, setSortType] = useState<SortType>('POPULARITY');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch vendors on mount
    useEffect(() => {
        const loadVendors = async () => {
            setLoading(true);
            const allVendors: Vendor[] = [];
            const errors: string[] = [];
            
            // 스튜디오, 드레스, 메이크업 업체를 독립적으로 조회 (하나가 실패해도 다른 것은 로드)
            try {
                console.log('[Home] Fetching studios...');
                const studios = await fetchStudios();
                allVendors.push(...studios);
                console.log(`[Home] ✅ Loaded ${studios.length} studios`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error('[Home] ❌ Failed to load studios:', errorMsg);
                errors.push(`스튜디오 로드 실패: ${errorMsg}`);
            }
            
            try {
                console.log('[Home] Fetching dress vendors...');
                const dressVendors = await fetchDressVendors();
                allVendors.push(...dressVendors);
                console.log(`[Home] ✅ Loaded ${dressVendors.length} dress vendors`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error('[Home] ❌ Failed to load dress vendors:', errorMsg);
                errors.push(`드레스 업체 로드 실패: ${errorMsg}`);
            }
            
            try {
                console.log('[Home] Fetching makeup vendors...');
                const makeupVendors = await fetchMakeupVendors();
                allVendors.push(...makeupVendors);
                console.log(`[Home] ✅ Loaded ${makeupVendors.length} makeup vendors`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error('[Home] ❌ Failed to load makeup vendors:', errorMsg);
                errors.push(`메이크업 업체 로드 실패: ${errorMsg}`);
            }
            
            // 에러가 있으면 콘솔에 출력
            if (errors.length > 0) {
                console.warn('[Home] ⚠️ 일부 업체 정보를 불러오지 못했습니다:', errors);
            }
            
            // 중복 제거: 같은 category와 id를 가진 vendor 제거
            const uniqueVendors = allVendors.reduce((acc, vendor) => {
                const key = `${vendor.category}-${vendor.id}`;
                if (!acc.has(key)) {
                    acc.set(key, vendor);
                }
                return acc;
            }, new Map<string, Vendor>());
            
            const finalVendors = Array.from(uniqueVendors.values());
            console.log(`[Home] 📊 Total loaded: ${finalVendors.length} unique vendors (${allVendors.length} before deduplication)`);
            console.log('[Home] 📊 Breakdown:', {
                studios: finalVendors.filter(v => v.category === VendorCategory.STUDIO).length,
                dresses: finalVendors.filter(v => v.category === VendorCategory.DRESS).length,
                makeup: finalVendors.filter(v => v.category === VendorCategory.MAKEUP).length
            });
            
            setVendors(finalVendors);
            setLoading(false);
        };

        loadVendors();
    }, []);

    // Sort logic with filtering
    const displayVendors = useMemo(() => {
        let filtered = [...vendors];

        // Filter Category - ALL일 때는 필터링하지 않음
        if (activeCategory !== 'ALL') {
            filtered = filtered.filter(v => v.category === activeCategory);
        }

        // Filter by Budget - 예산이 설정된 경우에만 필터링
        if (budget) {
            const beforeFilterCount = filtered.length;
            filtered = filtered.filter(v => {
                let budgetAmount = 0;
                if (v.category === VendorCategory.STUDIO) {
                    budgetAmount = budget.budget_studio;
                } else if (v.category === VendorCategory.DRESS) {
                    budgetAmount = budget.budget_dress;
                } else if (v.category === VendorCategory.MAKEUP) {
                    budgetAmount = budget.budget_makeup;
                }
                
                const isWithin = isWithinBudget(v.basePrice, budgetAmount);
                
                // 디버깅 로그 (개발 환경에서만)
                if (process.env.NODE_ENV === 'development') {
                    const minPrice = parseInt(v.basePrice.split('~')[0]) || 0;
                    if (!isWithin) {
                        console.log(`[예산 필터링] ${v.name} (${v.category}): 가격 ${minPrice}만원 > 예산 ${budgetAmount}만원 (120% = ${budgetAmount * 1.2}만원) - 제외`);
                    }
                }
                
                return isWithin;
            });
            
            if (process.env.NODE_ENV === 'development') {
                console.log(`[예산 필터링] 필터링 전: ${beforeFilterCount}개, 필터링 후: ${filtered.length}개`);
                console.log(`[예산 필터링] 설정된 예산 - 스튜디오: ${budget.budget_studio}만원, 드레스: ${budget.budget_dress}만원, 메이크업: ${budget.budget_makeup}만원`);
            }
        }

        // Sort
        let sorted = [...filtered];
        switch (sortType) {
            case 'PRICE_ASC':
                sorted.sort((a, b) => {
                    const priceA = parseInt(a.basePrice.split('~')[0]) || 0;
                    const priceB = parseInt(b.basePrice.split('~')[0]) || 0;
                    return priceA - priceB;
                });
                break;
            case 'PRICE_DESC':
                sorted.sort((a, b) => {
                    const priceA = parseInt(a.basePrice.split('~')[0]) || 0;
                    const priceB = parseInt(b.basePrice.split('~')[0]) || 0;
                    return priceB - priceA;
                });
                break;
            case 'POPULARITY':
            default:
                // 인기순은 임시로 이름순으로 정렬 (평점 제거됨)
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        return sorted;
    }, [vendors, activeCategory, sortType]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
            
            {/* Hero / Recommendation Banner */}
            <div className="mb-8">
                {moodResult ? (
                    // CASE A: User has taken the test -> Show Personalized Recommendations
                    <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg animate-in fade-in duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-2 text-emerald-200 font-bold text-sm tracking-widest uppercase">
                                <Sparkles size={16} />
                                <span>{moodResult.typeCode} 유형을 위한 추천</span>
                            </div>
                            <h2 className="text-3xl font-serif font-bold mb-2">
                                "{moodResult.typeName}"님을 위한 큐레이션
                            </h2>
                            <p className="text-emerald-100/80 max-w-xl mb-6">
                                분석된 취향을 바탕으로 
                                <strong> {moodResult.recommendedVendorCategory}</strong> 스타일의 업체와 
                                <strong> {moodResult.recommendedDressStyle}</strong> 디자인을 엄선했습니다.
                            </p>
                            <button 
                                onClick={() => setActiveCategory(VendorCategory.STUDIO)} 
                                className="bg-white text-emerald-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-50 transition"
                            >
                                추천 컬렉션 보기
                            </button>
                        </div>
                    </div>
                ) : (
                    // CASE B: User hasn't taken the test -> Show CTA
                    <div className="bg-gradient-to-r from-stone-100 to-stone-200 rounded-3xl p-8 md:p-10 relative overflow-hidden border border-stone-200 animate-in fade-in duration-500">
                         <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-950 mb-4">
                                내 결혼식, 어디서부터 시작할까요?
                            </h2>
                            <p className="text-stone-600 mb-8 text-lg">
                                나만의 "WBTI"를 알아보세요. <br/>
                                AI가 내 취향과 체형, 예산에 딱 맞는 스드메 업체를 추천해드립니다.
                            </p>
                            <button 
                                onClick={() => onNavigate('MOOD_TEST')}
                                className="bg-emerald-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-emerald-900 transition flex items-center group"
                            >
                                나의 웨딩 유형 알아보기
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Bar */}
            <div className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur py-4 border-b border-stone-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                
                {/* Category Pills */}
                <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {['ALL', VendorCategory.STUDIO, VendorCategory.DRESS, VendorCategory.MAKEUP].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${activeCategory === cat
                                ? 'bg-emerald-800 text-white'
                                : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
                        <button 
                            onClick={() => setSortType('POPULARITY')}
                            className={`px-3 py-1.5 text-xs font-bold rounded transition ${sortType === 'POPULARITY' ? 'bg-stone-100 text-stone-900' : 'text-stone-500'}`}
                        >
                            인기순
                        </button>
                        <button 
                             onClick={() => setSortType(sortType === 'PRICE_ASC' ? 'PRICE_DESC' : 'PRICE_ASC')}
                             className={`px-3 py-1.5 text-xs font-bold rounded transition flex items-center ${sortType.includes('PRICE') ? 'bg-stone-100 text-stone-900' : 'text-stone-500'}`}
                        >
                            가격순 <SlidersHorizontal size={12} className="ml-1"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-stone-500">로딩 중...</div>
                </div>
            ) : displayVendors.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-stone-500">업체 정보가 없습니다.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayVendors.map(vendor => (
                        <div
                            key={`${vendor.category}-${vendor.id}`}
                            onClick={() => onVendorClick(vendor)}
                            className="group bg-white rounded-xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        >
                            <div className="relative h-60 overflow-hidden">
                                <img
                                    src={vendor.image}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-stone-800 uppercase tracking-wider">
                                    {vendor.category}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-serif font-bold text-xl text-stone-800 group-hover:text-emerald-700 transition-colors truncate pr-2 flex-1">
                                        {vendor.name}
                                    </h3>
                                    <span className="text-lg font-bold text-emerald-900 whitespace-nowrap ml-2">
                                        {formatMinPrice(vendor.basePrice)}
                                    </span>
                                </div>
                                {/* Location Badge (Studio Only) */}
                                {vendor.category === VendorCategory.STUDIO && vendor.location && (
                                    <div className="text-stone-600 text-xs flex items-center">
                                        <MapPin size={12} className="mr-1"/> {vendor.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
