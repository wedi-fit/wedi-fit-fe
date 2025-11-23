/**
 * 신체 유형 분석 서비스
 * MediaPipe 기반 BE API와 통신
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface BodyTypeMeasurements {
    shoulder_width: number;
    waist_width: number;
    hip_width: number;
    shr: number;  // Shoulder-Hip Ratio
    whr: number;  // Waist-Hip Ratio
}

export interface BodyTypeAnalysisResult {
    success: boolean;
    body_type?: string;
    body_type_key?: string;
    confidence?: number;
    measurements?: BodyTypeMeasurements;
    analysis?: string;
    recommended_silhouettes?: string[];
    avoid_silhouettes?: string[];
    visualization_image_url?: string;
    error?: string;
}

/**
 * 전신 사진을 분석하여 신체 유형을 반환합니다.
 * @param imageFile 전신 사진 파일
 * @returns 신체 유형 분석 결과
 */
export async function analyzeBodyTypeFromImage(imageFile: File): Promise<BodyTypeAnalysisResult> {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${API_BASE_URL}/api/v1/analyze-body-type`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: BodyTypeAnalysisResult = await response.json();
        return result;
    } catch (error) {
        console.error('신체 유형 분석 실패:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        };
    }
}

/**
 * 이미지 합성 요청
 * @param userImageFile 사용자 전신 사진
 * @param dressIds 선택한 드레스 ID 목록
 * @returns 합성 결과
 */
export async function createCompositeImages(userImageFile: File, dressIds: string[]): Promise<any> {
    try {
        const formData = new FormData();
        formData.append('user_image', userImageFile);
        formData.append('dress_ids', JSON.stringify(dressIds));

        const response = await fetch(`${API_BASE_URL}/api/v1/composite`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('이미지 합성 실패:', error);
        throw error;
    }
}
