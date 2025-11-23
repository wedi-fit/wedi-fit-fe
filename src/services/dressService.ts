import { Vendor, VendorCategory, AddOnOption } from '../types';
import { formatOptionPrice, parseOtherOptions, extractMinPriceFromBasePrice } from '../utils/priceFormatter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Dress {
    id: string;
    name: string;
    style: string;
    filename: string;
    imageUrl: string;
}

interface StylesApiResponse {
    styles?: Dress[];
    dresses?: Dress[];
    total: number;
    message: string;
}

interface DressPriceApiResponse {
    id: string;
    business_name: string;
    base_price: string | null;
    dress_helper: string | null;
    design_extra_fee: string | null;
    first_wear: string | null;
    dress_extra_rental: string | null;
    location?: string | null;
    instagram?: string | null;
    phone_number?: string | null;
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
        console.log('Dress vendors API response:', data);
        
        const dressPrices: DressPriceApiResponse[] = data.dress_prices || data.dresses || [];
        console.log(`Found ${dressPrices.length} dress vendors`);

        if (dressPrices.length === 0) {
            console.warn('No dress vendors found in API response');
        }

        return dressPrices.map(mapDressPriceToVendor);
    } catch (error) {
        console.error('Error fetching dress vendors:', error);
        // 네트워크 에러인 경우 더 자세한 정보 출력
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Network error - check if API server is running at:', API_BASE_URL);
        }
        return [];
    }
}

/**
 * 특정 드레스 업체 조회
 */
export async function fetchDressVendorById(dressId: string): Promise<Vendor | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dress-prices/${dressId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch dress vendor: ${response.statusText}`);
        }

        const dressPrice: DressPriceApiResponse = await response.json();
        return mapDressPriceToVendor(dressPrice);
    } catch (error) {
        console.error(`Error fetching dress vendor ${dressId}:`, error);
        return null;
    }
}

/**
 * API 응답을 Vendor 타입으로 변환
 */
function mapDressPriceToVendor(dressPrice: DressPriceApiResponse): Vendor {
    // base_price에서 최소 가격 추출
    const minPrice = extractMinPriceFromBasePrice(dressPrice.base_price);
    
    // 더미 이미지 (실제 이미지는 추후 추가)
    const dummyImage = 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80';

    return {
        id: dressPrice.id,
        name: dressPrice.business_name,
        category: VendorCategory.DRESS,
        basePrice: minPrice, // 최소 가격만 저장 (리스트 표시용)
        image: dummyImage,
        location: dressPrice.location || '위치 정보 없음',
        distanceKm: 0, // 거리 계산은 추후 구현
        addOns: [], // 드레스는 addOns 대신 상세 정보를 모달에서 표시
        otherOptions: [], // 드레스는 otherOptions 사용 안 함
        phoneNumber: dressPrice.phone_number || undefined,
        instagram: dressPrice.instagram || undefined,
        // 드레스 전용 필드들을 저장하기 위해 확장된 타입이 필요할 수 있지만,
        // 일단 Vendor 타입에 맞춰서 반환하고, 모달에서 별도로 API 호출
    };
}

