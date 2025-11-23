
export enum VendorCategory {
    STUDIO = 'Studio',
    DRESS = 'Dress',
    MAKEUP = 'Makeup'
}

export interface AddOnOption {
    id: string;
    name: string;
    price: number;
}

export interface Vendor {
    id: string;
    name: string;
    category: VendorCategory;
    price: number;
    image: string;
    description: string;
    rating: number;
    location: string; // simplified distance logic
    distanceKm: number;
    addOns: AddOnOption[];
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
    | 'CONTRACT' 
    | 'CHAT';

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
