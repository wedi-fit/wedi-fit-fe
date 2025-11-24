import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';

interface KakaoMapProps {
    location: string;
    businessName: string;
}

declare global {
    interface Window {
        kakao: any;
    }
}

export const KakaoMap: React.FC<KakaoMapProps> = ({ location, businessName }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapInstanceRef = useRef<any>(null);

    // 환경 변수에서 키를 가져오거나, index.html의 스크립트 태그에서 추출 (메모이제이션)
    const KAKAO_MAP_APP_KEY = useMemo(() => {
        // 1. 환경 변수에서 먼저 시도
        const envKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
        if (envKey) {
            return envKey;
        }
        
        // 2. index.html의 스크립트 태그에서 키 추출
        const scriptTag = document.querySelector('script[src*="dapi.kakao.com"]') as HTMLScriptElement;
        if (scriptTag) {
            // src 속성에서 직접 추출 (프로토콜 상대 URL 처리)
            const src = scriptTag.src || scriptTag.getAttribute('src') || '';
            if (src) {
                // URL 파싱 (프로토콜 상대 URL도 처리)
                const fullUrl = src.startsWith('//') ? `${window.location.protocol}${src}` : src;
                try {
                    const url = new URL(fullUrl);
                    const appkey = url.searchParams.get('appkey');
                    if (appkey) {
                        return appkey;
                    }
                } catch (e) {
                    // URL 파싱 실패 시 정규식으로 추출
                    const match = src.match(/[?&]appkey=([^&]+)/);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
            }
        }
        
        // 3. fallback: 하드코딩된 키 (index.html에 있는 키)
        return '4605f8b9d84e8fc08bf04518a5bca6f9';
    }, []);

    useEffect(() => {
        // 상태 초기화
        setIsLoading(true);
        setError(null);

        if (!location) {
            setError('위치 정보가 없습니다.');
            setIsLoading(false);
            return;
        }

        if (!KAKAO_MAP_APP_KEY) {
            console.error('VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.');
            setError('지도 API 키가 설정되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        console.log('카카오맵 초기화 시작:', { location, businessName, appKey: KAKAO_MAP_APP_KEY?.substring(0, 10) + '...' });

        // mapRef가 준비될 때까지 대기하는 함수 (즉시 실행)
        const waitForMapRef = (callback: () => void, maxAttempts = 5) => {
            let attempts = 0;
            const checkRef = () => {
                attempts++;
                if (mapRef.current) {
                    callback();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkRef, 50);
                } else {
                    console.error('mapRef가 준비되지 않았습니다.');
                    setError('지도 컨테이너를 초기화할 수 없습니다.');
                    setIsLoading(false);
                }
            };
            // 즉시 한 번 체크
            if (mapRef.current) {
                callback();
            } else {
                checkRef();
            }
        };

        const initializeMap = () => {
            if (!mapRef.current) {
                console.error('mapRef.current가 null입니다.');
                setError('지도 컨테이너를 찾을 수 없습니다.');
                setIsLoading(false);
                return;
            }

            if (!window.kakao || !window.kakao.maps) {
                console.error('카카오맵 API가 로드되지 않았습니다.');
                setError('카카오맵 스크립트가 로드되지 않았습니다.');
                setIsLoading(false);
                return;
            }

            // 백엔드 API를 통해 주소를 좌표로 변환
            const geocodeAddress = async () => {
                try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wedifit.me';
                    
                    // 타임아웃 설정 (10초)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    
                    const response = await fetch(`${API_BASE_URL}/api/v1/geocode?query=${encodeURIComponent(location)}`, {
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`Geocoding API 오류: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Geocoding 응답:', data);
                    
                    if (!data.success) {
                        setError(data.error || `주소를 찾을 수 없습니다. (${location})`);
                        setIsLoading(false);
                        return;
                    }
                    
                    // 기존 지도 인스턴스가 있으면 제거
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current = null;
                    }
                    
                    // 카카오맵 좌표 객체 생성
                    const position = new window.kakao.maps.LatLng(
                        data.latitude,
                        data.longitude
                    );

                    // 지도 생성
                    const mapOption = {
                        center: position,
                        level: 3 // 확대 레벨 (1-14, 숫자가 작을수록 확대)
                    };
                    const map = new window.kakao.maps.Map(mapRef.current, mapOption);
                    mapInstanceRef.current = map;

                    // 마커 생성
                    const marker = new window.kakao.maps.Marker({
                        position: position,
                        map: map
                    });

                    // 정보창 생성
                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `
                            <div style="padding: 10px; min-width: 150px;">
                                <div style="font-weight: bold; margin-bottom: 5px; color: #333;">${businessName}</div>
                                <div style="color: #666; font-size: 12px;">${location}</div>
                            </div>
                        `
                    });

                    // 마커 클릭 시 정보창 표시
                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        if (infowindow.getMap()) {
                            infowindow.close();
                        } else {
                            infowindow.open(map, marker);
                        }
                    });

                    // 초기 정보창 표시
                    infowindow.open(map, marker);

                    setIsLoading(false);
                } catch (error: any) {
                    if (error.name === 'AbortError') {
                        console.error('Geocoding API 타임아웃');
                        setError('주소 검색 시간이 초과되었습니다. 다시 시도해주세요.');
                    } else {
                        console.error('Geocoding 오류:', error);
                        setError(`주소 검색 중 오류가 발생했습니다: ${error.message || error}`);
                    }
                    setIsLoading(false);
                }
            };
            
            geocodeAddress();
        };

        // 카카오맵 스크립트 로드 및 초기화
        // 카카오맵 API는 기본적으로 자동 로드되므로 autoload 옵션 불필요
        const initializeKakaoMap = () => {
            // 스크립트가 이미 로드되어 있는지 확인
            if (window.kakao && window.kakao.maps) {
                console.log('✅ 카카오맵 API가 이미 로드되어 있습니다.');
                waitForMapRef(() => {
                    initializeMap();
                });
                return;
            }

            // index.html의 스크립트 확인
            const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
            
            if (!existingScript) {
                console.error('❌ index.html에 카카오맵 스크립트가 없습니다.');
                setError('지도 스크립트를 찾을 수 없습니다.');
                setIsLoading(false);
                return;
            }

            console.log('✅ 카카오맵 스크립트 태그 발견');

            // 스크립트 로드 완료 확인 함수 (더 빠른 체크)
            const checkKakaoMaps = (attempts = 0) => {
                if (window.kakao && window.kakao.maps) {
                    // 카카오맵 API가 로드됨
                    console.log('✅ 카카오맵 API 로드 완료');
                    waitForMapRef(() => {
                        initializeMap();
                    });
                } else if (attempts < 100) {
                    // 원격 서버를 위해 더 많은 시도 허용 (최대 20초)
                    // 초반에는 빠르게 체크, 후반에는 느리게
                    const delay = attempts < 20 ? 100 : 300;
                    if (attempts % 10 === 0 && attempts > 0) {
                        console.log(`카카오맵 로드 대기 중... (${attempts + 1}/100)`, {
                            hasKakao: !!window.kakao,
                            hasMaps: !!(window.kakao && window.kakao.maps)
                        });
                    }
                    setTimeout(() => checkKakaoMaps(attempts + 1), delay);
                } else {
                    // 타임아웃
                    console.error('❌ 카카오맵 API 로드 타임아웃');
                    console.error('현재 상태:', {
                        hasKakao: !!window.kakao,
                        hasMaps: !!(window.kakao && window.kakao.maps),
                        scriptSrc: existingScript.getAttribute('src'),
                        currentDomain: window.location.hostname,
                        currentPort: window.location.port
                    });
                    setError('카카오맵 스크립트가 로드되지 않았습니다. 카카오 개발자 콘솔에서 플랫폼 설정을 확인해주세요.');
                    setIsLoading(false);
                }
            };

            // 스크립트 로드 이벤트 처리
            if (existingScript.getAttribute('data-loaded') === 'true') {
                // 이미 로드 완료 표시가 있으면 바로 확인
                checkKakaoMaps();
            } else {
                // 로드 이벤트 리스너 추가
                const onLoad = () => {
                    console.log('✅ 카카오맵 스크립트 로드 이벤트 발생');
                    existingScript.setAttribute('data-loaded', 'true');
                    // 약간의 지연 후 확인 (스크립트가 완전히 실행되도록)
                    setTimeout(() => {
                        checkKakaoMaps();
                    }, 300);
                };

                const onError = (e: Event) => {
                    console.error('❌ 카카오맵 스크립트 로드 실패:', e);
                    console.error('스크립트 URL:', existingScript.src);
                    console.error('현재 도메인:', window.location.hostname);
                    console.error('현재 포트:', window.location.port);
                    setError('지도 스크립트를 불러오는데 실패했습니다. 카카오 개발자 콘솔에서 플랫폼 설정을 확인해주세요.');
                    setIsLoading(false);
                };

                existingScript.addEventListener('load', onLoad);
                existingScript.addEventListener('error', onError);

                // 스크립트가 이미 로드되었을 수도 있으므로 확인 시작
                // DOMContentLoaded 후에도 확인
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    checkKakaoMaps();
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        checkKakaoMaps();
                    });
                    // 혹시 모를 경우를 위해 바로 확인도 시작
                    checkKakaoMaps();
                }
            }
        };

        initializeKakaoMap();

        return () => {
            // Cleanup: 지도 인스턴스 정리
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [location, businessName, KAKAO_MAP_APP_KEY]);

    if (!KAKAO_MAP_APP_KEY) {
        return (
            <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-4">
                <div className="flex items-center justify-center py-8 text-stone-500">
                    <div className="text-center">
                        <MapPin size={24} className="mx-auto mb-2 text-stone-400" />
                        <p className="text-sm">지도 API 키가 설정되지 않았습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-4">
            <div className="flex items-center mb-4">
                <MapPin size={18} className="mr-2 text-emerald-600" />
                <h3 className="font-bold text-stone-800 text-lg">위치</h3>
            </div>
            
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="text-stone-500">지도를 불러오는 중...</div>
                </div>
            )}
            
            {error && (
                <div className="flex items-center justify-center py-8 text-stone-500">
                    <div className="text-center">
                        <MapPin size={24} className="mx-auto mb-2 text-stone-400" />
                        <p className="text-sm">{error}</p>
                        <p className="text-xs mt-1 text-stone-400">{location}</p>
                    </div>
                </div>
            )}
            
            <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg overflow-hidden border border-stone-200"
                style={{ 
                    minHeight: '256px',
                    visibility: isLoading || error ? 'hidden' : 'visible',
                    opacity: isLoading || error ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            />
        </div>
    );
};

