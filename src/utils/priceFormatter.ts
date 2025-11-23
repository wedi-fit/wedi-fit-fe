/**
 * 가격 문자열을 포맷팅하는 유틸리티 함수
 *
 * 예시:
 * - "130" -> "1,300,000 원"
 * - "130~140" -> "1,300,000~1,400,000 원"
 * - "11" -> "110,000 원"
 * - "11~33" -> "110,000~330,000 원"
 */
export function formatPrice(priceStr: string | null | undefined): string {
    if (!priceStr || priceStr.trim() === '') {
        return '';
    }

    // 범위 형태인지 확인 (예: "130~140")
    if (priceStr.includes('~')) {
        const [minPrice, maxPrice] = priceStr.split('~').map(p => p.trim());
        const formattedMin = formatSinglePrice(minPrice);
        const formattedMax = formatSinglePrice(maxPrice);

        if (!formattedMin || !formattedMax) {
            return '';
        }

        return `${formattedMin}~${formattedMax} 원`;
    }

    // 단일 가격인 경우
    const formatted = formatSinglePrice(priceStr);
    return formatted ? `${formatted} 원` : '';
}

/**
 * 범위 가격에서 최소값만 포맷팅하는 함수
 *
 * 예시:
 * - "130" -> "1,300,000 원"
 * - "130~140" -> "1,300,000 원" (최소값만)
 */
export function formatMinPrice(priceStr: string | null | undefined): string {
    if (!priceStr || priceStr.trim() === '') {
        return '';
    }

    // 범위 형태인 경우 최소값만 추출
    const minPrice = priceStr.includes('~')
        ? priceStr.split('~')[0].trim()
        : priceStr.trim();

    const formatted = formatSinglePrice(minPrice);
    return formatted ? `${formatted} 원` : '';
}

/**
 * 단일 가격 문자열을 숫자로 변환하여 포맷팅
 * "130" -> "1,300,000"
 * "11" -> "110,000"
 */
function formatSinglePrice(priceStr: string): string {
    const price = parseInt(priceStr, 10);

    if (isNaN(price)) {
        return '';
    }

    // 10,000을 곱하여 실제 가격으로 변환
    const actualPrice = price * 10000;

    // 천 단위 콤마 추가
    return actualPrice.toLocaleString('ko-KR');
}

/**
 * 추가 옵션 가격 포맷팅 (옵션값이 단일값 또는 범위일 수 있음)
 *
 * 예시:
 * - "11" -> "110,000 원"
 * - null/undefined -> null (옵션이 없는 경우)
 */
export function formatOptionPrice(priceStr: string | null | undefined): string | null {
    if (!priceStr || priceStr.trim() === '') {
        return null;
    }

    return formatPrice(priceStr);
}

/**
 * 기타 옵션 문자열을 배열로 파싱
 * 세미콜론(;)으로 구분된 문자열을 배열로 변환
 *
 * 예시:
 * - "옵션1;옵션2;옵션3" -> ["옵션1", "옵션2", "옵션3"]
 */
export function parseOtherOptions(optionsStr: string | null | undefined): string[] {
    if (!optionsStr || optionsStr.trim() === '') {
        return [];
    }

    return optionsStr
        .split(';')
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
}
