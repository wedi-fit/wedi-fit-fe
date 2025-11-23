import { Vendor, VendorCategory } from '../types';
import { extractMinPriceFromBasePrice, parseOtherOptions } from '../utils/priceFormatter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wedifit.me';

export interface Dress {
    id: string;
    name: string;
    style: string;
    filename: string;
    imageUrl: string;
}

interface DressPriceApiResponse {
    id: string;
    business_name: string;
    base_price: string | null;
    dress_helper: string | null;
    design_extra_fee: string | null;
    first_wear: string | null;
    dress_extra_rental: string | null;
    location: string | null;
    instagram: string | null;
    phone_number: string | null;
}

interface StylesApiResponse {
    styles?: Dress[];
    dresses?: Dress[];
    total: number;
    message: string;
}

/**
 * AI Fitting 추천 드레스 목록 조회
 */
export async function fetchRecommendedDresses(): Promise<Dress[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/styles`);

        if (!response.ok) {
            throw new Error(`Failed to fetch recommended dresses: ${response.statusText}`);
        }

        const data: StylesApiResponse = await response.json();
        
        // styles 또는 dresses 키에서 드레스 목록 가져오기
        const dresses = data.styles || data.dresses || [];
        
        return dresses;
    } catch (error) {
        console.error('Error fetching recommended dresses:', error);
        return [];
    }
}

/**
 * 전체 드레스 목록 조회
 */
export async function fetchAllDresses(): Promise<Dress[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dresses`);

        if (!response.ok) {
            throw new Error(`Failed to fetch dresses: ${response.statusText}`);
        }

        const data = await response.json();
        const dresses: Dress[] = data.dresses || [];
        
        return dresses;
    } catch (error) {
        console.error('Error fetching dresses:', error);
        return [];
    }
}

/**
 * 드레스 업체 목록 조회
 */
export async function fetchDressVendors(): Promise<Vendor[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dress-prices`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch dress vendors: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch dress vendors: ${response.statusText}`);
        }

        const data = await response.json();
        const dressPrices: DressPriceApiResponse[] = data.dress_prices || data.dresses || [];

        // business_name으로 그룹화
        const vendorsMap = new Map<string, Vendor>();
        
        dressPrices.forEach(dressPrice => {
            const businessName = dressPrice.business_name;
            
            if (!vendorsMap.has(businessName)) {
                // base_price에서 최소 가격 추출
                const minPrice = extractMinPriceFromBasePrice(dressPrice.base_price);
                
                // 더미 이미지
                const dummyImage = 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80';

                // 기타 옵션 파싱
                const otherOptions: string[] = [];
                if (dressPrice.dress_helper) {
                    otherOptions.push(`드레스 도우미: ${dressPrice.dress_helper}`);
                }
                if (dressPrice.design_extra_fee) {
                    otherOptions.push(`디자인 추가비: ${dressPrice.design_extra_fee}`);
                }
                if (dressPrice.first_wear) {
                    otherOptions.push(`첫 입기: ${dressPrice.first_wear}`);
                }
                if (dressPrice.dress_extra_rental) {
                    otherOptions.push(`드레스 추가 대여: ${dressPrice.dress_extra_rental}`);
                }

                vendorsMap.set(businessName, {
                    id: `dress-${businessName}`, // 임시 ID (business_name 기반)
                    name: businessName,
                    category: VendorCategory.DRESS,
                    basePrice: minPrice,
                    image: dummyImage,
                    location: dressPrice.location || '위치 정보 없음',
                    distanceKm: 0,
                    addOns: [],
                    otherOptions: otherOptions
                });
            }
        });

        return Array.from(vendorsMap.values());
    } catch (error) {
        console.error('Error fetching dress vendors:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Network error - check if API server is running at:', API_BASE_URL);
        }
        return [];
    }
}

/**
 * 드레스 이미지 URL 생성 (API_BASE_URL 기준)
 */
export function getDressImageUrl(imageUrl: string): string {
    // 이미 전체 URL이면 그대로 반환
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    // 상대 경로면 API_BASE_URL과 결합
    if (imageUrl.startsWith('/')) {
        return `${API_BASE_URL}${imageUrl}`;
    }
    return `${API_BASE_URL}/${imageUrl}`;
}

