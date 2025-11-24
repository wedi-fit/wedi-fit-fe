
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MapPin, Phone, CheckCircle, Instagram } from 'lucide-react';
import { Vendor, CartItem, PageView, VendorCategory } from '../types';
import { formatPrice } from '../utils/priceFormatter';
import { KakaoMap } from './KakaoMap';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wedifit.me';

interface VendorModalProps {
    vendor: Vendor | null;
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateCart: (vendorId: string, addOnIds: string[]) => void;
    onNavigate: (page: PageView) => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({
    vendor, isOpen, onClose, cart, onUpdateCart, onNavigate
}) => {
    // 1. All Hooks must be called unconditionally at the top level
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [instagramPosts, setInstagramPosts] = useState<string[]>([]);
    const [instagramLoading, setInstagramLoading] = useState<boolean>(false);
    const instagramContainerRef = useRef<HTMLDivElement>(null);

    // Sync local state with global cart when modal opens
    useEffect(() => {
        if (vendor && isOpen) {
            const cartItem = cart.find(item => item.vendor.id === vendor.id);
            setSelectedAddOns(cartItem ? cartItem.selectedAddOns : []);
        }
    }, [vendor, isOpen, cart]);

    // Load Instagram feed when vendor has instagram account
    useEffect(() => {
        if (vendor?.instagram && isOpen) {
            const loadInstagramFeed = async () => {
                setInstagramLoading(true);
                try {
                    // @ 제거
                    const account = vendor.instagram.replace(/^@/, '');
                    const response = await fetch(`${API_BASE_URL}/api/v1/instagram/${account}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        // HTML에서 script 태그 제거 (중복 로드 방지)
                        const cleanedPosts = (data.posts || []).map((postHtml: string) => {
                            return postHtml.replace(/<script[^>]*>.*?<\/script>/gis, '');
                        });
                        setInstagramPosts(cleanedPosts);
                    } else {
                        console.error('Failed to load Instagram feed:', response.statusText);
                        setInstagramPosts([]);
                    }
                } catch (error) {
                    console.error('Error loading Instagram feed:', error);
                    setInstagramPosts([]);
                } finally {
                    setInstagramLoading(false);
                }
            };

            loadInstagramFeed();
        } else {
            setInstagramPosts([]);
        }
    }, [vendor?.instagram, isOpen]);

    // Load Instagram embed script and process embeds
    useEffect(() => {
        if (instagramPosts.length > 0 && instagramContainerRef.current) {
            const processEmbeds = () => {
                // 여러 번 시도하여 확실하게 처리
                if (window.instgrm && window.instgrm.Embeds) {
                    try {
                        window.instgrm.Embeds.process();
                    } catch (e) {
                        console.error('Instagram embed process error:', e);
                    }
                }
            };

            // Check if script is already loaded
            let existingScript = document.querySelector('script[src*="instagram.com/embed.js"]') as HTMLScriptElement;
            
            const loadScript = () => {
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.src = 'https://www.instagram.com/embed.js';
                    script.async = true;
                    script.onload = () => {
                        // 스크립트 로드 후 약간의 지연을 두고 처리
                        setTimeout(() => {
                            processEmbeds();
                            // 추가로 한 번 더 처리 (DOM이 완전히 렌더링된 후)
                            setTimeout(processEmbeds, 500);
                            setTimeout(processEmbeds, 1000);
                        }, 100);
                    };
                    script.onerror = () => {
                        console.error('Failed to load Instagram embed script');
                    };
                    document.body.appendChild(script);
                    existingScript = script;
                } else {
                    // Script already exists, wait a bit then process
                    // 스크립트가 이미 로드되었는지 확인
                    if (window.instgrm && window.instgrm.Embeds) {
                        setTimeout(() => {
                            processEmbeds();
                            setTimeout(processEmbeds, 500);
                            setTimeout(processEmbeds, 1000);
                        }, 100);
                    } else {
                        // 스크립트가 아직 로드 중이면 onload 이벤트 리스너 추가
                        existingScript.addEventListener('load', () => {
                            setTimeout(() => {
                                processEmbeds();
                                setTimeout(processEmbeds, 500);
                                setTimeout(processEmbeds, 1000);
                            }, 100);
                        });
                    }
                }
            };

            // MutationObserver로 blockquote가 추가될 때 감지
            const observer = new MutationObserver((mutations) => {
                let hasInstagramBlockquote = false;
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;
                            if (element.classList?.contains('instagram-media') || 
                                element.querySelector?.('.instagram-media')) {
                                hasInstagramBlockquote = true;
                            }
                        }
                    });
                });
                
                if (hasInstagramBlockquote) {
                    setTimeout(processEmbeds, 100);
                    setTimeout(processEmbeds, 500);
                }
            });

            // 스크립트 로드
            loadScript();

            // DOM 업데이트 감지 시작
            if (instagramContainerRef.current) {
                observer.observe(instagramContainerRef.current, {
                    childList: true,
                    subtree: true
                });
            }

            // DOM 업데이트 후 처리 (여러 번 시도)
            const timers = [
                setTimeout(processEmbeds, 200),
                setTimeout(processEmbeds, 500),
                setTimeout(processEmbeds, 1000),
                setTimeout(processEmbeds, 2000),
            ];

            return () => {
                observer.disconnect();
                timers.forEach(timer => clearTimeout(timer));
            };
        }
    }, [instagramPosts, isOpen]);

    // 기본 가격 포맷팅
    const basePriceFormatted = useMemo(() => {
        if (!vendor) return '';
        return formatPrice(vendor.basePrice);
    }, [vendor]);

    // 3. Conditional rendering comes LAST (after all hooks)
    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Image */}
                <div className="h-64 w-full relative bg-stone-200">
                    <img 
                        src={vendor.image} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover"
                    />
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                    >
                        <X size={20} className="text-stone-800" />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                         <div className="inline-block px-2 py-1 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide mb-2">
                            {vendor.category}
                         </div>
                         <h2 className="text-3xl font-serif font-bold text-white">{vendor.name}</h2>
                         <div className="flex items-center text-stone-200 text-sm mt-1 space-x-4">
                             {/* Only show location for Studio */}
                             {vendor.category === VendorCategory.STUDIO && (
                                <span className="flex items-center"><MapPin size={14} className="mr-1 text-emerald-400"/> {vendor.location}</span>
                             )}
                         </div>
                    </div>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
                    {/* 지도 섹션 - Studio 카테고리일 때만 표시 */}
                    {vendor.category === VendorCategory.STUDIO && vendor.location && (
                        <KakaoMap location={vendor.location} businessName={vendor.name} />
                    )}

                    {/* 기본가격 섹션 */}
                    {vendor.basePrice && (
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-stone-800 text-lg">기본가격</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-stone-200 bg-stone-50">
                                    <span className="font-medium text-stone-700">
                                        앨범 20P, 액자 20R 기준
                                    </span>
                                    <span className="text-stone-600 font-bold">{basePriceFormatted}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 추가 옵션 섹션 */}
                    {vendor.addOns.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-stone-800 text-lg">추가 옵션</h3>
                            </div>

                            <div className="space-y-3">
                                {vendor.addOns.map(option => (
                                    <div
                                        key={option.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-stone-200 bg-stone-50"
                                    >
                                        <span className="font-medium text-stone-700">
                                            {option.name}
                                        </span>
                                        <span className="text-stone-600 font-bold">{option.priceText}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 기타 옵션 섹션 */}
                    {vendor.otherOptions.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-4">
                            <h3 className="font-bold text-stone-800 text-lg mb-4">기타 옵션</h3>
                            <ul className="space-y-2">
                                {vendor.otherOptions.map((option, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-emerald-600 mr-2">•</span>
                                        <span className="text-stone-700">{option}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 인스타그램 피드 섹션 */}
                    {vendor.instagram && (
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                            <h3 className="font-bold text-stone-800 text-lg mb-3">인스타그램</h3>
                            
                            {/* 인스타그램 계정명 표시 */}
                            <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-stone-200">
                                <Instagram size={20} className="text-pink-600" />
                                <span className="text-stone-700 font-medium">
                                    @{vendor.instagram.replace(/^@/, '')}
                                </span>
                            </div>
                            
                            {instagramLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-stone-500">인스타그램 피드를 불러오는 중...</div>
                                </div>
                            ) : instagramPosts.length > 0 ? (
                                <div 
                                    ref={instagramContainerRef}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                >
                                    {instagramPosts.map((postHtml, index) => (
                                        <div
                                            key={index}
                                            className="instagram-post-container"
                                            dangerouslySetInnerHTML={{ __html: postHtml }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-stone-500 text-sm py-4">
                                    인스타그램 피드를 불러올 수 없습니다.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex space-x-2 w-full sm:w-auto">
                        {vendor.phoneNumber ? (
                            <a
                                href={`tel:${vendor.phoneNumber}`}
                                onClick={() => onClose()}
                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 font-medium text-sm transition"
                            >
                                <Phone size={18} />
                                <span>1:1 문의하기</span>
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 border border-stone-300 rounded-lg text-stone-400 cursor-not-allowed font-medium text-sm"
                            >
                                <Phone size={18} />
                                <span>1:1 문의하기</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
