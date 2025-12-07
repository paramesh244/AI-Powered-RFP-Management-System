import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

import { Mail, ArrowLeft, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import type { VendorResponse } from '../types';

export default function Inbox() {
    const responses = useStore((state) => state.responses);
    const fetchAllProposals = useStore((state) => state.fetchAllProposals);
    const isLoading = useStore((state) => state.isLoading);
    const navigate = useNavigate();

    const [selectedProposal, setSelectedProposal] = useState<VendorResponse | null>(null);



    useEffect(() => {
        fetchAllProposals();
    }, [fetchAllProposals]);


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p>Loading responses...</p>
            </div>
        );
    }

    if (selectedProposal) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <button onClick={() => setSelectedProposal(null)} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Inbox
                    </button>
                    <div className="text-sm text-slate-500">
                        Received: {selectedProposal.createdAt ? format(new Date(selectedProposal.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Vendor Details */}
                        <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl flex-shrink-0">
                                {selectedProposal.vendorId.name.charAt(0)}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{selectedProposal.vendorId.name}</h1>
                                    <p className="text-slate-500 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {selectedProposal.vendorId.email}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-slate-900 font-medium">{selectedProposal.vendorId.contact_person}</p>
                                    <p className="text-slate-500">{selectedProposal.vendorId.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Terms */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-400 uppercase">Total Price</span>
                                <p className="text-xl font-bold text-slate-900 mt-1">
                                    ₹ {selectedProposal.price?.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-400 uppercase">Delivery</span>
                                <p className="text-lg font-medium text-slate-900 mt-1">{selectedProposal.delivery}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-400 uppercase">Warranty</span>
                                <p className="text-lg font-medium text-slate-900 mt-1">{selectedProposal.warranty}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-400 uppercase">Payment Terms</span>
                                <p className="text-lg font-medium text-slate-900 mt-1">{selectedProposal.payment_terms || selectedProposal.terms || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        {selectedProposal.items && selectedProposal.items.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg">Quoted Items</h3>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 font-semibold text-slate-600">Item Name</th>
                                                <th className="p-4 font-semibold text-slate-600 text-right">Quantity</th>
                                                <th className="p-4 font-semibold text-slate-600 text-right">Unit Price</th>
                                                <th className="p-4 font-semibold text-slate-600 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedProposal.items.map((item, idx) => (
                                                <tr key={item._id || idx}>
                                                    <td className="p-4 text-slate-900 font-medium">{item.name}</td>
                                                    <td className="p-4 text-slate-600 text-right">{item.quantity}</td>
                                                    <td className="p-4 text-slate-600 text-right">
                                                        ₹{item.price.toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-slate-900 font-bold text-right">
                                                        ₹ {(item.quantity * item.price).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Original Email */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="font-bold text-slate-900 text-lg">Original Email Content</h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                                {selectedProposal.raw_email.bodyText || "No email body content available."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleCompare = () => {
        navigate('/dashboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Inbox</h2>
                    <p className="text-slate-500">Manage and compare vendor proposals.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCompare}
                        disabled={responses.length < 2}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                            responses.length >= 2
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <BarChart2 className="w-4 h-4" />
                        Compare Proposals
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {responses.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No proposals received yet.</p>
                        </div>
                    ) : (
                        responses.map((response) => (
                            <div
                                key={response._id}
                                onClick={() => setSelectedProposal(response)}
                                className="group flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {response.vendorId.name.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-3 font-medium text-slate-900 truncate">
                                        {response.vendorId.name}
                                    </div>
                                    <div className="col-span-6 text-slate-600 truncate text-sm">
                                        <span className="font-medium text-slate-900 mr-2">
                                            ₹ {response.price?.toLocaleString()}
                                        </span>
                                        - {response.notes?.substring(0, 60)}...
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-3 text-sm text-slate-400">
                                        <span>{response.createdAt ? format(new Date(response.createdAt), 'MMM d') : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
