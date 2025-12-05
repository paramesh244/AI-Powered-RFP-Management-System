import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Bot, ArrowRight, Loader2, FileText, CheckCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { RFP } from '../types';

export default function NewRFP() {
    const navigate = useNavigate();
    const createRFP = useStore((state) => state.createRFP);
    const updateRFP = useStore((state) => state.updateRFP);
    const isLoading = useStore((state) => state.isLoading);
    const error = useStore((state) => state.error);
    const rfps = useStore((state) => state.rfps);
    const currentRFPId = useStore((state) => state.currentRFPId);

    const [input, setInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [editForm, setEditForm] = useState<Partial<RFP>>({});

    // Find the newly created RFP if we are in preview mode
    const generatedRFP = currentRFPId ? rfps.find(r => r._id === currentRFPId) : null;

    useEffect(() => {
        if (generatedRFP) {
            setEditForm(generatedRFP);
        }
    }, [generatedRFP]);

    const validateInput = (text: string) => {
        if (text.length < 10) return "Please provide more details about your requirements.";
        const gibberishPattern = /(.)\1{4,}/; // Simple check for repeated characters
        if (gibberishPattern.test(text)) return "Please provide valid requirements in plain English.";
        return null;
    };

    const handleGenerate = async () => {
        const validationMsg = validateInput(input);
        if (validationMsg) {
            setValidationError(validationMsg);
            return;
        }
        setValidationError(null);

        if (!input.trim()) return;
        await createRFP(input);
        setShowPreview(true);
    };

    const handleSaveEdit = async () => {
        if (!currentRFPId || !editForm) return;
        await updateRFP(currentRFPId, editForm);
        setIsEditing(false);
    };

    const handleConfirm = () => {
        navigate('/vendors');
    };

    if (showPreview && generatedRFP) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">RFP Generated Successfully</h2>
                                <p className="text-sm text-slate-500">Review the structured data before proceeding.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {generatedRFP.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="p-8 space-y-8">
                        {isEditing ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title || ''}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                                        <input
                                            type="number"
                                            value={editForm.budget || 0}
                                            onChange={e => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Timeline</label>
                                        <input
                                            type="text"
                                            value={editForm.delivery_timeline || ''}
                                            onChange={e => setEditForm({ ...editForm, delivery_timeline: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{generatedRFP.title}</h1>
                                        <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span>Budget: {generatedRFP.currency} {generatedRFP.budget.toLocaleString()}</span>
                                        <span>•</span>
                                        <span>Timeline: {generatedRFP.delivery_timeline}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        Line Items
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-4 py-3">Item Name</th>
                                                    <th className="px-4 py-3">Qty</th>
                                                    <th className="px-4 py-3">Specifications</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {generatedRFP.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                                        <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-slate-500">{item.specifications}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Payment Terms</span>
                                        <p className="mt-1 text-sm font-medium text-slate-700">{generatedRFP.payment_terms}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Warranty Required</span>
                                        <p className="mt-1 text-sm font-medium text-slate-700">{generatedRFP.warranty}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Create New
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            Confirm & Select Vendors
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pt-10">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    What do you need to buy?
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                    Describe your requirements in plain English. Our AI will structure it into a professional RFP automatically.
                </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200">
                <textarea
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        if (validationError) setValidationError(null);
                    }}
                    placeholder="E.g., I need 50 high-end laptops for our engineering team, delivered by next month. Budget is around $100k..."
                    className="w-full h-40 p-4 text-lg bg-transparent border-none resize-none focus:ring-0 placeholder:text-slate-300"
                />
                <div className="flex justify-between items-center px-4 pb-2">
                    <span className="text-xs text-slate-400 font-medium">
                        AI-Powered Parsing
                    </span>
                    <button
                        onClick={handleGenerate}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200",
                            input.trim() && !isLoading
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:scale-105"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Generate RFP
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {(error || validationError) && (
                <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error || validationError}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-8">
                {['Laptops for Engineering', 'Office Furniture', 'Cloud Services'].map((suggestion) => (
                    <button
                        key={suggestion}
                        onClick={() => setInput(prev => prev + (prev ? ' ' : '') + suggestion)}
                        className="p-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}
