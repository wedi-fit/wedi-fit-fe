
import React, { useState } from 'react';
import { Header } from './components/Header';
import { SideWidget } from './components/SideWidget';
import { VendorModal } from './components/VendorModal';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { MoodTest } from './pages/MoodTest';
import { VirtualFitting } from './pages/VirtualFitting';
import { MySchedule } from './pages/MySchedule';
import { Contract } from './pages/Contract';
import { PageView, UserState, Vendor, CartItem, MoodTestResult, BudgetInfo } from './types';
import { MOCK_CHECKLIST } from './constants';

const App: React.FC = () => {
    // App State - Initial Page is LANDING
    const [currentPage, setCurrentPage] = useState<PageView>('LANDING');
    const [user, setUser] = useState<UserState>({
        isLoggedIn: false
    });
    
    // Global Mood Result State
    const [moodResult, setMoodResult] = useState<MoodTestResult | null>(null);

    // Budget State (from MoodTest Step 3)
    const [budget, setBudget] = useState<BudgetInfo | null>(null);

    // Cart/Budget State
    const [cart, setCart] = useState<CartItem[]>([]);

    // Modal State
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handlers
    const handleLoginToggle = () => {
        setUser(prev => ({
            ...prev,
            isLoggedIn: !prev.isLoggedIn,
            name: !prev.isLoggedIn ? 'Jane Doe' : undefined,
            weddingDate: !prev.isLoggedIn ? '2024-12-25' : undefined
        }));
    };

    const handleVendorClick = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleUpdateCart = (vendorId: string, addOnIds: string[]) => {
        if (!selectedVendor) return;

        setCart(prevCart => {
            // Check if vendor already in cart
            const existingIndex = prevCart.findIndex(item => item.vendor.id === vendorId);
            
            if (existingIndex >= 0) {
                // Update existing
                const newCart = [...prevCart];
                if (addOnIds.length === 0) {
                     newCart[existingIndex].selectedAddOns = addOnIds;
                } else {
                     newCart[existingIndex].selectedAddOns = addOnIds;
                }
                return newCart;
            } else {
                // Add new
                return [...prevCart, { vendor: selectedVendor, selectedAddOns: addOnIds }];
            }
        });
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'LANDING':
                return <Landing onStart={() => setCurrentPage('HOME')} />;
            case 'HOME':
                return <Home 
                    user={user} 
                    moodResult={moodResult}
                    budget={budget}
                    onVendorClick={handleVendorClick} 
                    onNavigate={setCurrentPage}
                />;
            case 'MOOD_TEST':
                return <MoodTest 
                    onComplete={(result, budgetInfo) => {
                        setMoodResult(result);
                        setBudget(budgetInfo);
                    }} 
                    onNavigate={setCurrentPage}
                    onVendorClick={handleVendorClick}
                />;
            case 'VIRTUAL_FITTING':
                return <VirtualFitting moodResult={moodResult} />;
            case 'MY_SCHEDULE':
                return <MySchedule />;
            case 'CONTRACT':
                return <Contract />;
            default:
                return <Landing onStart={() => setCurrentPage('HOME')} />;
        }
    };

    const isLanding = currentPage === 'LANDING';

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            {!isLanding && (
                <Header 
                    user={user} 
                    onNavigate={setCurrentPage} 
                    onLoginToggle={handleLoginToggle} 
                />
            )}
            
            {/* Sticky Widget (Only on Schedule and not on Landing/Home) */}
            {!isLanding && currentPage === 'MY_SCHEDULE' && (
                <SideWidget 
                    weddingDate={user.weddingDate}
                    checklist={MOCK_CHECKLIST}
                    onNavigate={setCurrentPage}
                />
            )}

            <main className="flex-1">
                {renderPage()}
            </main>

            <VendorModal 
                vendor={selectedVendor}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cart={cart}
                onUpdateCart={handleUpdateCart}
                onNavigate={setCurrentPage}
            />
        </div>
    );
};

export default App;
