
import { GoogleGenAI, Type } from "@google/genai";
import { MoodTestAnswers } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const callGemini = async () => {
        const totalBudget = answers.budget_studio + answers.budget_dress + answers.budget_makeup;
        
        // Construct the 4-letter code based on logic provided by user
        // Q1: emotional -> G, practical -> S
        const letter1 = answers.q1_photo_budget === 'emotional' ? 'G' : 'S';
        // Q2: large -> B, private -> P
        const letter2 = answers.q2_guest_count === 'large' ? 'B' : 'P';
        // Q3: classic -> C, modern -> M
        const letter3 = answers.q3_style === 'classic' ? 'C' : 'M';
        // Q4: lead -> L, delegate -> F
        const letter4 = answers.q4_prep_style === 'lead' ? 'L' : 'F';

        const generatedTypeCode = `${letter1}${letter2}${letter3}${letter4}`;

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
        return FALLBACK_MOOD_RESULT;
    }
}
