import React, { useMemo } from 'react';
import { ShoppingBag, ChevronUp } from 'lucide-react';
import { CartItem } from '../types';

interface BottomBudgetBarProps {
    cart: CartItem[];
}

export const BottomBudgetBar: React.FC<BottomBudgetBarProps> = ({ cart }) => {
    const totalBudget = useMemo(() => {
        return cart.reduce((total, item) => {
            let itemTotal = item.vendor.price;
            item.selectedAddOns.forEach(addOnId => {
                const addOn = item.vendor.addOns.find(a => a.id === addOnId);
                if (addOn) itemTotal += addOn.price;
            });
            return total + itemTotal;
        }, 0);
    }, [cart]);

    const itemCount = cart.length;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 safe-area-pb">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                
                {/* Cart Summary */}
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-800">
                            <ShoppingBag size={24} />
                        </div>
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide">Estimated Budget</p>
                        <div className="flex items-baseline space-x-1">
                             <span className="text-2xl font-bold text-emerald-900">
                                ${totalBudget.toLocaleString()}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Mobile Price View */}
                <div className="sm:hidden text-right mr-4">
                     <span className="text-xl font-bold text-emerald-900">
                        ${totalBudget.toLocaleString()}
                     </span>
                </div>

                {/* Action */}
                <button className="bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-900 transition shadow-lg flex items-center space-x-2">
                    <span>Checkout</span>
                    <ChevronUp size={16} />
                </button>
            </div>
        </div>
    );
};