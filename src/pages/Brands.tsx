import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Modal } from '../components/common/Modal';
import { StorageService } from '../services/storageService';
import type { Brand } from '../types';
import { Building2, Plus, Edit2, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Select } from '../components/common/Select';

export const Brands: React.FC = () => {
  const { brands, refreshBrandsAndBranches } = useAuth();
  const confirm = useConfirm();
  const showAlert = useAlert();
  const showToast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
  const [brandCode, setBrandCode] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoType, setLogoType] = useState<'byd' | 'denza' | 'custom'>('custom');
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
    setLogoType('custom');
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
    setLogoType(b.logo_type || 'custom');
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
    if (b.id === 'brand-byd' || b.id === 'brand-denza' || b.brand_code === 'BYD' || b.brand_code === 'DENZA') {
      await showAlert({
        title: 'Core Static Brand',
        message: 'BYD and DENZA are static system brands and cannot be deleted.',
        type: 'warning'
      });
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete Automotive Brand',
      message: `Are you sure you want to delete brand "${b.brand_name}"? This will also remove any affiliated branches.`,
      details: `Code: ${b.brand_code} • Document Prefix: ${b.document_prefix}`,
      confirmText: 'Delete Brand',
      type: 'danger'
    });

    if (isConfirmed) {
      await StorageService.deleteBrand(b.id);
      refreshBrandsAndBranches();
      showToast({
        type: 'success',
        title: 'Brand Deleted',
        message: `Brand "${b.brand_name}" has been deleted successfully.`
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        await showAlert({
          title: 'File Too Large',
          message: 'File size exceeds 2MB limit. Please choose a smaller image file.',
          type: 'warning'
        });
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
    if (!brandCode.trim() || !brandName.trim()) {
      await showAlert({
        title: 'Missing Required Information',
        message: 'Brand Code and Brand Name are required.',
        type: 'warning'
      });
      return;
    }

    const brandData: Brand = {
      id: editingBrand ? editingBrand.id : `brand-${Date.now()}`,
      brand_code: brandCode.trim(),
      brand_name: brandName.trim(),
      logo_type: logoType,
      logo_url: logoUrl,
      service_center_name: serviceCenterName.trim(),
      local_company_name: localCompanyName.trim(),
      address: address.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      document_prefix: documentPrefix.trim(),
      receipt_prefix: receiptPrefix.trim(),
      status,
      created_at: editingBrand ? editingBrand.created_at : new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    await StorageService.saveBrand(brandData);
    refreshBrandsAndBranches();
    showToast({
      type: 'success',
      title: editingBrand ? 'Brand Settings Saved' : 'Brand Created',
      message: `Brand "${brandName}" was saved successfully.`
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 no-print">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center shadow-xs shrink-0">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight truncate">
              Brand Management
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-relaxed">
              Configure multi-brand settings, headers, logos, and document numbering prefixes for BYD & DENZA.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map(b => {
          const isStatic = b.id === 'brand-byd' || b.id === 'brand-denza' || b.brand_code === 'BYD' || b.brand_code === 'DENZA';
          const staticNum = b.brand_code === 'BYD' || b.id === 'brand-byd' ? '1. BYD' : (b.brand_code === 'DENZA' || b.id === 'brand-denza' ? '2. DENZA' : null);

          return (
            <div key={b.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.brand_name} className="h-9 object-contain max-w-[140px]" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-xs font-heading">
                      {b.brand_code.slice(0, 3)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">{b.brand_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-slate-500">Code: {b.brand_code}</span>
                      {staticNum && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          Static Brand ({staticNum})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
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
                {!isStatic && (
                  <button
                    onClick={() => handleDeleteBrand(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        title={editingBrand ? 'Edit Brand Settings' : 'Create New Brand'}
        subtitle="Configure brand credentials, logo styling, and document prefixes."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Brand Code * {editingBrand && (editingBrand.brand_code === 'BYD' || editingBrand.brand_code === 'DENZA') && (
                  <span className="text-[10px] text-blue-600 font-semibold">(Static)</span>
                )}
              </label>
              <input
                type="text"
                disabled={Boolean(editingBrand && (editingBrand.brand_code === 'BYD' || editingBrand.brand_code === 'DENZA'))}
                value={brandCode}
                onChange={e => setBrandCode(e.target.value)}
                placeholder="BYD or DENZA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="BYD Cambodia"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Logo Settings */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Brand Logo Picture</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500">Saved to local database</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => {
                    setLogoUrl(e.target.value);
                    setLogoType('custom');
                  }}
                  placeholder="Paste image URL or upload PC picture file..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-[0.98]">
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

              {logoUrl ? (
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
                    onClick={() => { setLogoUrl(''); setLogoType('custom'); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="Remove attached picture"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium">
                  No logo attached. Upload an image file or paste an image URL.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Center Name</label>
            <input
              type="text"
              value={serviceCenterName}
              onChange={e => setServiceCenterName(e.target.value)}
              placeholder="e.g. BYD After-Sales Service Center"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Local Legal Company Name</label>
            <input
              type="text"
              value={localCompanyName}
              onChange={e => setLocalCompanyName(e.target.value)}
              placeholder="e.g. HARMONY AUTOMOBILE CAMBODIA CO., LTD."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Headquarter / Main Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telephone</label>
              <input
                type="text"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
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
              <Select
                label="Status"
                value={status}
                onChange={val => setStatus(val as 'Active' | 'Inactive')}
                options={['Active', 'Inactive']}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
            >
              Save Brand
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
