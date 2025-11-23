
import React, { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Star, MessageCircle, FileText, CheckCircle } from 'lucide-react';
import { Vendor, CartItem, PageView, VendorCategory } from '../types';

interface VendorModalProps {
    vendor: Vendor | null;
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateCart: (vendorId: string, addOnIds: string[]) => void;
    onNavigate: (page: PageView) => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ 
    vendor, isOpen, onClose, cart, onUpdateCart, onNavigate 
}) => {
    // 1. All Hooks must be called unconditionally at the top level
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

    // Sync local state with global cart when modal opens
    useEffect(() => {
        if (vendor && isOpen) {
            const cartItem = cart.find(item => item.vendor.id === vendor.id);
            setSelectedAddOns(cartItem ? cartItem.selectedAddOns : []);
        }
    }, [vendor, isOpen, cart]);

    const currentSubTotal = useMemo(() => {
        if (!vendor) return 0;
        let total = vendor.price;
        selectedAddOns.forEach(id => {
            const opt = vendor.addOns.find(a => a.id === id);
            if (opt) total += opt.price;
        });
        return total;
    }, [vendor, selectedAddOns]);

    // 2. Helper functions
    const toggleAddOn = (id: string) => {
        if (!vendor) return;
        const newSelection = selectedAddOns.includes(id)
            ? selectedAddOns.filter(a => a !== id)
            : [...selectedAddOns, id];
        
        setSelectedAddOns(newSelection);
        onUpdateCart(vendor.id, newSelection);
    };

    // 3. Conditional rendering comes LAST (after all hooks)
    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Image */}
                <div className="h-64 w-full relative bg-stone-200">
                    <img 
                        src={vendor.image} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover"
                    />
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                    >
                        <X size={20} className="text-stone-800" />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                         <div className="inline-block px-2 py-1 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide mb-2">
                            {vendor.category}
                         </div>
                         <h2 className="text-3xl font-serif font-bold text-white">{vendor.name}</h2>
                         <div className="flex items-center text-stone-200 text-sm mt-1 space-x-4">
                             {/* Only show location for Studio */}
                             {vendor.category === VendorCategory.STUDIO && (
                                <span className="flex items-center"><MapPin size={14} className="mr-1 text-emerald-400"/> {vendor.location}</span>
                             )}
                             <span className="flex items-center text-yellow-400"><Star size={14} className="mr-1 fill-current"/> {vendor.rating}</span>
                         </div>
                    </div>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
                    <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-6">
                        <h3 className="font-bold text-stone-800 mb-3 text-lg">업체 소개</h3>
                        <p className="text-stone-600 leading-relaxed">
                            {vendor.description}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold text-stone-800 text-lg">추가 옵션 선택</h3>
                             <span className="text-xs text-stone-400">선택 시 예상 견적에 자동 합산됩니다.</span>
                        </div>
                       
                        <div className="space-y-3">
                            {vendor.addOns.map(option => (
                                <label 
                                    key={option.id} 
                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                                    ${selectedAddOns.includes(option.id) 
                                        ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAddOns.includes(option.id) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-stone-300'}`}>
                                            {selectedAddOns.includes(option.id) && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={selectedAddOns.includes(option.id)}
                                            onChange={() => toggleAddOn(option.id)}
                                        />
                                        <span className={`font-medium ${selectedAddOns.includes(option.id) ? 'text-emerald-900' : 'text-stone-700'}`}>
                                            {option.name}
                                        </span>
                                    </div>
                                    <span className="text-stone-600 font-bold">+ {option.price.toLocaleString()}원</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex space-x-2 w-full sm:w-auto">
                        <button 
                            onClick={() => { onClose(); onNavigate('CHAT'); }}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 font-medium text-sm transition"
                        >
                            <MessageCircle size={18} />
                            <span>1:1 문의하기</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-end bg-stone-50 px-4 py-2 rounded-lg sm:bg-transparent sm:p-0">
                        <div className="text-right w-full sm:w-auto">
                            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">총 예상 견적 (Sub-total)</p>
                            <p className="text-2xl font-bold text-emerald-900">{currentSubTotal.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
