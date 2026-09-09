import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateQuotation } from './pages/CreateQuotation';
import { QuotationList } from './pages/QuotationList';
import { CreateReceipt } from './pages/CreateReceipt';
import { ReceiptList } from './pages/ReceiptList';
import { CustomerVehicle } from './pages/CustomerVehicle';
import { ActivityLog } from './pages/ActivityLog';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Brands } from './pages/Brands';
import { Branches } from './pages/Branches';
import { Settings } from './pages/Settings';
import type { Quotation, Receipt } from './types';
import { LanguageProvider } from './context/LanguageContext';

import { StorageService } from './services/storageService';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [convertedQuotation, setConvertedQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    StorageService.syncFromMongoDB();
  }, []);

  useEffect(() => {
    if (activeTab !== 'quotation-create') setEditingQuotation(null);
    if (activeTab !== 'receipt-create') setEditingReceipt(null);
  }, [activeTab]);

  if (!currentUser) {
    return <Login />;
  }

  const handleToggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  const handleConvertToReceipt = (quotation: Quotation) => {
    setConvertedQuotation(quotation);
    setEditingReceipt(null);
    setActiveTab('receipt-create');
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setActiveTab('quotation-create');
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setConvertedQuotation(null);
    setEditingReceipt(receipt);
    setActiveTab('receipt-create');
  };

  const handleViewQuotation = (_quotation?: Quotation) => {
    setActiveTab('quotation-all');
  };

  const handleViewReceipt = (_receipt?: Receipt) => {
    setActiveTab('receipt-all');
  };

  const isAdmin = currentUser?.role === 'Admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onViewQuotation={handleViewQuotation}
            onViewReceipt={handleViewReceipt}
            onSelectTab={setActiveTab}
          />
        );
      case 'quotation-create':
        return (
          <CreateQuotation
            key={editingQuotation?.id || 'new-quotation'}
            editingQuotation={editingQuotation}
            onSaved={() => {
              setEditingQuotation(null);
              setActiveTab('quotation-all');
            }}
            onConvertToReceipt={handleConvertToReceipt}
          />
        );
      case 'quotation-my':
        return (
          <QuotationList
            filterType="my"
            onCreateNew={() => {
              setEditingQuotation(null);
              setActiveTab('quotation-create');
            }}
            onEdit={handleEditQuotation}
            onConvertToReceipt={handleConvertToReceipt}
          />
        );
      case 'quotation-all':
        return (
          <QuotationList
            filterType="all"
            onCreateNew={() => {
              setEditingQuotation(null);
              setActiveTab('quotation-create');
            }}
            onEdit={handleEditQuotation}
            onConvertToReceipt={handleConvertToReceipt}
          />
        );
      case 'receipt-create':
        return (
          <CreateReceipt
            key={editingReceipt?.id || convertedQuotation?.id || 'new-receipt'}
            initialQuotation={convertedQuotation}
            editingReceipt={editingReceipt}
            onSaved={() => {
              setConvertedQuotation(null);
              setEditingReceipt(null);
              setActiveTab('receipt-all');
            }}
          />
        );
      case 'receipt-my':
        return (
          <ReceiptList
            filterType="my"
            onCreateNew={() => {
              setConvertedQuotation(null);
              setEditingReceipt(null);
              setActiveTab('receipt-create');
            }}
            onEdit={handleEditReceipt}
          />
        );
      case 'receipt-all':
        return (
          <ReceiptList
            filterType="all"
            onCreateNew={() => {
              setConvertedQuotation(null);
              setEditingReceipt(null);
              setActiveTab('receipt-create');
            }}
            onEdit={handleEditReceipt}
          />
        );
      case 'customers':
      case 'vehicles':
        return <CustomerVehicle />;
      case 'activity-log':
        return isAdmin ? <ActivityLog /> : <Dashboard onViewQuotation={handleViewQuotation} onViewReceipt={handleViewReceipt} onSelectTab={setActiveTab} />;
      case 'reports':
      case 'reports-receipt':
      case 'reports-quotation':
        return <Reports />;
      case 'users':
        return isAdmin ? <Users /> : <Dashboard onViewQuotation={handleViewQuotation} onViewReceipt={handleViewReceipt} onSelectTab={setActiveTab} />;
      case 'brands':
        return isAdmin ? <Brands /> : <Dashboard onViewQuotation={handleViewQuotation} onViewReceipt={handleViewReceipt} onSelectTab={setActiveTab} />;
      case 'branches':
        return isAdmin ? <Branches /> : <Dashboard onViewQuotation={handleViewQuotation} onViewReceipt={handleViewReceipt} onSelectTab={setActiveTab} />;
      case 'data-setup':
      case 'settings':
        return isAdmin ? <Settings /> : <Dashboard onViewQuotation={handleViewQuotation} onViewReceipt={handleViewReceipt} onSelectTab={setActiveTab} />;
      default:
        return (
          <Dashboard
            onViewQuotation={handleViewQuotation}
            onViewReceipt={handleViewReceipt}
            onSelectTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMobileMenu={handleToggleMenu}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div key={activeTab} className="animate-page-enter">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Universal Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
