export type RFPStatus = 'draft' | 'generated' | 'sent' | 'responses_received' | 'completed';

export interface RFPItem {
    _id?: string;
    name: string;
    quantity: number;
    specifications: string;
}

export interface RFP {
    _id: string;
    title: string;
    description: string;
    items: RFPItem[];
    budget: number;
    currency: string;
    delivery_timeline: string;
    payment_terms: string;
    warranty: string;
    status: RFPStatus;
    createdAt?: string;
    selectedVendorId?: string;
}

export interface Vendor {
    _id: string;
    name: string;
    email: string;
    contact_person: string;
    phone: string;
    notes?: string;
    rating?: number; 
    tags?: string[]; 
}

export interface VendorResponse {
    payment_terms: string;
    notes: any;
    _id: string;
    rfpId: string;
    vendorId: Vendor; 
    price: number | null;
    delivery: string;
    warranty: string;
    terms: string;
    raw_email: {
        bodyText?: string;
    };
    items?: {
        name: string;
        quantity: number;
        price: number;
        _id?: string;
    }[];
    createdAt: string;
    aiScore?: number;
    matchStatus?: 'high' | 'medium' | 'low'; 
}

export interface ComparisonProposal {
    vendorId: string;
    vendorName: string;
    price: number;
    delivery: string;
    warranty: string;
    notes?: string;
}

export interface ComparisonAnalysis {
    rankings: {
        vendorId: string;
        score: number;
        summary: string;
    }[];
    recommended: {
        vendorId: string;
        reason: string;
    };
    savings: number;
}

export interface ComparisonResponse {
    proposals: ComparisonProposal[];
    analysis: ComparisonAnalysis;
}
