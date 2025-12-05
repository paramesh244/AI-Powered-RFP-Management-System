import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Award, TrendingUp, DollarSign, Calendar, ShieldCheck, Check, ArrowRight, FileText, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
// import { combine } from 'zustand/middleware';

export default function Dashboard() {
    const rfps = useStore((state) => state.rfps);
    const currentRFPId = useStore((state) => state.currentRFPId);
    const setCurrentRFPId = useStore((state) => state.setCurrentRFPId);
    const fetchRFPs = useStore((state) => state.fetchRFPs);
    // const fetchProposals = useStore((state) => state.fetchProposals);
    const fetchComparison = useStore((state) => state.getComparison);
    const comparison = useStore((state) => state.comparison);
    const isLoading = useStore((state) => state.isLoading);

    useEffect(() => {
        fetchRFPs();
    }, [fetchRFPs]);

    const handleSelectRFP = (id: string) => {
        setCurrentRFPId(id);
        // fetchProposals(id);
        fetchComparison(id);
    };

    const currentRFP = rfps.find(r => r._id === currentRFPId);

    // If no RFP is selected or we want to see the list, we can show the list.
    // However, the requirement implies we should be able to navigate.
    // Let's use a two-column layout if screen is wide, or just a list if no RFP selected.
    // For simplicity and better UX on small screens, let's do:
    // If !currentRFPId -> Show List
    // If currentRFPId -> Show Detail (with back button to list)

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

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p>Analyzing proposals...</p>
                </div>
            ) : !comparison || comparison.proposals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <h3 className="text-lg font-medium text-slate-900">No Analysis Available</h3>
                    <p className="text-slate-500">Waiting for vendors to submit their proposals or analysis is pending.</p>
                </div>
            ) : (
                <>
                    {/* Recommendation Card */}
                    {recommendedVendorId && recommendedVendorId !== "None" && (
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-6 h-6 text-yellow-300" />
                                    <span className="font-bold tracking-wider text-sm uppercase text-indigo-100">AI Recommendation</span>
                                </div>

                                <h3 className="text-3xl font-bold mb-2">
                                    {recommendedProposal?.vendorName || recommendedVendorId} is the best match
                                </h3>
                                <p className="text-indigo-100 max-w-2xl text-lg mb-6">
                                    {recommendedReason}
                                </p>

                                <div className="flex items-center gap-6">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <span className="block text-xs text-indigo-200 uppercase">Score</span>
                                        <span className="text-2xl font-bold">
                                            {comparison.analysis.rankings.find(r => r.vendorId === recommendedVendorId)?.score || 'N/A'}/10
                                        </span>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <span className="block text-xs text-indigo-200 uppercase">Savings</span>
                                        <span className="text-2xl font-bold">
                                            ₹ {totalSavings?.toLocaleString() || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-slate-500 w-1/4">Metric</th>
                                        {comparison.proposals.map(proposal => (
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
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium">
                                            <DollarSign className="w-4 h-4" /> Total Price
                                        </td>
                                        {comparison.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 font-bold text-slate-900">
                                                ₹ {proposal.price?.toLocaleString() || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium">
                                            <Calendar className="w-4 h-4" /> Delivery
                                        </td>
                                        {comparison.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 text-slate-700">
                                                {proposal.delivery}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium">
                                            <ShieldCheck className="w-4 h-4" /> Warranty
                                        </td>
                                        {comparison.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 text-slate-700">
                                                {proposal.warranty}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 flex items-center gap-2 text-slate-600 font-medium">
                                            <TrendingUp className="w-4 h-4" /> AI Score
                                        </td>
                                        {comparison.proposals.map(proposal => {
                                            const score = comparison.analysis.rankings.find(r => r.vendorId === proposal.vendorId)?.score || 0;
                                            return (
                                                <td key={proposal.vendorId} className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                                            <div
                                                                className={cn(
                                                                    "h-full rounded-full",
                                                                    score >= 8 ? "bg-green-500" :
                                                                        score >= 5 ? "bg-blue-500" : "bg-amber-500"
                                                                )}
                                                                style={{ width: `${score * 10}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-medium text-slate-700">{score}/10</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td className="p-4 text-slate-600 font-medium align-top pt-6">Action</td>
                                        {comparison.proposals.map(proposal => (
                                            <td key={proposal.vendorId} className="p-4 align-top pt-6">
                                                <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                                    <Check className="w-4 h-4" />
                                                    Select Vendor
                                                </button>
                                            </td>
                                        ))}
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
