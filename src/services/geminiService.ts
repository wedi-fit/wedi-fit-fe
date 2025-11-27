
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
 * Type result mappings based on user's answers
 */
const TYPE_RESULTS: Record<string, {
    typeName: string;
    description: string;
    tags: string[];
    recommendedVendorCategory: string;
    recommendedDressStyle: string;
}> = {
    'GBCL': {
        typeName: '럭셔리 퀸형',
        description: `"인생에 단 한 번뿐이라면, 완벽해야지."

당신은 결혼식을 하나의 예술작품처럼 생각해요.
예산보다 완성도가 더 중요하고, "내 결혼식은 나의 대표작"이라는 마음으로 모든 걸 주도하죠.
드레스부터 조명, 입장 타이밍까지 디테일 하나 안 놓치는 철두철미한 리더형.
웨딩 플래너보다 더 웨딩을 잘 아는 사람일지도 몰라요.
주변에선 "결혼식 기획자로 전직해도 되겠다"는 말이 나올 정도`,
        tags: ['#완벽주의', '#디테일러버', '#럭셔리웨딩', '#셀프기획형'],
        recommendedVendorCategory: '프리미엄 스튜디오',
        recommendedDressStyle: '클래식 엘레강스 드레스'
    },
    'GBFL': {
        typeName: '여유로운 로맨티스트형',
        description: `"로맨틱한 건 좋아하지만, 준비 스트레스는 싫어."

감성은 풍부하지만 너무 디테일한 부분엔 피로감을 느끼는 타입이에요.
큰 틀은 본인이 정하지만, 세부 조정은 믿을 만한 전문가에게 맡겨요.
"결혼식은 사랑의 축제니까, 즐겨야지!" 하는 여유로운 마인드의 소유자.
트렌드를 놓치지 않으면서도 본인만의 감성적 기준이 분명해요.
결혼식날 긴장보단 설렘과 행복으로 기억되길 원하죠.`,
        tags: ['#감성중시', '#여유로운신부', '#트렌드감각', '#프로위임러'],
        recommendedVendorCategory: '로맨틱 무드 스튜디오',
        recommendedDressStyle: '로맨틱 벨라인 드레스'
    },
    'SPCL': {
        typeName: '가성비 플래너형',
        description: `"예산 안에서 최고를 뽑아내는 게 내 특기야."

현실 감각 200%, 실속과 센스 둘 다 챙기는 스타일이에요.
견적 비교, 리뷰 분석, 계약 조건 확인 — 이 모든 게 당신의 일상 루틴!
하지만 단순히 '싼 게 좋은 게 아니고', '가성비'의 본질을 정확히 아는 사람이에요.
고급스러워 보이지만 가격대는 합리적,
디자인은 세련됐지만 유지비는 덜 드는, 그런 선택지를 귀신같이 찾아내죠 👀
결혼 준비 스트레스도 최소화하고 싶어, 직접 일정표를 짜서 효율적으로 진행해요.`,
        tags: ['#실속형', '#비교분석왕', '#가성비끝판왕', '#현실적로맨티스트'],
        recommendedVendorCategory: '가성비 우수 스튜디오',
        recommendedDressStyle: '클래식 실루엣 드레스'
    },
    'SPML': {
        typeName: '현실형 관리자',
        description: `"효율이 감성보다 중요할 때도 있죠."

당신은 체계와 관리에 강한 '현실형 운영자'예요.
플래너 말보단 본인 기준으로 일정을 정리하고
웨딩홀, 식순, 견적 등 모든 걸 깔끔히 정리해둬야 마음이 편하죠.
실속파 중에서도 현실 감각이 가장 뛰어난 타입이에요.`,
        tags: ['#효율중시', '#관리형신부', '#실용주의', '#안정적웨딩'],
        recommendedVendorCategory: '가성비 우수 스튜디오',
        recommendedDressStyle: '모던 실루엣 드레스'
    },
    'SPFM': {
        typeName: '미니멀 감성형',
        description: `"크게 안 해도 돼, 우리답게 하면 되지."

당신은 결혼식을 '행사'보다 '하루의 추억'으로 생각하는 감성파예요.
크고 화려한 웨딩홀보다는 소규모 프라이빗 웨딩을 선호하죠.
사진은 자연스러워야 하고, 장식은 과하지 않아야 해요.
가족, 친구들과 함께 따뜻한 식사자리처럼 꾸미는 걸 좋아하고,
'결혼식은 본질적으로 둘의 이야기'라는 철학이 확실한 타입이에요.
트렌디함보다 진심이 느껴지는 감성, 보여주기보다 진짜 나다움이 우선!`,
        tags: ['#스몰웨딩', '#감성충만', '#자연주의', '#꾸밈없는사랑'],
        recommendedVendorCategory: '프라이빗 스튜디오',
        recommendedDressStyle: '미니멀 모던 드레스'
    },
    'GBCM': {
        typeName: '트렌드 셀럽형',
        description: `"인스타 감성으로 남기는 결혼식, 내 순간은 곧 콘텐츠!"

유행에 밝고 감각이 예리한 당신은 SNS 감성의 대표주자예요.
야외식, 루프탑, 갤러리 웨딩홀 등 트렌디한 공간을 선호하고
'사진빨 잘 받는' 순간을 정확히 알아요.
결혼식은 사랑의 이벤트이자, 나만의 무대라 생각하죠.
스타일링, 조명, 드레스핏 ~ 모든 게 그림처럼 어우러져야 해요.`,
        tags: ['#트렌드리더', '#SNS감성', '#무드장인', '#감각적연출'],
        recommendedVendorCategory: '트렌디 스튜디오',
        recommendedDressStyle: '모던 실루엣 드레스'
    },
    'GBPF': {
        typeName: '심플 로맨스형',
        description: `"소중한 사람들과 따뜻하게, 그게 내가 원하는 결혼식이야."

당신은 대규모보다는 가까운 사람들과의 진심 어린 웨딩을 꿈꿔요.
결혼식의 본질은 '우리의 마음을 나누는 자리'라 생각하는 타입.
디테일을 직접 챙기기보단, 감각 있는 플래너에게 맡기고
본인은 분위기와 감정선에 집중하는 편이에요.
고급스러운 예식장을 선호하지만, 과한 장식보단 심플하고 포근한 무드를 원해요.`,
        tags: ['#따뜻한웨딩', '#로맨틱무드', '#소규모예식', '#여유로운신부'],
        recommendedVendorCategory: '로맨틱 스튜디오',
        recommendedDressStyle: '심플 엘레강스 드레스'
    },
    'GPCL': {
        typeName: '드라마틱 클래식형',
        description: `"한 장면 한 장면이 영화 같아야 해."

로맨틱 드라마의 주인공 같은 신부상!
클래식한 예식과 웅장한 음악, 감동적인 입장 씬을 상상하는 감성형이에요.
감정선이 풍부하고, 결혼식 자체를 하나의 스토리로 여깁니다.
'결혼식은 사랑의 영화'라는 생각으로, 감동 연출에 진심이에요.`,
        tags: ['#드라마틱웨딩', '#감성폭발', '#클래식무드', '#로맨틱신부'],
        recommendedVendorCategory: '드라마틱 스튜디오',
        recommendedDressStyle: '클래식 엘레강스 드레스'
    },
    'GPCM': {
        typeName: '잔잔한 낭만형',
        description: `"과하지 않아도 괜찮아, 진심만 있으면 돼."

아기자기하고 따뜻한 감성을 가진 타입이에요.
대규모보단 프라이빗한 공간에서 '우리다운 결혼식'을 원하죠.
잔잔한 음악, 따뜻한 조명, 소수 하객 — 그런 무드가 어울려요.
겉보다 속이 더 중요한 낭만주의자 💐`,
        tags: ['#감성신부', '#따뜻한식', '#소규모웨딩', '#우리만의무드'],
        recommendedVendorCategory: '로맨틱 스튜디오',
        recommendedDressStyle: '모던 실루엣 드레스'
    },
    'GPFL': {
        typeName: '프라이빗 내추럴형',
        description: `"우리 둘만의 시간, 작지만 진심으로."

조용하고 따뜻한 분위기를 선호하는 감성파예요.
야외정원, 한적한 스튜디오, 가족 중심의 스몰웨딩이 잘 어울려요.
연출보다 분위기, 꾸밈보다 진심을 중시하고
자연광 아래에서 웃는 사진 한 장이면 충분해요.`,
        tags: ['#자연주의', '#소규모식', '#감성웨딩', '#프라이빗모드'],
        recommendedVendorCategory: '프라이빗 스튜디오',
        recommendedDressStyle: '미니멀 모던 드레스'
    },
    'GPCF': {
        typeName: '드라마틱 클래식형',
        description: `"한 장면 한 장면이 영화 같아야 해."

로맨틱 드라마의 주인공 같은 신부상!
클래식한 예식과 웅장한 음악, 감동적인 입장 씬을 상상하는 감성형이에요.
감정선이 풍부하고, 결혼식 자체를 하나의 스토리로 여깁니다.
'결혼식은 사랑의 영화'라는 생각으로, 감동 연출에 진심이에요.`,
        tags: ['#드라마틱웨딩', '#감성폭발', '#클래식무드', '#로맨틱신부'],
        recommendedVendorCategory: '드라마틱 스튜디오',
        recommendedDressStyle: '클래식 엘레강스 드레스'
    },
    'SPCF': {
        typeName: '현실 감성형',
        description: `"현실적으로 생각하되, 감성은 절대 포기 못해."

이성적 판단과 감성적 욕망 사이에서 완벽한 균형을 잡는 타입이에요.
예산 안에서 최선의 선택을 하고, 형식도 어느 정도 챙기죠.
"가성비 좋은 감성 웨딩"이 바로 당신의 목표!
웨딩홀은 깔끔하고 실속 있게, 드레스는 취향에 맞게 — 밸런스 조절이 탁월해요.`,
        tags: ['#현실감성', '#균형형신부', '#실속감성', '#합리적선택'],
        recommendedVendorCategory: '가성비 감성 스튜디오',
        recommendedDressStyle: '클래식 실루엣 드레스'
    },
    'SPFL': {
        typeName: '가성비 감성파',
        description: `"합리적인데도 감성은 포기 못해."

가성비와 감성을 동시에 잡는 현실 로맨티스트예요.
예산은 철저히 따지지만, '감성 한 스푼'은 꼭 넣고 싶죠.
드레스는 세일 상품이지만 스타일은 완벽하고,
웨딩홀은 실속형이지만 사진은 영화처럼 남기는 타입이에요.
현실과 낭만의 밸런스가 완벽해요.`,
        tags: ['#밸런스형', '#현실로맨스', '#가성비감성', '#센스있는신부'],
        recommendedVendorCategory: '가성비 감성 스튜디오',
        recommendedDressStyle: '미니멀 모던 드레스'
    },
    'GBFM': {
        typeName: '세련된 모던형',
        description: `"규모는 크지만 감각은 미니멀하게."

트렌디하면서도 시크한 결혼식을 꿈꾸는 타입이에요.
큰 웨딩홀에서도 깔끔한 라인과 감각적인 무드를 유지하죠.
'고급스럽지만 과하지 않게' — 바로 당신의 웨딩 철학이에요.
세련된 조명, 모던한 색감, 깔끔한 연출에 진심인 사람.`,
        tags: ['#모던감성', '#감각신부', '#시크웨딩', '#트렌드한스푼'],
        recommendedVendorCategory: '모던 스튜디오',
        recommendedDressStyle: '세련된 모던 드레스'
    },
    'SPCM': {
        typeName: '현실주의 트렌드형',
        description: `"유행은 챙기되, 내 지갑은 소중해."

센스도 있고 계산도 빠른 똑똑한 타입이에요.
요즘 유행하는 트렌드는 파악하되, 예산 안에서 소화해내는 능력이 탁월하죠.
'효율적이면서 감각적인 선택'을 즐기며,
결혼 준비도 마치 프로젝트처럼 체계적으로 접근해요.`,
        tags: ['#트렌드실속형', '#현명한소비자', '#센스만점', '#효율러'],
        recommendedVendorCategory: '트렌디 가성비 스튜디오',
        recommendedDressStyle: '모던 실루엣 드레스'
    },
    'GBCF': {
        typeName: '완벽주의 플래너형',
        description: `"모든 건 내 손 안에 있어야 마음이 놓여."

당신은 디테일을 사랑하는 결혼식 컨트롤타워예요.
드레스 라인, 입장 순서, 음악 볼륨까지 직접 조정하고 싶어하죠.
결혼식은 내 프로젝트, 나는 그 PM!
다소 피곤할 수 있지만, 완성된 결과는 누구보다 훌륭해요.`,
        tags: ['#프로기획자', '#디테일러버', '#셀프웨딩마스터', '#완벽형신부'],
        recommendedVendorCategory: '프리미엄 스튜디오',
        recommendedDressStyle: '클래식 엘레강스 드레스'
    },
    'GPMF': {
        typeName: '세련된 모던형',
        description: `"규모는 크지만 감각은 미니멀하게."

트렌디하면서도 시크한 결혼식을 꿈꾸는 타입이에요.
큰 웨딩홀에서도 깔끔한 라인과 감각적인 무드를 유지하죠.
'고급스럽지만 과하지 않게' — 바로 당신의 웨딩 철학이에요.
세련된 조명, 모던한 색감, 깔끔한 연출에 진심인 사람.`,
        tags: ['#모던감성', '#감각신부', '#시크웨딩', '#트렌드한스푼'],
        recommendedVendorCategory: '모던 스튜디오',
        recommendedDressStyle: '세련된 모던 드레스'
    },
    'SPMF': {
        typeName: '현실주의 트렌드형',
        description: `"유행은 챙기되, 내 지갑은 소중해."

센스도 있고 계산도 빠른 똑똑한 타입이에요.
요즘 유행하는 트렌드는 파악하되, 예산 안에서 소화해내는 능력이 탁월하죠.
'효율적이면서 감각적인 선택'을 즐기며,
결혼 준비도 마치 프로젝트처럼 체계적으로 접근해요.`,
        tags: ['#트렌드실속형', '#현명한소비자', '#센스만점', '#효율러'],
        recommendedVendorCategory: '트렌디 가성비 스튜디오',
        recommendedDressStyle: '모던 실루엣 드레스'
    }
};

