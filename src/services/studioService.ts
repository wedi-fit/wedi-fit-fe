import { Vendor, VendorCategory, AddOnOption } from '../types';
import { formatOptionPrice, parseOtherOptions, extractMinPriceFromBasePrice } from '../utils/priceFormatter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wedifit.me';

interface StudioApiResponse {
    id: string;
    business_name: string;
    base_price: string | null;
    manager_assignment: string | null;
    outdoor: string | null;
    night: string | null;
    other_options: string | null;
    location: string | null;
    instagram: string | null;
    phone_number: string | null;
}

/**
 * 스튜디오 목록 조회
 * @param maxBudget 예산 (만원 단위, 선택사항)
 */
export async function fetchStudios(maxBudget?: number): Promise<Vendor[]> {
    try {
        let url = `${API_BASE_URL}/api/v1/studios`;
        if (maxBudget !== undefined && maxBudget > 0) {
            url += `?max_budget=${maxBudget}`;
        }
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch studios: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch studios: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Studios API response:', data);
        const studios: StudioApiResponse[] = data.studios || [];
        console.log(`Found ${studios.length} studios in API response${maxBudget ? ` (예산: ${maxBudget}만원)` : ''}`);

        if (studios.length === 0) {
            console.warn('No studios found in API response');
        }

        const vendors = studios.map(mapStudioToVendor);
        console.log(`Mapped ${vendors.length} studios to vendors, categories:`, vendors.map(v => v.category));
        return vendors;
    } catch (error) {
        console.error('Error fetching studios:', error);
        // 네트워크 에러인 경우 더 자세한 정보 출력
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Network error - check if API server is running at:', API_BASE_URL);
        }
        return [];
    }
}

/**
 * 특정 스튜디오 조회
 */
export async function fetchStudioById(studioId: string): Promise<Vendor | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/studios/${studioId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch studio: ${response.statusText}`);
        }

        const studio: StudioApiResponse = await response.json();
        return mapStudioToVendor(studio);
    } catch (error) {
        console.error(`Error fetching studio ${studioId}:`, error);
        return null;
    }
}

/**
 * API 응답을 Vendor 타입으로 변환
 */
function mapStudioToVendor(studio: StudioApiResponse): Vendor {
    const addOns: AddOnOption[] = [];

    // 담당자지정 옵션
    if (studio.manager_assignment) {
        const priceText = formatOptionPrice(studio.manager_assignment);
        if (priceText) {
            addOns.push({
                id: `manager_${studio.id}`,
                name: '담당자지정',
                priceText
            });
        }
    }

    // 야외 옵션
    if (studio.outdoor) {
        const priceText = formatOptionPrice(studio.outdoor);
        if (priceText) {
            addOns.push({
                id: `outdoor_${studio.id}`,
                name: '야외',
                priceText
            });
        }
    }

    // 야간 옵션
    if (studio.night) {
        const priceText = formatOptionPrice(studio.night);
        if (priceText) {
            addOns.push({
                id: `night_${studio.id}`,
                name: '야간',
                priceText
            });
        }
    }

    // 기타 옵션 파싱
    const otherOptions = parseOtherOptions(studio.other_options);

    // 더미 이미지 (실제 이미지는 추후 추가)
    const dummyImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

    // 백엔드에서 이미 min_price를 제공하므로 사용 (없으면 파싱)
    const minPrice = (studio as any).min_price 
        ? String((studio as any).min_price)
        : extractMinPriceFromBasePrice(studio.base_price);

    return {
        id: studio.id,
        name: studio.business_name,
        category: VendorCategory.STUDIO,
        basePrice: minPrice, // 백엔드에서 제공한 최소 가격 사용
        image: dummyImage,
        location: studio.location || '위치 정보 없음',
        distanceKm: 0, // 거리 계산은 추후 구현
        addOns,
        otherOptions,
        phoneNumber: studio.phone_number || undefined,
        instagram: studio.instagram || undefined
    };
}
