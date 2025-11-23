
import { MoodTestAnswers } from "../types";

// Always use dummy data (Gemini API is not used in frontend for security reasons)

/**
 * Analyzes body type based on an image description.
 */
export const analyzeBodyType = async (imageDescription: string) => {
  // Always return dummy data (Gemini API is not used in frontend for security reasons)
  return {
    bodyType: "모래시계형",
    analysis: "균형잡힌 상체와 하체 비율로 다양한 스타일의 드레스가 잘 어울립니다. 허리라인이 강조되는 실루엣이 특히 아름답게 표현됩니다.",
    recommendedSilhouettes: ["머메이드", "A라인", "볼가운"],
    avoidSilhouettes: ["엠파이어", "시스 드레스"]
  };
};

/**
 * Analyzes the user's wedding preferences (Personality, Mood, Budget).
 */
export const analyzeMoodFull = async (answers: MoodTestAnswers) => {
    // Generate type code based on answers
    const letter1 = answers.q1_photo_budget === 'emotional' ? 'G' : 'S';
    const letter2 = answers.q2_guest_count === 'large' ? 'B' : 'P';
    const letter3 = answers.q3_style === 'classic' ? 'C' : 'M';
    const letter4 = answers.q4_prep_style === 'lead' ? 'L' : 'F';
    const generatedTypeCode = `${letter1}${letter2}${letter3}${letter4}`;

    // Always return dummy data (Gemini API is not used in frontend for security reasons)
    return {
        typeCode: generatedTypeCode,
        typeName: "로맨틱 드리머",
        description: "당신은 감성적인 순간과 클래식한 아름다움을 중요하게 생각합니다. 영화 속 주인공 같은 결혼식을 꿈꾸는 당신에게 딱 맞는 스타일을 추천해요.",
        tags: ["#로맨틱", "#클래식", "#감성충만"],
        recommendedVendorCategory: "따뜻한 색감의 인물 중심 스튜디오",
        recommendedDressStyle: "풍성한 벨라인 드레스"
    };
}
