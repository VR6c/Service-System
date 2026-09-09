import React, { useEffect, useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';
import type { Quotation, Receipt } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { DialogProvider } from './context/DialogContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Route-level code-splitting with React.lazy to eliminate monolithic initial bundle
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CreateQuotation = lazy(() => import('./pages/CreateQuotation').then(m => ({ default: m.CreateQuotation })));
const QuotationList = lazy(() => import('./pages/QuotationList').then(m => ({ default: m.QuotationList })));
const CreateReceipt = lazy(() => import('./pages/CreateReceipt').then(m => ({ default: m.CreateReceipt })));
const ReceiptList = lazy(() => import('./pages/ReceiptList').then(m => ({ default: m.ReceiptList })));
const CustomerVehicle = lazy(() => import('./pages/CustomerVehicle').then(m => ({ default: m.CustomerVehicle })));
const ActivityLog = lazy(() => import('./pages/ActivityLog').then(m => ({ default: m.ActivityLog })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Brands = lazy(() => import('./pages/Brands').then(m => ({ default: m.Brands })));
const Branches = lazy(() => import('./pages/Branches').then(m => ({ default: m.Branches })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[380px] w-full p-8" role="status" aria-label="Loading page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono">Loading...</span>
    </div>
  </div>
);

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
    if (activeTab !== 'quotation-create') setEditingQuotation(null);
    if (activeTab !== 'receipt-create') setEditingReceipt(null);
  }, [activeTab]);

  if (!currentUser) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <Login />
      </Suspense>
    );
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
            key={editingQuotation?.id || editingQuotation?.plate_no || `new-quotation-${currentUser.id}`}
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
            key={editingReceipt?.id || editingReceipt?.plate_no || convertedQuotation?.id || `new-receipt-${currentUser.id}`}
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
        return (
          <CustomerVehicle
            onCreateQuotation={(cust) => {
              setEditingQuotation({
                id: '',
                quotation_no: '',
                customer_name: cust.name,
                phone: cust.phone,
                plate_no: cust.plateNumber,
                vehicle_model: cust.vehicleModel,
                color: cust.color,
                vin: cust.vin || '',
                mileage: cust.mileage || 0,
                battery: cust.battery || '',
                created_date: new Date().toISOString().slice(0, 10),
                valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
                status: 'Quotation',
                subtotal: 0,
                discount_amount: 0,
                vat_rate: 0,
                vat_amount: 0,
                total_amount: 0,
                fee_items: [],
                description: `Inspection & Maintenance for ${cust.vehicleModel}`,
                branch_name: cust.branch
              } as unknown as Quotation);
              setActiveTab('quotation-create');
            }}
            onCreateReceipt={(cust) => {
              setEditingReceipt({
                id: '',
                receipt_no: '',
                customer_name: cust.name,
                phone: cust.phone,
                plate_no: cust.plateNumber,
                vehicle_model: cust.vehicleModel,
                color: cust.color,
                vin: cust.vin || '',
                mileage: cust.mileage || 0,
                battery: cust.battery || '',
                created_date: new Date().toISOString().slice(0, 10),
                status: 'In Service',
                subtotal: 0,
                discount_amount: 0,
                vat: 0,
                total_amount: 0,
                fee_items: [],
                description: `Service Intake for ${cust.vehicleModel}`,
                branch_name: cust.branch
              } as unknown as Receipt);
              setActiveTab('receipt-create');
            }}
            onViewQuotation={() => handleViewQuotation()}
            onViewReceipt={() => handleViewReceipt()}
          />
        );
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
          <Suspense fallback={<PageLoadingFallback />}>
            <div key={activeTab} className="animate-page-enter">
              {renderContent()}
            </div>
          </Suspense>
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
    <ErrorBoundary
      fallbackTitle="Application Notice"
      fallbackMessage="An unexpected error occurred in the system. Click reload to refresh the application."
    >
      <AuthProvider>
        <LanguageProvider>
          <DialogProvider>
            <MainApp />
          </DialogProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

