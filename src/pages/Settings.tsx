import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { testTelegramBotConnection } from '../services/telegramService';
import type { SystemSettings, Brand } from '../types';
import { Settings as SettingsIcon, Save, CheckCircle, Building2, Percent, FileText, Layout, Upload, X, Send, Bot, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { BYDLogo } from '../components/common/BYDLogo';
import { DENZALogo } from '../components/common/DENZALogo';

export const Settings: React.FC = () => {
  const { brands, branches, refreshBrandsAndBranches } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ success?: boolean; text?: string } | null>(null);

  // Brand Management Modal State
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [brandCode, setBrandCode] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoType, setLogoType] = useState<'byd' | 'denza' | 'custom'>('byd');
  const [logoUrl, setLogoUrl] = useState('');
  const [serviceCenterName, setServiceCenterName] = useState('');
  const [localCompanyName, setLocalCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [documentPrefix, setDocumentPrefix] = useState('');
  const [receiptPrefix, setReceiptPrefix] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const openCreateBrandModal = () => {
    setEditingBrand(null);
    setBrandCode('');
    setBrandName('');
    setLogoType('byd');
    setLogoUrl('');
    setServiceCenterName('');
    setLocalCompanyName('');
    setAddress('');
    setTelephone('');
    setEmail('');
    setDocumentPrefix('');
    setReceiptPrefix('');
    setStatus('Active');
    setBrandModalOpen(true);
  };

  const openEditBrandModal = (b: Brand) => {
    setEditingBrand(b);
    setBrandCode(b.brand_code);
    setBrandName(b.brand_name);
    setLogoType(b.logo_type || (b.brand_code.toLowerCase().includes('denza') ? 'denza' : 'byd'));
    setLogoUrl(b.logo_url || '');
    setServiceCenterName(b.service_center_name);
    setLocalCompanyName(b.local_company_name || '');
    setAddress(b.address);
    setTelephone(b.telephone);
    setEmail(b.email);
    setDocumentPrefix(b.document_prefix);
    setReceiptPrefix(b.receipt_prefix);
    setStatus(b.status);
    setBrandModalOpen(true);
  };

  const handleDeleteBrand = (b: Brand) => {
    if (confirm(`Are you sure you want to delete brand "${b.brand_name}"? This will also remove any affiliated branches.`)) {
      const currentBrands = StorageService.getBrands();
      const updatedBrands = currentBrands.filter(brand => brand.id !== b.id);
      StorageService.saveBrands(updatedBrands);

      const currentBranches = StorageService.getBranches();
      const updatedBranches = currentBranches.filter(br => br.brand_id !== b.id);
      StorageService.saveBranches(updatedBranches);

      refreshBrandsAndBranches();
    }
  };

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setLogoType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCode || !brandName) {
      alert('Brand Code and Brand Name are required.');
      return;
    }

    const currentBrands = StorageService.getBrands();
    let updatedBrands: Brand[];

    if (editingBrand) {
      updatedBrands = currentBrands.map(b =>
        b.id === editingBrand.id
          ? {
              ...b,
              brand_code: brandCode,
              brand_name: brandName,
              logo_type: logoType,
              logo_url: logoUrl,
              service_center_name: serviceCenterName,
              local_company_name: localCompanyName,
              address,
              telephone,
              email,
              document_prefix: documentPrefix,
              receipt_prefix: receiptPrefix,
              status,
              updated_at: new Date().toISOString().split('T')[0]
            }
          : b
      );
    } else {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        brand_code: brandCode,
        brand_name: brandName,
        logo_type: logoType,
        logo_url: logoUrl,
        service_center_name: serviceCenterName,
        local_company_name: localCompanyName,
        address,
        telephone,
        email,
        document_prefix: documentPrefix,
        receipt_prefix: receiptPrefix,
        status,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      updatedBrands = [...currentBrands, newBrand];
    }

    StorageService.saveBrands(updatedBrands);
    refreshBrandsAndBranches();
    setBrandModalOpen(false);
  };

  const handleChange = (field: keyof SystemSettings, val: any) => {
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleQuotationLineChange = (
    field: 'quotation_deposit_term' | 'quotation_payment_term' | 'quotation_bank_details' | 'quotation_expiration_term',
    val: string
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [field]: val };
      const lines = [
        updated.quotation_deposit_term ?? '1. Will deposit 30% of full amount.',
        updated.quotation_payment_term ?? '2. The remaining needs to be paid after the maintenance is completed.',
        updated.quotation_bank_details ?? '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)',
        updated.quotation_expiration_term ?? '4. This Quotation will Expire in 30 days and will renew this quote again.'
      ];
      updated.quotation_terms = lines.join('\n');
      return updated;
    });
  };

  const handleQuotationTermsTextChange = (val: string) => {
    setSettings(prev => {
      const lines = val.split('\n');
      return {
        ...prev,
        quotation_terms: val,
        quotation_deposit_term: lines[0] ?? prev.quotation_deposit_term,
        quotation_payment_term: lines[1] ?? prev.quotation_payment_term,
        quotation_bank_details: lines[2] ?? prev.quotation_bank_details,
        quotation_expiration_term: lines[3] ?? prev.quotation_expiration_term,
      };
    });
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramStatusMsg(null);
    const res = await testTelegramBotConnection(settings.telegram_bot_token || '', settings.telegram_chat_id || '');
    setTelegramStatusMsg({ success: res.success, text: res.message });
    setTestingTelegram(false);
  };



  const handleBYDLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('byd_logo_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDenzaLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('denza_logo_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);

    // Sync brand logos to Brands list in storage
    const brands = StorageService.getBrands();
    const updatedBrands = brands.map(b => {
      if (b.brand_code === 'BYD' || b.id.includes('byd')) {
        return { ...b, logo_url: settings.byd_logo_url || b.logo_url };
      }
      if (b.brand_code === 'DENZA' || b.id.includes('denza')) {
        return { ...b, logo_url: settings.denza_logo_url || b.logo_url };
      }
      return b;
    });
    localStorage.setItem('byd_denza_brands', JSON.stringify(updatedBrands));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-2xs border border-red-200">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 font-heading">System Settings & Configuration</h2>
            <p className="text-xs text-slate-500 font-medium">Customize receipt & quotation headers, logos, text formats, tax rates, and document prefixes.</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-extrabold border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="pro-card p-6 space-y-6">
        {/* Receipt & Quotation Header Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Document Header & Branding Settings (Receipt & Quotation)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              Live Header Customization
            </span>
          </div>

          {/* Clean 2-Column Brand Logo Cards for BYD and DENZA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* 1. BYD Logo Upload */}
            <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-[10px] flex items-center justify-center font-heading">BYD</span>
                  <span className="font-extrabold text-xs text-slate-900 font-heading">BYD Vehicle Brand Logo</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">Official BYD Logo</span>
              </div>

              <div className="flex items-center justify-center p-3 bg-white border border-slate-200 rounded-xl min-h-[70px] shadow-2xs">
                {settings.byd_logo_url ? (
                  <img src={settings.byd_logo_url} alt="BYD Custom Logo" className="h-10 object-contain" />
                ) : (
                  <BYDLogo variant="red" className="h-10" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.byd_logo_url || ''}
                  onChange={e => handleChange('byd_logo_url', e.target.value)}
                  placeholder="Paste BYD logo URL or attach PC picture file..."
                  className="pro-input flex-1 font-mono text-xs"
                />
                <label className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBYDLogoUpload}
                    className="hidden"
                  />
                </label>
                {settings.byd_logo_url && (
                  <button
                    type="button"
                    onClick={() => handleChange('byd_logo_url', '')}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                    title="Reset to BYD Default Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. DENZA Logo Upload */}
            <div className="bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-900 text-white font-black text-[9px] flex items-center justify-center font-heading">DENZA</span>
                  <span className="font-extrabold text-xs text-slate-900 font-heading">DENZA Luxury Brand Logo</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">Official DENZA Logo</span>
              </div>

              <div className="flex items-center justify-center p-3 bg-white border border-slate-200 rounded-xl min-h-[70px] shadow-2xs">
                {settings.denza_logo_url ? (
                  <img src={settings.denza_logo_url} alt="DENZA Custom Logo" className="h-10 object-contain" />
                ) : (
                  <DENZALogo variant="blue" className="h-10" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.denza_logo_url || ''}
                  onChange={e => handleChange('denza_logo_url', e.target.value)}
                  placeholder="Paste DENZA logo URL or attach PC picture file..."
                  className="pro-input flex-1 font-mono text-xs"
                />
                <label className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDenzaLogoUpload}
                    className="hidden"
                  />
                </label>
                {settings.denza_logo_url && (
                  <button
                    type="button"
                    onClick={() => handleChange('denza_logo_url', '')}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                    title="Reset to DENZA Default Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Header Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Header Title (English)</label>
              <input
                type="text"
                value={settings.receipt_header_english_title ?? 'BYD SALES & SERVICE CENTER'}
                onChange={e => handleChange('receipt_header_english_title', e.target.value)}
                placeholder="e.g. BYD SALES & SERVICE CENTER"
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Header Title (Khmer)</label>
              <input
                type="text"
                value={settings.receipt_header_khmer_title ?? 'មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ'}
                onChange={e => handleChange('receipt_header_khmer_title', e.target.value)}
                placeholder="e.g. មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ"
                className="pro-input font-bold font-muol"
              />
            </div>
          </div>

          {/* Quotation Header Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Header Title (English)</label>
              <input
                type="text"
                value={settings.quotation_header_english_title ?? 'Huan Ya He Zhong (Cambodia) Trading Co., Ltd'}
                onChange={e => handleChange('quotation_header_english_title', e.target.value)}
                placeholder="e.g. Huan Ya He Zhong (Cambodia) Trading Co., Ltd"
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Header Title (Khmer)</label>
              <input
                type="text"
                value={settings.quotation_header_khmer_title ?? 'ហ័ន យ៉ា ហ៊ឺ ​ ចុង (ខេមបូឌា) ត្រេឌីង ឯ.ក'}
                onChange={e => handleChange('quotation_header_khmer_title', e.target.value)}
                placeholder="e.g. ហ័ន យ៉ា ហ៊ឺ ​ ចុង (ខេមបូឌា) ត្រេឌីង ឯ.ក"
                className="pro-input font-bold font-muol"
              />
            </div>
          </div>

          {/* Address & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Header Contact Telephone (Tel:)</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="e.g. +855 63 965 432"
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Header Location Address (Add:)</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="e.g. National Road 6, Svay Dangkum, Siem Reap"
                className="pro-input"
              />
            </div>
          </div>
        </div>

        {/* Dealership Info */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
              Service Center Headquarters Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Center Name</label>
              <input
                type="text"
                value={settings.center_name}
                onChange={e => handleChange('center_name', e.target.value)}
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Branch Name</label>
              <input
                type="text"
                value={settings.branch_name}
                onChange={e => handleChange('branch_name', e.target.value)}
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
                className="pro-input"
              />
            </div>
          </div>
        </div>

        {/* Tax & Financial Calculation */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Tax & Document Number Format Defaults
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Rate: 1 USD = 4,100 KHR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">VAT Rate (0.10 = 10%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.vat_rate}
                onChange={e => handleChange('vat_rate', Number(e.target.value))}
                className="pro-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={e => handleChange('currency_symbol', e.target.value)}
                className="pro-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Number Prefix</label>
              <input
                type="text"
                value={settings.quotation_prefix || 'BYD'}
                onChange={e => handleChange('quotation_prefix', e.target.value)}
                className="pro-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Number Prefix</label>
              <input
                type="text"
                value={settings.receipt_prefix || 'BYD60M'}
                onChange={e => handleChange('receipt_prefix', e.target.value)}
                className="pro-input font-mono font-bold text-red-700"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Group Notification Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Telegram Bot Group Notification Settings
              </h3>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Customer Repair Reminders
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Configure your Telegram Bot to send automated customer service repair reminder notifications to your Telegram team group chat.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={settings.telegram_bot_token || ''}
                onChange={e => handleChange('telegram_bot_token', e.target.value)}
                placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="pro-input font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">Get Bot Token from Telegram @BotFather</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Group / Chat ID</label>
              <input
                type="text"
                value={settings.telegram_chat_id || ''}
                onChange={e => handleChange('telegram_chat_id', e.target.value)}
                placeholder="e.g. -100123456789 or @your_group_name"
                className="pro-input font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">Chat ID or Group ID where reminders are sent</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram || !settings.telegram_bot_token || !settings.telegram_chat_id}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-blue-200 cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              <span>{testingTelegram ? 'Testing Connection...' : 'Test Telegram Group Connection'}</span>
            </button>

            {telegramStatusMsg && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                telegramStatusMsg.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {telegramStatusMsg.text}
              </span>
            )}
          </div>
        </div>

        {/* Multi-Brand System Setup (Add, Edit, & Delete Brands) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Multi-Brand System Setup (Add, Edit, & Delete Brands)
              </h3>
            </div>
            <button
              type="button"
              onClick={openCreateBrandModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Brand</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Manage your vehicle brand list. Add new car brands, customize document prefixes, update logo images, or delete existing brands.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {brands.map(b => {
              const isDenza = b.brand_code.toUpperCase().includes('DENZA');
              const affiliatedBranchCount = branches.filter(br => br.brand_id === b.id).length;
              return (
                <div key={b.id} className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.brand_name} className="h-7 object-contain max-w-[100px]" />
                        ) : b.logo_type === 'denza' || isDenza ? (
                          <DENZALogo variant="blue" className="h-7" />
                        ) : (
                          <BYDLogo variant="red" className="h-6" />
                        )}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 font-heading">{b.brand_name}</h4>
                          <span className="text-[10px] font-mono font-bold text-slate-500">Code: {b.brand_code}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-500">Doc Prefix:</span> <span className="font-mono font-bold text-slate-900">{b.document_prefix}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500">Receipt Prefix:</span> <span className="font-mono font-bold text-red-700">{b.receipt_prefix}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500">Affiliated Branches:</span> <span className="font-bold text-slate-900">{affiliatedBranchCount} branch(es)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditBrandModal(b)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold transition border border-slate-200 shadow-2xs cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(b)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-bold transition border border-red-200 shadow-2xs cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quotation Terms & Conditions / Bank Details Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                Quotation Terms & Conditions / Bank Details (报价单条款与付款信息)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Printed on Quotation PDF Footer
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Customize the 4 official terms, bank payment details, and expiration notice printed on every service quotation PDF document.
          </p>

          <div className="space-y-3 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Point 1: Deposit Condition (ប្រាក់កក់)</label>
              <input
                type="text"
                value={settings.quotation_deposit_term ?? '1. Will deposit 30% of full amount.'}
                onChange={e => handleQuotationLineChange('quotation_deposit_term', e.target.value)}
                placeholder="e.g. 1. Will deposit 30% of full amount."
                className="pro-input font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Point 2: Remaining Payment Condition (ការទូទាត់ប្រាក់នៅសល់)</label>
              <input
                type="text"
                value={settings.quotation_payment_term ?? '2. The remaining needs to be paid after the maintenance is completed.'}
                onChange={e => handleQuotationLineChange('quotation_payment_term', e.target.value)}
                placeholder="e.g. 2. The remaining needs to be paid after the maintenance is completed."
                className="pro-input font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Point 3: Bank Account / ABA Transfer Details (គណនីធនាគារ ABA)</label>
              <input
                type="text"
                value={settings.quotation_bank_details ?? '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)'}
                onChange={e => handleQuotationLineChange('quotation_bank_details', e.target.value)}
                placeholder="e.g. 3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)"
                className="pro-input font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Point 4: Quotation Expiry Notice (សុពលភាពការសម្រង់តម្លៃ)</label>
              <input
                type="text"
                value={settings.quotation_expiration_term ?? '4. This Quotation will Expire in 30 days and will renew this quote again.'}
                onChange={e => handleQuotationLineChange('quotation_expiration_term', e.target.value)}
                placeholder="e.g. 4. This Quotation will Expire in 30 days and will renew this quote again."
                className="pro-input font-semibold"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Combined Quotation Terms (Multi-Line Preview / Advanced Edit)</label>
              <textarea
                rows={4}
                value={settings.quotation_terms ?? `${settings.quotation_deposit_term || '1. Will deposit 30% of full amount.'}\n${settings.quotation_payment_term || '2. The remaining needs to be paid after the maintenance is completed.'}\n${settings.quotation_bank_details || '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)'}\n${settings.quotation_expiration_term || '4. This Quotation will Expire in 30 days and will renew this quote again.'}`}
                onChange={e => handleQuotationTermsTextChange(e.target.value)}
                className="pro-input p-3.5 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Receipt General Terms & Conditions */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
              General Receipt Terms & Conditions Footer
            </h3>
          </div>

          <textarea
            rows={3}
            value={settings.terms_conditions}
            onChange={e => handleChange('terms_conditions', e.target.value)}
            className="pro-input p-3.5 text-xs"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="pro-btn-primary"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>

      {/* Add / Edit Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              {editingBrand ? 'Edit Brand Settings' : 'Create New Brand'}
            </h3>

            <form onSubmit={handleBrandSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Code *</label>
                  <input
                    type="text"
                    required
                    value={brandCode}
                    onChange={e => setBrandCode(e.target.value)}
                    placeholder="e.g. BYD, DENZA, TOYOTA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="e.g. BYD Auto Cambodia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              {/* Logo Settings */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-red-600" />
                    Brand Logo Picture (BYD / DENZA / Custom)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">Saved to local database</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setLogoType('byd'); setLogoUrl(''); }}
                    className={`px-3 py-2.5 rounded-xl border text-center font-bold text-[11px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      logoType === 'byd' && !logoUrl ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BYDLogo variant="red" className="h-4" />
                    <span>BYD Standard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLogoType('denza'); setLogoUrl(''); }}
                    className={`px-3 py-2.5 rounded-xl border text-center font-bold text-[11px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      logoType === 'denza' && !logoUrl ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <DENZALogo variant="blue" className="h-4" />
                    <span>DENZA Luxury</span>
                  </button>

                  <label
                    className={`px-3 py-2.5 rounded-xl border text-center font-bold text-[11px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      logoUrl || logoType === 'custom' ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Upload from PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {(logoType === 'custom' || logoUrl) && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={e => {
                          setLogoUrl(e.target.value);
                          setLogoType('custom');
                        }}
                        placeholder="Paste image URL or attach local PC picture file..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {logoUrl && (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            <img src={logoUrl} alt="Logo Preview" className="h-8 max-w-[120px] object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Attached Picture Ready</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Saved directly to local database</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setLogoUrl(''); setLogoType('byd'); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Remove attached picture"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Center Name</label>
                <input
                  type="text"
                  value={serviceCenterName}
                  onChange={e => setServiceCenterName(e.target.value)}
                  placeholder="e.g. BYD SALES & SERVICE CENTER"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Local Khmer Company Name</label>
                <input
                  type="text"
                  value={localCompanyName}
                  onChange={e => setLocalCompanyName(e.target.value)}
                  placeholder="e.g. មិនមែនជាប្រកាសជាចំនាយឬប្រកាសពន្ធ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation Prefix</label>
                  <input
                    type="text"
                    value={documentPrefix}
                    onChange={e => setDocumentPrefix(e.target.value)}
                    placeholder="BYD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receipt Prefix</label>
                  <input
                    type="text"
                    value={receiptPrefix}
                    onChange={e => setReceiptPrefix(e.target.value)}
                    placeholder="BYD60M"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-red-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xs"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
