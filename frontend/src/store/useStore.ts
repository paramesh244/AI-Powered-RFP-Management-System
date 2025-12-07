import { create } from 'zustand';
import type { RFP, Vendor, VendorResponse, ComparisonResponse } from '../types';
import { api } from '../services/api';

interface AppState {
    // Data
    rfps: RFP[];
    vendors: Vendor[];
    responses: VendorResponse[];
    isLoading: boolean;
    isAnalyzing: boolean;
    error: string | null;

    // Actions
    fetchVendors: () => Promise<void>;
    createRFP: (description: string, forceCreate?: boolean) => Promise<void>;
    addVendor: (vendor: Partial<Vendor>) => Promise<void>;
    removeVendor: (id: string) => Promise<void>;
    sendRFP: (rfpId: string, vendorIds: string[]) => Promise<void>;
    fetchRFPs: () => Promise<void>;

    // Legacy/UI Actions (to be updated or kept)
    addResponse: (response: VendorResponse) => void;
    updateRFP: (id: string, updates: Partial<RFP>) => Promise<void>;
    updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;

    // Current Selection (for UI)
    currentRFPId: string | null;
    setCurrentRFPId: (id: string | null) => void;
    fetchProposals: (rfpId: string) => Promise<void>;
    fetchAllProposals: () => Promise<void>;
    getComparison: (rfpId: string) => Promise<void>;
    clearError: () => void;
    comparison: ComparisonResponse | null;
    duplicateRFP: RFP | null;
    clearDuplicateRFP: () => void;
}

export const useStore = create<AppState>((set) => ({
    rfps: [],
    vendors: [],
    responses: [],
    isLoading: false,
    isAnalyzing: false,
    error: null,
    currentRFPId: null,
    comparison: null,
    duplicateRFP: null,

    fetchVendors: async () => {
        set({ isLoading: true, error: null });
        try {
            const vendors = await api.getAllVendors();
            set({ vendors, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchRFPs: async () => {
        set({ isLoading: true, error: null });
        try {
            const rfps = await api.getAllRFPs();
            set({ rfps, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    createRFP: async (description: string, forceCreate: boolean = false) => {
        set({ isLoading: true, error: null, duplicateRFP: null });
        try {
            const result = await api.createRFP(description, forceCreate);

            if ('isDuplicate' in result && result.isDuplicate) {
                set({ duplicateRFP: result.existingRFP, isLoading: false });
                return;
            }

            const newRFP = result as RFP;
            // Ensure status is set if not returned by API
            const rfpWithStatus = { ...newRFP, status: 'generated' as const };
            set((state) => ({
                rfps: [...state.rfps, rfpWithStatus],
                currentRFPId: newRFP._id,
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addVendor: async (vendorData) => {
        set({ isLoading: true, error: null });
        try {
            const newVendor = await api.createVendor(vendorData);
            set((state) => ({
                vendors: [...state.vendors, newVendor],
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    removeVendor: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteVendor(id);
            set((state) => ({
                vendors: state.vendors.filter((v) => v._id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    sendRFP: async (rfpId: string, vendorIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
            await api.sendRFP(rfpId, vendorIds);
            set((state) => ({
                rfps: state.rfps.map(r => r._id === rfpId ? { ...r, status: 'sent' } : r),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchProposals: async (rfpId: string) => {
        set({ isLoading: true, error: null });
        try {
            const responses = await api.getProposals(rfpId);
            set({ responses, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchAllProposals: async () => {
        set({ isLoading: true, error: null });
        try {
            const responses = await api.getAllProposals();
            set({ responses, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    getComparison: async (rfpId: string) => {
        set({ isAnalyzing: true, error: null, comparison: null }); // Clear previous comparison
        try {
            const comparison = await api.getComparison(rfpId);
            set({ comparison, isAnalyzing: false });
        } catch (error) {
            set({ error: (error as Error).message, isAnalyzing: false });
        }
    },

    updateRFP: async (id: string, updates: Partial<RFP>) => {
        set({ isLoading: true, error: null });
        try {
            const updatedRFP = await api.updateRFP(id, updates);
            set((state) => ({
                rfps: state.rfps.map((rfp) => (rfp._id === id ? { ...rfp, ...updatedRFP, status: rfp.status } : rfp)),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateVendor: async (id: string, updates: Partial<Vendor>) => {
        set({ isLoading: true, error: null });
        try {
            const updatedVendor = await api.updateVendor(id, updates);
            set((state) => ({
                vendors: state.vendors.map((v) => (v._id === id ? updatedVendor : v)),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addResponse: (response) => set((state) => ({ responses: [...state.responses, response] })),

    setCurrentRFPId: (id) => set({ currentRFPId: id }),
    clearError: () => set({ error: null }),
    clearDuplicateRFP: () => set({ duplicateRFP: null }),
}));
