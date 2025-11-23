
import { GoogleGenAI, Type } from "@google/genai";
import { MoodTestAnswers } from "../types";

// Initialize Gemini Client (only if API key is available)
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const USE_DUMMY_DATA = !API_KEY; // Use dummy data if no API key
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const FALLBACK_MOOD_RESULT = {
    typeCode: "GBCL",
    typeName: "로맨틱 드리머",
    description: "당신은 감성적인 순간과 클래식한 아름다움을 중요하게 생각합니다. 영화 속 주인공 같은 결혼식을 꿈꾸는 당신에게 딱 맞는 스타일을 추천해요.",
    tags: ["#로맨틱", "#클래식", "#감성충만"],
    recommendedVendorCategory: "따뜻한 색감의 인물 중심 스튜디오",
    recommendedDressStyle: "풍성한 벨라인 드레스"
};

const TIMEOUT_MS = 10000; // 10 seconds max wait time

/**
 * Analyzes body type based on an image description.
 */
export const analyzeBodyType = async (imageDescription: string) => {
  // Return dummy data if no API key
  if (USE_DUMMY_DATA || !ai) {
    return {
      bodyType: "모래시계형",
      analysis: "균형잡힌 상체와 하체 비율로 다양한 스타일의 드레스가 잘 어울립니다. 허리라인이 강조되는 실루엣이 특히 아름답게 표현됩니다.",
      recommendedSilhouettes: ["머메이드", "A라인", "볼가운"],
      avoidSilhouettes: ["엠파이어", "시스 드레스"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following body type description for a wedding dress fitting and provide recommendations in Korean.
      Description: ${imageDescription}

      Return the response in JSON format with the following schema:
      {
        "bodyType": "string (e.g. 모래시계형, 직사각형)",
        "analysis": "string (2-3 sentences explaining the features in Korean)",
        "recommendedSilhouettes": ["string (e.g. 머메이드)", "string"],
        "avoidSilhouettes": ["string (e.g. 엠파이어)", "string"]
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                bodyType: { type: Type.STRING },
                analysis: { type: Type.STRING },
                recommendedSilhouettes: { type: Type.ARRAY, items: { type: Type.STRING } },
                avoidSilhouettes: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
        bodyType: "분석 실패",
        analysis: "이미지를 분석할 수 없습니다. 다시 시도해주세요.",
        recommendedSilhouettes: [],
        avoidSilhouettes: []
    };
  }
};

/**
 * Analyzes the user's wedding preferences (Personality, Mood, Budget).
 * Includes a timeout race to prevent infinite loading.
 */
export const analyzeMoodFull = async (answers: MoodTestAnswers) => {
    // Generate type code based on answers
    const letter1 = answers.q1_photo_budget === 'emotional' ? 'G' : 'S';
    const letter2 = answers.q2_guest_count === 'large' ? 'B' : 'P';
    const letter3 = answers.q3_style === 'classic' ? 'C' : 'M';
    const letter4 = answers.q4_prep_style === 'lead' ? 'L' : 'F';
    const generatedTypeCode = `${letter1}${letter2}${letter3}${letter4}`;

    // Return dummy data if no API key
    if (USE_DUMMY_DATA || !ai) {
        return {
            typeCode: generatedTypeCode,
            typeName: "로맨틱 드리머",
            description: "당신은 감성적인 순간과 클래식한 아름다움을 중요하게 생각합니다. 영화 속 주인공 같은 결혼식을 꿈꾸는 당신에게 딱 맞는 스타일을 추천해요.",
            tags: ["#로맨틱", "#클래식", "#감성충만"],
            recommendedVendorCategory: "따뜻한 색감의 인물 중심 스튜디오",
            recommendedDressStyle: "풍성한 벨라인 드레스"
        };
    }

    const callGemini = async () => {
        const totalBudget = answers.budget_studio + answers.budget_dress + answers.budget_makeup;

        const prompt = `
        Analyze the user's wedding preferences based on these survey answers (Korean Input):

        User's Derived Type Code: ${generatedTypeCode}
        (G=Emotional/S=Practical, B=Big/P=Private, C=Classic/M=Modern, L=Lead/F=Follow)

        1. Decision Style: Photo Budget(${answers.q1_photo_budget}), Guests(${answers.q2_guest_count}), Style(${answers.q3_style}), Prep(${answers.q4_prep_style})
        2. Preferred Moods (Image Keywords): ${answers.q5_moods.join(', ')}
        3. Budget: Total(${totalBudget} man-won), Studio(${answers.budget_studio}), Dress(${answers.budget_dress}), Makeup(${answers.budget_makeup})

        Based on the Type Code "${generatedTypeCode}" and the details above, create a creative persona name and description.

        IMPORTANT:
        - The "typeCode" in the JSON MUST be exactly "${generatedTypeCode}".
        - Return all text fields (typeName, description, recommendedVendorCategory, recommendedDressStyle) in KOREAN.

        Return JSON format:
        {
            "typeCode": "string (Must be ${generatedTypeCode})",
            "typeName": "string (Creative Persona Name in Korean, e.g., 럭셔리 퀸, 실속파 스마트 예신)",
            "description": "string (Korean, polite and engaging tone describing their wedding style based on the code)",
            "tags": ["string (Korean hashtag)", "string", "string"],
            "recommendedVendorCategory": "string (Korean, e.g., 인물 중심 스튜디오)",
            "recommendedDressStyle": "string (Korean, e.g., 실크 머메이드)"
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        typeCode: { type: Type.STRING },
                        typeName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendedVendorCategory: { type: Type.STRING },
                        recommendedDressStyle: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    };

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini Request Timeout")), TIMEOUT_MS)
    );

    try {
        // Race between the API call and the timeout
        const result = await Promise.race([callGemini(), timeoutPromise]);
        return result;
    } catch (error) {
        console.error("Gemini Mood Analysis Error or Timeout:", error);
        // Return fallback data on error or timeout so the UI doesn't hang
        return {
            typeCode: generatedTypeCode,
            typeName: "로맨틱 드리머",
            description: "당신은 감성적인 순간과 클래식한 아름다움을 중요하게 생각합니다. 영화 속 주인공 같은 결혼식을 꿈꾸는 당신에게 딱 맞는 스타일을 추천해요.",
            tags: ["#로맨틱", "#클래식", "#감성충만"],
            recommendedVendorCategory: "따뜻한 색감의 인물 중심 스튜디오",
            recommendedDressStyle: "풍성한 벨라인 드레스"
        };
    }
}
