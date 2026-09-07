import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { Brand } from '../types';
import { Building2, Plus, Edit2, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { BYDLogo } from '../components/common/BYDLogo';
import { DENZALogo } from '../components/common/DENZALogo';

export const Brands: React.FC = () => {
  const { brands, refreshBrandsAndBranches } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
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

  const openCreateModal = () => {
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
    setModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
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
    setModalOpen(true);
  };

  const handleDeleteBrand = async (b: Brand) => {
    if (confirm(`Are you sure you want to delete brand "${b.brand_name}"? This will also remove any affiliated branches.`)) {
      await StorageService.deleteBrand(b.id);
      refreshBrandsAndBranches();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCode || !brandName) {
      alert('Brand Code and Brand Name are required.');
      return;
    }

    const brandData: Brand = {
      id: editingBrand ? editingBrand.id : `brand-${Date.now()}`,
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
      created_at: editingBrand ? editingBrand.created_at : new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    await StorageService.saveBrand(brandData);
    refreshBrandsAndBranches();
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            Brand Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Configure multi-brand settings, headers, logos, and document numbering prefixes for BYD & DENZA.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Brand
        </button>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map(b => {
          const isDenza = b.brand_code.toUpperCase().includes('DENZA');
          return (
            <div key={b.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.brand_name} className="h-9 object-contain max-w-[140px]" />
                  ) : b.logo_type === 'denza' || isDenza ? (
                    <DENZALogo variant="blue" className="h-9" />
                  ) : (
                    <BYDLogo variant="red" className="h-8" />
                  )}
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">{b.brand_name}</h3>
                    <span className="text-xs font-mono font-bold text-slate-500">Code: {b.brand_code}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {b.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="font-bold text-slate-500 block">Service Center Name:</span>
                  <span className="font-semibold text-slate-900">{b.service_center_name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Local Khmer Name:</span>
                  <span className="font-medium text-slate-800">{b.local_company_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">Contact:</span>
                  <span>{b.telephone} | {b.email}</span>
                </div>
                <div className="flex gap-4 pt-1">
                  <div>
                    <span className="font-bold text-slate-500">Doc Prefix:</span>{' '}
                    <span className="font-mono font-bold text-slate-900">{b.document_prefix}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Receipt Prefix:</span>{' '}
                    <span className="font-mono font-bold text-red-700">{b.receipt_prefix}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBrand(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              {editingBrand ? 'Edit Brand Settings' : 'Create New Brand'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Code *</label>
                  <input
                    type="text"
                    value={brandCode}
                    onChange={e => setBrandCode(e.target.value)}
                    placeholder="BYD or DENZA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="BYD Auto Cambodia"
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
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Custom Image Upload or URL Input */}
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
                          onChange={handleImageUpload}
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
                  placeholder="BYD SALES & SERVICE CENTER"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Local Khmer Company Name</label>
                <input
                  type="text"
                  value={localCompanyName}
                  onChange={e => setLocalCompanyName(e.target.value)}
                  placeholder="មិនមែនជាប្រកាសជាចំនាយឬប្រកាសពន្ធ"
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
                  onClick={() => setModalOpen(false)}
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
