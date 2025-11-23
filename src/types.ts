
export enum VendorCategory {
    STUDIO = 'Studio',
    DRESS = 'Dress',
    MAKEUP = 'Makeup'
}

export interface AddOnOption {
    id: string;
    name: string;
    priceText: string; // 포맷된 가격 문자열 (예: "110,000 원" 또는 "110,000~330,000 원")
}

export interface Vendor {
    id: string;
    name: string;
    category: VendorCategory;
    basePrice: string; // 기본 가격 원본 문자열 (예: "130" 또는 "130~140")
    image: string;
    location: string;
    distanceKm: number;
    addOns: AddOnOption[]; // 추가 옵션 (담당자지정, 야외, 야간)
    otherOptions: string[]; // 기타 옵션 (세미콜론으로 구분된 내용)
    phoneNumber?: string; // 전화번호 (studio_prices 테이블의 phone_number)
    instagram?: string; // 인스타그램 계정명
}

export interface CartItem {
    vendor: Vendor;
    selectedAddOns: string[]; // IDs of selected add-ons
}

export interface ScheduleEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'filming' | 'fitting' | 'meeting' | 'ceremony';
}

export interface ChecklistItem {
    id: string;
    task: string;
    dueDate: string;
    completed: boolean;
}

export type PageView = 
    | 'LANDING'
    | 'HOME' 
    | 'MOOD_TEST' 
    | 'VIRTUAL_FITTING' 
    | 'MY_SCHEDULE' 
    | 'CONTRACT';

export interface UserState {
    isLoggedIn: boolean;
    name?: string;
    weddingDate?: string;
}

// Updated Types for Mood Test
export interface MoodTestAnswers {
    // Page 1: Decision Style
    q1_photo_budget: 'emotional' | 'practical';
    q2_guest_count: 'large' | 'private';
    q3_style: 'classic' | 'modern';
    q4_prep_style: 'lead' | 'delegate';
    
    // Page 2: Mood (Array of image IDs)
    q5_moods: string[];

    // Page 3: Budget (Revised - Granular Control)
    budget_studio: number;
    budget_dress: number;
    budget_makeup: number;
}

export interface MoodTestResult {
    typeCode: string; // e.g. "GBCL"
    typeName: string; // e.g. "Luxury Queen"
    description: string;
    tags: string[];
    recommendedVendorCategory: string;
    recommendedDressStyle: string;
}
