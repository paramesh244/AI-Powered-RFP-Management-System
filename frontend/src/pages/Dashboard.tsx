import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Award, TrendingUp, DollarSign, Calendar, ShieldCheck, ArrowRight, FileText, Clock, Info, Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
// import { combine } from 'zustand/middleware';

export default function Dashboard() {
    const rfps = useStore((state) => state.rfps);
    const currentRFPId = useStore((state) => state.currentRFPId);
    const setCurrentRFPId = useStore((state) => state.setCurrentRFPId);
    const fetchRFPs = useStore((state) => state.fetchRFPs);
    const fetchProposals = useStore((state) => state.fetchProposals);
    const fetchComparison = useStore((state) => state.getComparison);
    const comparison = useStore((state) => state.comparison);
    const responses = useStore((state) => state.responses);
    const isAnalyzing = useStore((state) => state.isAnalyzing);

    useEffect(() => {
        fetchRFPs();
    }, [fetchRFPs]);

    const [loadingStep, setLoadingStep] = useState(0);
    const loadingMessages = [
        "Fetching vendor proposals...",
        "Extracting key data points...",
        "Comparing pricing models...",
        "Generating AI recommendations..."
    ];

    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
            }, 800);
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isAnalyzing]);

    useEffect(() => {
        if (currentRFPId) {
            fetchComparison(currentRFPId);
            fetchProposals(currentRFPId);
        }
    }, [currentRFPId, fetchComparison, fetchProposals]);

    const handleSelectRFP = (id: string) => {
        setCurrentRFPId(id);
    };

    const currentRFP = rfps.find(r => r._id === currentRFPId);


    if (!currentRFPId || !currentRFP) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                    <p className="text-slate-500">Select an RFP to view insights and comparisons.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rfps.map((rfp) => (
                        <div
                            key={rfp._id}
                            onClick={() => handleSelectRFP(rfp._id)}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                    rfp.status === 'completed' ? "bg-green-100 text-green-700" :
                                        rfp.status === 'sent' ? "bg-blue-100 text-blue-700" :
                                            "bg-slate-100 text-slate-700"
                                )}>
                                    {rfp.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 h-12">
                                {rfp.title || "Untitled RFP"}
                            </h3>

                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{rfp.createdAt ? format(new Date(rfp.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Budget: ${rfp.budget?.toLocaleString() || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
                                View Analysis <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    ))}

                    {rfps.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-500">No RFPs found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detail View (Comparison)

    const recommendedVendorId = comparison?.analysis.recommended.vendorId;
    const recommendedProposal = comparison?.proposals.find(p => p.vendorId === recommendedVendorId);
    const recommendedReason = comparison?.analysis.recommended.reason;
    const totalSavings = comparison?.analysis.savings;

    // Check for single proposal from either comparison or direct responses
    const singleProposal = comparison?.proposals.length === 1
        ? comparison.proposals[0]
        : responses.length === 1
            ? {
                vendorName: responses[0].vendorId.name,
                price: responses[0].price || 0,
                delivery: responses[0].delivery,
                warranty: responses[0].warranty,
                notes: typeof responses[0].notes === 'string' ? responses[0].notes : 'No notes provided.'
            }
            : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => setCurrentRFPId(null)}
                        className="text-sm text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1"
                    >
                        ← Back to all RFPs
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">{currentRFP.title || "RFP Analysis"}</h2>
                    <p className="text-slate-500">AI-driven analysis of vendor proposals.</p>
                </div>
            </div>

            {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in duration-500">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">AI Analysis in Progress</h3>
                        <p className="text-slate-500 animate-pulse">{loadingMessages[loadingStep]}</p>
                    </div>
                </div>
            ) : (!comparison || comparison.proposals.length === 0) && responses.length !== 1 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <h3 className="text-lg font-medium text-slate-900">No Analysis Available</h3>
                    <p className="text-slate-500">Waiting for vendors to submit their proposals or analysis is pending.</p>
                </div>
            ) : singleProposal ? (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-blue-800">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Single Proposal Received
                        </h3>
                        <p>Only one vendor has submitted a proposal. Comparison requires at least two proposals.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-xl text-slate-900">{singleProposal.vendorName}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span className="text-sm text-slate-500 block mb-1">Total Price</span>
                                <span className="text-lg font-medium">₹ {singleProposal.price.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500 block mb-1">Delivery Timeline</span>
                                <span className="text-lg font-medium">{singleProposal.delivery}</span>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500 block mb-1">Warranty</span>
                                <span className="text-lg font-medium">{singleProposal.warranty}</span>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <span className="text-sm text-slate-500 block mb-1">Notes</span>
                                <p className="text-slate-700">{singleProposal.notes || 'No notes provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Recommended</p>
                                    <p className="text-lg font-bold text-slate-900">{recommendedProposal?.vendorName}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{recommendedReason}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Potential Savings</p>
                                    <p className="text-lg font-bold text-slate-900">₹ {totalSavings?.toLocaleString()}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">Compared to average bid</p>
                        </div>
                    </div>

                    {/* If no recommendation */}
                    {(!recommendedVendorId || recommendedVendorId === "None") && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                No Clear Recommendation
                            </h3>
                            <p>{recommendedReason || "AI could not determine a suitable vendor based on the current proposals."}</p>
                        </div>
                    )}



                    {/* Comparison Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-slate-500 w-1/4 sticky left-0 bg-slate-50 z-10">Metric</th>
                                        {comparison?.proposals.map(proposal => (
                                            <th key={proposal.vendorId} className="p-4 font-semibold text-slate-900 min-w-[200px]">
                                                {proposal.vendorName}
                                                {proposal.vendorId === recommendedVendorId && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Best Match
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium sticky left-0 bg-white z-10">
                                            <DollarSign className="w-4 h-4" /> Total Price
                                        </td>
                                        {comparison?.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 font-medium">
                                                ₹ {proposal.price?.toLocaleString() || 'N/A'}
                                                {comparison.analysis.savings > 0 && proposal.vendorId === recommendedVendorId && (
                                                    <span className="ml-2 text-xs text-green-600 font-normal">
                                                        (Save ₹ {comparison.analysis.savings.toLocaleString()})
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium sticky left-0 bg-white z-10">
                                            <Calendar className="w-4 h-4" /> Delivery
                                        </td>
                                        {comparison?.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 text-slate-600">
                                                {proposal.delivery}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium sticky left-0 bg-white z-10">
                                            <ShieldCheck className="w-4 h-4" /> Warranty
                                        </td>
                                        {comparison?.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 text-slate-600">
                                                {proposal.warranty}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium sticky left-0 bg-white z-10">
                                            <FileText className="w-4 h-4" /> Notes
                                        </td>
                                        {comparison?.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 text-slate-600 text-sm">
                                                {proposal.notes || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium sticky left-0 bg-white z-10">
                                            <TrendingUp className="w-4 h-4" /> AI Score
                                        </td>
                                        {comparison?.proposals.map(proposal => {
                                            const score = comparison.analysis.rankings.find(r => r.vendorId === proposal.vendorId)?.score;
                                            return (
                                                <td key={proposal.vendorId} className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                                            <div
                                                                className={cn(
                                                                    "h-full rounded-full",
                                                                    (score || 0) >= 8 ? "bg-green-500" :
                                                                        (score || 0) >= 6 ? "bg-yellow-500" : "bg-red-500"
                                                                )}
                                                                style={{ width: `${(score || 0) * 10}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-slate-900">{score || 'N/A'}</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
