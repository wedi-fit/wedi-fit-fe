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

