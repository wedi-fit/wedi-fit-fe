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
 * "1.3" -> "13,000" (소수점 포함)
 * "5.5" -> "55,000"
 * "10" -> "100,000"
 */
function formatSinglePrice(priceStr: string): string {
    // 소수점이 있는 경우와 없는 경우 모두 처리
    const price = parseFloat(priceStr);

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

/**
 * base_price 문자열에서 모든 숫자를 추출하여 가장 작은 숫자를 반환
 * 2-3자리 숫자를 찾아서 최소값을 반환
 *
 * 예시:
 * - "본식 250~280;촬영 190~250;촬영+본식 280~370" -> "190"
 * - "250~280" -> "250"
 * - "190" -> "190"
 */
export function extractMinPriceFromBasePrice(basePrice: string | null | undefined): string {
    if (!basePrice || basePrice.trim() === '') {
        return '0';
    }

    // 2-3자리 숫자를 모두 찾기 (정규표현식: \d{2,3})
    const numbers = basePrice.match(/\d{2,3}/g);
    
    if (!numbers || numbers.length === 0) {
        return '0';
    }

    // 숫자 배열을 숫자로 변환하여 최소값 찾기
    const minNumber = Math.min(...numbers.map(num => parseInt(num, 10)));
    
    return minNumber.toString();
}

/**
 * 가격 문자열에서 숫자를 찾아서 포맷팅된 가격으로 변환
 * 텍스트와 숫자가 섞여있는 경우 숫자만 포맷팅
 * 소수점 포함 숫자도 처리 (예: "1.3", "5.5")
 *
 * 예시:
 * - "25" -> "250,000 원"
 * - "100" -> "1,000,000 원"
 * - "1.3" -> "13,000 원"
 * - "5.5" -> "55,000 원"
 * - "10" -> "100,000 원"
 * - "본식 250~280" -> "본식 2,500,000~2,800,000 원"
 * - "추가비용 50" -> "추가비용 500,000 원"
 */
export function formatPriceInText(text: string | null | undefined): string {
    if (!text || text.trim() === '') {
        return '';
    }

    // 숫자 패턴 찾기 (소수점 포함, 1-4자리 숫자, 범위 포함)
    // 예: "1.3", "5.5", "10", "250~280"
    const pricePattern = /(\d+\.?\d*)(?:~(\d+\.?\d*))?/g;
    
    return text.replace(pricePattern, (match, minPrice, maxPrice) => {
        const formattedMin = formatSinglePrice(minPrice);
        if (!formattedMin) return match; // 포맷팅 실패 시 원본 반환
        
        if (maxPrice) {
            const formattedMax = formatSinglePrice(maxPrice);
            if (!formattedMax) return match;
            return `${formattedMin}~${formattedMax} 원`;
        }
        return `${formattedMin} 원`;
    });
}

/**
 * basePrice 문자열에서 최소 가격을 만원 단위 숫자로 추출
 * 예산과 비교하기 위해 사용
 * extractMinPriceFromBasePrice와 동일한 로직 사용
 *
 * 예시:
 * - "110" -> 110 (110만원)
 * - "130" -> 130 (130만원)
 * - "130~140" -> 130
 * - "본식 250~280;촬영 190~250" -> 190 (가장 작은 값)
 * - "110만원" -> 110
 *
 * @param basePrice basePrice 문자열 (만원 단위)
 * @returns 만원 단위 숫자 (비교 불가능한 경우 0)
 */
export function getMinPriceInManwon(basePrice: string | null | undefined): number {
    if (!basePrice || basePrice.trim() === '') {
        return 0;
    }

    const trimmed = basePrice.trim();
    
    // 먼저 순수 숫자만 있는 경우 (예: "110", "130")
    const pureNumber = /^\d+$/.test(trimmed);
    if (pureNumber) {
        const num = parseInt(trimmed, 10);
        // 1자리 숫자는 만원 단위가 아닐 수 있으므로, 2자리 이상만 처리
        if (num >= 10 && num <= 9999) {
            return num;
        }
    }

    // 범위 형식 (예: "110~120", "130~140")
    const rangeMatch = trimmed.match(/^(\d+)~(\d+)$/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        return Math.min(min, max);
    }

    // 복잡한 형식 (예: "본식 250~280;촬영 190~250")
    // 2-4자리 숫자를 모두 찾기 (만원 단위는 보통 2-4자리)
    const numbers = trimmed.match(/\d{2,4}/g);
    
    if (!numbers || numbers.length === 0) {
        // 2-4자리 숫자가 없으면 1자리 이상 숫자 찾기 (마지막 시도)
        const anyNumbers = trimmed.match(/\d+/g);
        if (anyNumbers && anyNumbers.length > 0) {
            const nums = anyNumbers.map(num => parseInt(num, 10)).filter(n => n >= 10);
            if (nums.length > 0) {
                return Math.min(...nums);
            }
        }
        return 0;
    }

    // 숫자 배열을 숫자로 변환하여 최소값 찾기
    const minNumber = Math.min(...numbers.map(num => parseInt(num, 10)));
    
    return minNumber;
}

/**
 * 업체의 basePrice가 예산 범위 내에 있는지 확인
 * 예산의 100%까지만 허용 (예산을 초과하지 않는 업체만)
 *
 * @param basePrice 업체의 basePrice 문자열 (만원 단위)
 * @param budget 예산 (만원 단위)
 * @returns 예산 범위 내에 있으면 true
 */
export function isWithinBudget(basePrice: string | null | undefined, budget: number): boolean {
    if (!budget || budget <= 0) {
        return true; // 예산이 설정되지 않았으면 모든 업체 표시
    }

    if (!basePrice || basePrice.trim() === '' || basePrice === '0') {
        return false; // 가격 정보가 없으면 제외 (명시적으로 가격이 없는 경우)
    }

    const minPrice = getMinPriceInManwon(basePrice);
    
    // 디버깅 로그 (항상 출력하여 문제 파악)
    console.log(`[예산 체크] basePrice: "${basePrice}" -> 추출된 최소가격: ${minPrice}만원, 예산: ${budget}만원`);
    
    if (minPrice === 0) {
        console.warn(`[예산 체크] 가격을 추출할 수 없음: "${basePrice}"`);
        return false; // 가격을 추출할 수 없으면 제외
    }

    // 예산을 초과하지 않는 업체만 허용 (예산의 100%까지만)
    const isWithin = minPrice <= budget;
    
    console.log(`[예산 체크] ${isWithin ? '✅ 포함' : '❌ 제외'} - 최소가격: ${minPrice}만원, 예산: ${budget}만원`);
    
    return isWithin;
}
