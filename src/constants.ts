
import { Vendor, VendorCategory, ScheduleEvent, ChecklistItem } from './types';

export const MOCK_VENDORS: Vendor[] = [
    {
        id: 'v1',
        name: '루미에르 스튜디오 (Lumiere)',
        category: VendorCategory.STUDIO,
        price: 2500000,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        description: '자연광을 활용한 따뜻하고 감성적인 인물 중심 촬영 스튜디오입니다. 강남 논현동에 위치하여 프라이빗한 촬영이 가능합니다.',
        rating: 4.8,
        location: '서울 강남구 논현동',
        distanceKm: 5.2,
        addOns: [
            { id: 'opt1', name: '야간 씬 추가 (로드씬 포함)', price: 330000 },
            { id: 'opt2', name: '대표 작가 지정 촬영', price: 550000 },
            { id: 'opt3', name: '앨범 페이지 추가 (10p)', price: 220000 }
        ]
    },
    {
        id: 'v2',
        name: '그레이스 켈리 브라이드',
        category: VendorCategory.DRESS,
        price: 3800000,
        image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
        description: '유럽 왕실의 우아함을 담은 하이엔드 수입 드레스 편집샵입니다. 실크와 레이스 디테일이 살아있는 프리미엄 라인을 만나보세요.',
        rating: 4.9,
        location: '서울 강남구 청담동', // Display logic will hide this
        distanceKm: 3.1,
        addOns: [
            { id: 'opt4', name: '블랙 라벨 업그레이드', price: 880000 },
            { id: 'opt5', name: '2부 애프터 드레스', price: 440000 },
            { id: 'opt6', name: '프리미엄 베일 & 악세사리', price: 220000 }
        ]
    },
    {
        id: 'v3',
        name: '퓨어 뷰티 (Pure Beauty)',
        category: VendorCategory.MAKEUP,
        price: 880000,
        image: 'https://images.unsplash.com/photo-1487412947132-232a8b92167d?auto=format&fit=crop&w=800&q=80',
        description: '투명하고 맑은 피부 표현과 자연스러운 음영 메이크업의 정석. 신부님의 본연의 아름다움을 가장 돋보이게 합니다.',
        rating: 4.5,
        location: '서울 마포구 서교동', // Display logic will hide this
        distanceKm: 12.5,
        addOns: [
            { id: 'opt7', name: '신랑 헤어&메이크업 추가', price: 165000 },
            { id: 'opt8', name: '혼주(여) 메이크업', price: 220000 },
            { id: 'opt9', name: '얼리 스타트 비용 (6시 이전)', price: 110000 }
        ]
    },
    {
        id: 'v4',
        name: '어반 프레임 (Urban Frame)',
        category: VendorCategory.STUDIO,
        price: 1980000,
        image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
        description: '도심 속 시크하고 모던한 무드의 웨딩 촬영. 세련된 색감과 과감한 구도로 화보 같은 웨딩 사진을 완성합니다.',
        rating: 4.7,
        location: '서울 성동구 성수동',
        distanceKm: 8.4,
        addOns: [
            { id: 'opt10', name: '원본 데이터 USB 구매', price: 330000 },
            { id: 'opt11', name: '대형 액자 업그레이드', price: 165000 }
        ]
    },
    {
        id: 'v5',
        name: '실크 앤 레이스 (Silk & Lace)',
        category: VendorCategory.DRESS,
        price: 1500000,
        image: 'https://images.unsplash.com/photo-1546193430-c2d207739ed7?auto=format&fit=crop&w=800&q=80',
        description: '합리적인 가격대의 미니멀하고 사랑스러운 디자인 드레스. 스몰 웨딩과 야외 예식에 최적화된 가벼운 드레스가 많습니다.',
        rating: 4.6,
        location: '서울 강남구 신사동', // Display logic will hide this
        distanceKm: 4.0,
        addOns: [
            { id: 'opt12', name: '피팅비 면제 (당일 계약 시)', price: 55000 },
            { id: 'opt13', name: '촬영용 볼레로 추가 대여', price: 110000 }
        ]
    }
];

export const MOCK_EVENTS: ScheduleEvent[] = [
    { id: 'e1', date: '2024-05-15', title: '드레스 투어', type: 'fitting' },
    { id: 'e2', date: '2024-06-01', title: '스튜디오 촬영', type: 'filming' },
    { id: 'e3', date: '2024-08-20', title: '본식 (Wedding Day)', type: 'ceremony' },
];

export const MOCK_CHECKLIST: ChecklistItem[] = [
    { id: 'c1', task: '웨딩홀 예약하기', dueDate: '2023-12-01', completed: true },
    { id: 'c2', task: '스드메 업체 선정 (S/D/M)', dueDate: '2024-01-15', completed: false },
    { id: 'c3', task: '예물/예단 준비', dueDate: '2024-03-01', completed: false },
    { id: 'c4', task: '청첩장 모임 갖기', dueDate: '2024-06-01', completed: false },
];