/**
 * Entrance style result mappings based on Q6-Q7 answers
 */
const ENTRANCE_STYLE_RESULTS: Record<string, string> = {
    'introvert_emotional': `하객들 앞에서 살짝 긴장되지만, 한 걸음 한 걸음에 마음을 담아 입장하는 타입이에요. 분위기와 감정을 모두 음미하며, 눈빛, 손동작, 드레스 움직임까지 작은 디테일 하나하나 신경 쓰죠. 버진로드는 짧게 잡아 부담을 줄이면서, 스냅사진 위주로 자연스러운 감정을 남기면 가장 예쁜 장면이 나와요.
꿀팁으로는 은은한 조명과 잔잔한 OST를 활용하고, 입장 전에 심호흡 3번 정도로 긴장을 풀면 좋습니다.
하객과 교감보다는 자신의 순간에 집중하면, 사진 속 표정과 포즈가 자연스럽게 살아납니다. 이 타입이라면 "조용하지만 깊이 있는 감성"이 하객에게도 고스란히 전달될 거예요.`,
    'introvert_natural': `하객 앞에서 긴장을 살짝 느끼지만, 마음 편하게 즐기며 입장하고 싶은 타입이에요. 자신과 파트너의 순간에 집중하며, 하객들의 시선에 크게 신경 쓰지 않는 편이죠. 버진로드도 짧게 잡고, 걷는 속도는 자연스럽게 유지하면 부담이 덜합니다.
꿀팁으로는 입장 전 간단히 심호흡을 하고, 미소를 자연스럽게 유지하며 파트너와 눈을 맞추는 것이 좋습니다.
스냅사진은 연출보다 자연스러운 순간을 남기는 게 포인트예요. 긴장보다 편안함이 우선이므로, '즐기는 마음'만 갖고 걸어도 충분히 아름다운 장면을 만들 수 있어요. 이런 타입은 차분함 속에서 나오는 자연스러운 매력이 사진 속에서도 돋보입니다.`,
    'extrovert_emotional': `하객들 앞에서 활짝 웃으며 천천히 입장하는 스타일로, 입장 자체가 하나의 드라마틱한 순간이 됩니다. 한 걸음 한 걸음마다 감정을 담아 연출할 수 있어, OST, 조명, 소품까지 활용하면 마치 영화 속 장면처럼 완벽한 입장이 가능하죠.
꿀팁으로는 하객과 눈을 맞추고 활발하게 교감하며 포토타임도 즐기는 것이 좋습니다.
긴 버진로드도 부담 없이 활용 가능하며, 입장 순간을 최대한 드라마틱하게 연출하면 하객들이 감탄할 거예요. 특히 감성과 활발함이 동시에 있는 타입이라, 입장부터 하객 분위기까지 한 번에 잡을 수 있어요. 사진과 영상 속 장면들이 영화의 한 장면처럼 남을 수 있습니다.`,
    'extrovert_natural': `하객과 활발하게 소통하면서도, 마음 편하게 자연스럽게 입장하는 타입이에요. 긴장보다 에너지를 즐기며 입장 자체를 하객과의 소통 타임으로 바꿀 수 있죠. 버진로드는 길게 설정해도 부담 없이, 자유로운 걸음과 자연스러운 포즈로 걸으면 최적의 장면이 나옵니다.
꿀팁으로는 웃음과 손 흔들기를 적극적으로 활용하고, 걷는 속도를 편안하게 유지하는 것이 좋습니다.
포토타임에서는 자연스럽게 하객을 바라보며 웃고, 분위기를 살리는 것이 중요해요. 활발한 성격 덕분에 입장부터 하객 분위기까지 한 번에 밝게 만들 수 있으며, 사진과 영상 속에서 '밝고 자유로운 신부'의 모습이 생생히 남습니다. 긴장보다 에너지를 즐기는 스타일이라, 결혼식 전체 분위기까지 한층 업시킬 수 있는 타입이에요.`
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

    // Get result from mapping or use default
    const result = TYPE_RESULTS[generatedTypeCode] || {
        typeName: "로맨틱 드리머",
        description: "당신은 감성적인 순간과 클래식한 아름다움을 중요하게 생각합니다. 영화 속 주인공 같은 결혼식을 꿈꾸는 당신에게 딱 맞는 스타일을 추천해요.",
        tags: ["#로맨틱", "#클래식", "#감성충만"],
        recommendedVendorCategory: "따뜻한 색감의 인물 중심 스튜디오",
        recommendedDressStyle: "풍성한 벨라인 드레스"
    };

    // Get entrance style result based on Q6-Q7
    const entranceKey = `${answers.q6_entrance_personality}_${answers.q7_entrance_style}`;
    const entranceStyle = ENTRANCE_STYLE_RESULTS[entranceKey] || '';

    return {
        typeCode: generatedTypeCode,
        typeName: result.typeName,
        description: result.description,
        tags: result.tags,
        recommendedVendorCategory: result.recommendedVendorCategory,
        recommendedDressStyle: result.recommendedDressStyle,
        entranceStyle: entranceStyle
    };
}
