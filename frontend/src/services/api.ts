import type { RFP, Vendor, VendorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response: Response, defaultMessage: string) => {
    if (!response.ok) {
        try {
            const data = await response.json();
            throw new Error(data.message || data.error || defaultMessage);
        } catch (error) {
            // If parsing fails or the error was thrown above
            if (error instanceof Error && error.message !== 'Unexpected end of JSON input') {
                throw error;
            }
            throw new Error(defaultMessage);
        }
    }
    return response.json();
};

export const api = {
    createRFP: async (naturalLanguageDescription: string, forceCreate: boolean = false): Promise<RFP | { isDuplicate: true; existingRFP: RFP }> => {
        const response = await fetch(`${API_BASE_URL}/rfp/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ naturalLanguageDescription, forceCreate })
        });

        if (response.status === 999) {
            const data = await response.json();
            return { isDuplicate: true, existingRFP: data.existingRFP };
        }

        return handleResponse(response, 'Failed to create RFP');
    },

    getAllRFPs: async (): Promise<RFP[]> => {
        const response = await fetch(`${API_BASE_URL}/rfp`);
        const result = await handleResponse(response, 'Failed to fetch RFPs');
        return result.data || result;
    },

    getAllVendors: async (): Promise<Vendor[]> => {
        const response = await fetch(`${API_BASE_URL}/vendor`);
        const result = await handleResponse(response, 'Failed to fetch vendors');
        return result.data || result;
    },

    createVendor: async (vendorData: Partial<Vendor>): Promise<Vendor> => {
        const response = await fetch(`${API_BASE_URL}/vendor/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendorData)
        });
        const result = await handleResponse(response, 'Failed to create vendor');
        return result.data || result;
    },

    deleteVendor: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/vendor/${id}`, {
            method: 'DELETE'
        });
        await handleResponse(response, 'Failed to delete vendor');
    },

    sendRFP: async (rfpId: string, vendorIds: string[]): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/rfp/${rfpId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendorIds })
        });
        await handleResponse(response, 'Failed to send RFP');
    },

    getProposals: async (rfpId: string): Promise<VendorResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/proposals/${rfpId}`);
        return handleResponse(response, 'Failed to fetch proposals');
    },

    getAllProposals: async (): Promise<VendorResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/proposals/inbox`);
        return handleResponse(response, 'Failed to fetch all proposals');
    },

    getComparison: async (rfpId: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/proposals/${rfpId}/comparison`);
        return handleResponse(response, 'Failed to fetch comparison');
    },

    updateRFP: async (id: string, updates: Partial<RFP>): Promise<RFP> => {
        const response = await fetch(`${API_BASE_URL}/rfp/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return handleResponse(response, 'Failed to update RFP');
    },

    updateVendor: async (id: string, updates: Partial<Vendor>): Promise<Vendor> => {
        const response = await fetch(`${API_BASE_URL}/vendor/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const result = await handleResponse(response, 'Failed to update vendor');
        return result.data || result;
    }
};
