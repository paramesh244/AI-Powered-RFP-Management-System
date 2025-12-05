import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Search, Mail, CheckSquare, Square, Send, Plus, Trash2, X, User, Tag, Phone, Edit2, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Vendor } from '../types';

export default function Vendors() {
    const navigate = useNavigate();
    const vendors = useStore((state) => state.vendors);
    const addVendor = useStore((state) => state.addVendor);
    const updateVendor = useStore((state) => state.updateVendor);
    const removeVendor = useStore((state) => state.removeVendor);
    const fetchVendors = useStore((state) => state.fetchVendors);
    const currentRFPId = useStore((state) => state.currentRFPId);
    const sendRFP = useStore((state) => state.sendRFP);
    const error = useStore((state) => state.error);

    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    // Form State
    const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({
        name: '',
        email: '',
        contact_person: '',
        phone: '',
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const toggleVendor = (id: string) => {
        if (!currentRFPId) return; // Only allow selection when sending RFP
        setSelectedVendors(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const handleSendRFP = async () => {
        if (!currentRFPId) return;

        setIsSending(true);
        await sendRFP(currentRFPId, selectedVendors);
        setIsSending(false);

        // Only navigate if no error
        if (!useStore.getState().error) {
            navigate('/inbox');
        }
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorForm.name || !vendorForm.email) return;

        await addVendor(vendorForm);
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleUpdateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVendor || !vendorForm.name || !vendorForm.email) return;

        await updateVendor(editingVendor._id, vendorForm);
        setIsEditModalOpen(false);
        setEditingVendor(null);
        resetForm();
    };

    const resetForm = () => {
        setVendorForm({ name: '', email: '', contact_person: '', phone: '', tags: [] });
        setTagInput('');
    };

    const openEditModal = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setVendorForm({
            name: vendor.name,
            email: vendor.email,
            contact_person: vendor.contact_person,
            phone: vendor.phone,
            tags: vendor.tags || []
        });
        setIsEditModalOpen(true);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            setVendorForm(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setVendorForm(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleDeleteVendor = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this vendor?')) {
            await removeVendor(id);
            setSelectedVendors(prev => prev.filter(v => v !== id));
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Vendor Management</h2>
                    <p className="text-slate-500">Manage your vendor master list and select recipients.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vendor
                    </button>

                    {currentRFPId && (
                        <div className="flex items-center gap-2">
                            {error && (
                                <button
                                    onClick={handleSendRFP}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Retry
                                </button>
                            )}
                            <button
                                onClick={handleSendRFP}
                                disabled={selectedVendors.length === 0 || isSending}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
                                    selectedVendors.length > 0 && !isSending
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSending ? 'Sending...' : 'Send RFP'}
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search vendors by name or tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVendors.map((vendor) => {
                    const isSelected = selectedVendors.includes(vendor._id);
                    return (
                        <div
                            key={vendor._id}
                            onClick={() => toggleVendor(vendor._id)}
                            className={cn(
                                "group relative p-4 rounded-xl border transition-all hover:shadow-md",
                                isSelected
                                    ? "bg-indigo-50 border-indigo-200"
                                    : "bg-white border-slate-200 hover:border-indigo-200",
                                currentRFPId && "cursor-pointer"
                            )}
                        >
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditModal(vendor); }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                    title="Edit Vendor"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteVendor(e, vendor._id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Vendor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {currentRFPId && (
                                    <div className="text-indigo-600 ml-1">
                                        {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-slate-300 group-hover:text-indigo-300" />}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                                    {vendor.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Mail className="w-3 h-3" />
                                            {vendor.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <User className="w-3 h-3" />
                                            {vendor.contact_person || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Phone className="w-3 h-3" />
                                            {vendor.phone || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {vendor.tags?.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Vendor Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-semibold text-slate-900">
                                {isEditModalOpen ? 'Edit Vendor' : 'Add New Vendor'}
                            </h3>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={isEditModalOpen ? handleUpdateVendor : handleAddVendor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={vendorForm.name}
                                        onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Acme Corp"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={vendorForm.email}
                                        onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="sales@acme.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    value={vendorForm.contact_person}
                                    onChange={e => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="John Smith"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={vendorForm.phone}
                                        onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Press Enter to add)</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Electronics, Services..."
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {vendorForm.tags?.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                >
                                    {isEditModalOpen ? 'Update Vendor' : 'Add Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
