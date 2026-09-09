import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Modal } from '../components/common/Modal';
import { StorageService } from '../services/storageService';
import type { Brand } from '../types';
import { Building2, Plus, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { BYDLogo } from '../components/common/BYDLogo';
import { DENZALogo } from '../components/common/DENZALogo';
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
    setLogoType(b.logo_type || 'byd');
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
              <label className="block font-bold text-slate-700 mb-1">Brand Code *</label>
              <input
                type="text"
                value={brandCode}
                onChange={e => setBrandCode(e.target.value)}
                placeholder="BYD or DENZA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
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
                <span>Brand Logo Style</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLogoType('byd')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer ${logoType === 'byd' ? 'bg-white border-red-600 ring-2 ring-red-600/20 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <BYDLogo className="h-6 w-auto" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">BYD Standard</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoType('denza')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer ${logoType === 'denza' ? 'bg-white border-red-600 ring-2 ring-red-600/20 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <DENZALogo className="h-6 w-auto" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">DENZA Luxury</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoType('custom')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer ${logoType === 'custom' ? 'bg-white border-red-600 ring-2 ring-red-600/20 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Custom" className="h-6 w-auto max-w-full object-contain" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-[10px] font-bold text-slate-700 mt-1">Custom Logo</span>
              </button>
            </div>

            {logoType === 'custom' && (
              <div className="pt-2 border-t border-slate-200/80">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>
            )}
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
