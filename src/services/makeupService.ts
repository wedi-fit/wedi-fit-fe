import { Vendor, VendorCategory } from '../types';
import { formatPrice, parseOtherOptions, extractMinPriceFromBasePrice } from '../utils/priceFormatter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wedifit.me';

interface MakeupPriceApiResponse {
    id: string;
    business_name: string;
    product_composition: string | null;
    base_price: string | null;
    designated_fee: string | null;
    other_options: string | null;
}

export interface MakeupProduct {
    id: string;
    product_composition: string;
    base_price: string;
    designated_fee: string | null;
    other_options: string[];
}

/**
 * 메이크업 업체 목록 조회
 * @param maxBudget 예산 (만원 단위, 선택사항)
 */
export async function fetchMakeupVendors(maxBudget?: number): Promise<Vendor[]> {
    try {
        let url = `${API_BASE_URL}/api/v1/makeup-prices`;
        if (maxBudget !== undefined && maxBudget > 0) {
            url += `?max_budget=${maxBudget}`;
        }
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch makeup vendors: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch makeup vendors: ${response.statusText}`);
        }

        const data = await response.json();
        const makeupPrices: MakeupPriceApiResponse[] = data.makeup_prices || data.makeups || [];
        console.log(`Found ${makeupPrices.length} makeup vendors in API response${maxBudget ? ` (예산: ${maxBudget}만원)` : ''}`);

        // business_name으로 그룹화 (백엔드에서 이미 중복 제거했지만 안전을 위해)
        const vendorsMap = new Map<string, Vendor>();
        
        makeupPrices.forEach(makeupPrice => {
            const businessName = makeupPrice.business_name;
            
            if (!vendorsMap.has(businessName)) {
                // 백엔드에서 이미 min_price를 제공하므로 사용 (없으면 파싱)
                const minPrice = (makeupPrice as any).min_price 
                    ? String((makeupPrice as any).min_price)
                    : extractMinPriceFromBasePrice(makeupPrice.base_price);
                
                // 더미 이미지
                const dummyImage = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80';

                vendorsMap.set(businessName, {
                    id: `makeup-${businessName}`, // 임시 ID (business_name 기반)
                    name: businessName,
                    category: VendorCategory.MAKEUP,
                    basePrice: minPrice, // 백엔드에서 제공한 최소 가격 사용
                    image: dummyImage,
                    location: '위치 정보 없음',
                    distanceKm: 0,
                    addOns: [],
                    otherOptions: []
                });
            }
        });

        return Array.from(vendorsMap.values());
    } catch (error) {
        console.error('Error fetching makeup vendors:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Network error - check if API server is running at:', API_BASE_URL);
        }
        return [];
    }
}

/**
 * 특정 메이크업 업체의 상세 정보 조회 (business_name 기준)
 */
export async function fetchMakeupVendorDetails(businessName: string): Promise<MakeupProduct[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/makeup-prices`);

        if (!response.ok) {
            throw new Error(`Failed to fetch makeup vendor details: ${response.statusText}`);
        }

        const data = await response.json();
        const makeupPrices: MakeupPriceApiResponse[] = data.makeup_prices || [];

        // 해당 business_name의 모든 상품구성 반환
        return makeupPrices
            .filter(mp => mp.business_name === businessName)
            .map(mp => ({
                id: mp.id,
                product_composition: mp.product_composition || '',
                base_price: mp.base_price || '',
                designated_fee: mp.designated_fee,
                other_options: parseOtherOptions(mp.other_options)
            }));
    } catch (error) {
        console.error(`Error fetching makeup vendor details for ${businessName}:`, error);
        return [];
    }
}


