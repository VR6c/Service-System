import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Modal } from '../components/common/Modal';
import { StorageService } from '../services/storageService';
import type { Branch } from '../types';
import { GitBranch, Plus, Edit2, Trash2, MapPin, Phone, Mail, Sparkles, Check } from 'lucide-react';
import { Select } from '../components/common/Select';

export const Branches: React.FC = () => {
  const { brands, branches, refreshBrandsAndBranches } = useAuth();
  const confirm = useConfirm();
  const showAlert = useAlert();
  const showToast = useToast();

  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [brandId, setBrandId] = useState<string>(brands[0]?.id || 'brand-byd');
  const [isDualBrand, setIsDualBrand] = useState<boolean>(false);
  const [supportedBrandIds, setSupportedBrandIds] = useState<string[]>(['brand-byd']);
  const [branchCode, setBranchCode] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [serviceCenterName, setServiceCenterName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredBranches = branches.filter(b => filterBrandId === 'all' || b.brand_id === filterBrandId);

  const openCreateModal = () => {
    setEditingBranch(null);
    setBrandId(brands[0]?.id || 'brand-byd');
    setIsDualBrand(false);
    setSupportedBrandIds([brands[0]?.id || 'brand-byd']);
    setBranchCode('');
    setBranchName('');
    setServiceCenterName('');
    setAddress('');
    setTelephone('');
    setEmail('');
    setStatus('Active');
    setModalOpen(true);
  };

  const openEditModal = (br: Branch) => {
    setEditingBranch(br);
    setBrandId(br.brand_id);
    const isDual =
      br.is_dual_brand ||
      br.branch_code === '6A' ||
      br.id === 'b-byd-6a' ||
      br.id === 'b-denza-pp' ||
      Boolean(br.branch_name && br.branch_name.toLowerCase().includes('6a')) ||
      Boolean(br.supported_brand_ids && br.supported_brand_ids.length > 1);
    setIsDualBrand(Boolean(isDual));
    setSupportedBrandIds(
      br.supported_brand_ids && br.supported_brand_ids.length > 0
        ? br.supported_brand_ids
        : isDual
        ? ['brand-byd', 'brand-denza']
        : [br.brand_id || 'brand-byd']
    );
    setBranchCode(br.branch_code);
    setBranchName(br.branch_name);
    setServiceCenterName(br.service_center_name || '');
    setAddress(br.address || '');
    setTelephone(br.telephone || '');
    setEmail(br.email || '');
    setStatus(br.status);
    setModalOpen(true);
  };

  const handleDeleteBranch = async (br: Branch) => {
    const isConfirmed = await confirm({
      title: 'Delete Branch Location',
      message: `Are you sure you want to delete branch "${br.branch_name}"?`,
      details: `Code: ${br.branch_code} • ${br.service_center_name || ''}`,
      confirmText: 'Delete Branch',
      type: 'danger'
    });
    if (isConfirmed) {
      await StorageService.deleteBranch(br.id);
      refreshBrandsAndBranches();
      showToast({
        type: 'success',
        title: 'Branch Deleted',
        message: `Branch "${br.branch_name}" has been removed.`
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchCode.trim() || !branchName.trim()) {
      await showAlert({
        title: 'Missing Required Information',
        message: 'Branch Code and Branch Name are required.',
        type: 'warning'
      });
      return;
    }

    const calculatedSupported = isDualBrand
      ? (supportedBrandIds.length >= 2 ? supportedBrandIds : ['brand-byd', 'brand-denza'])
      : [brandId];

    const branchData: Branch = {
      id: editingBranch ? editingBranch.id : `b-${Date.now()}`,
      brand_id: brandId,
      supported_brand_ids: calculatedSupported,
      is_dual_brand: isDualBrand,
      branch_code: branchCode.trim().toUpperCase(),
      branch_name: branchName.trim(),
      service_center_name: serviceCenterName.trim(),
      address: address.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      status,
      created_at: editingBranch ? editingBranch.created_at : new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    await StorageService.saveBranch(branchData);
    refreshBrandsAndBranches();
    showToast({
      type: 'success',
      title: editingBranch ? 'Branch Updated' : 'Branch Created',
      message: `Branch "${branchName}" was saved successfully.`
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 no-print">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center shadow-xs shrink-0">
            <GitBranch className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight truncate">
              Branch Center Management
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-relaxed">
              Manage service center locations, contact details, and brand affiliations.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
          <div className="w-full sm:w-44">
            <Select
              value={filterBrandId}
              onChange={setFilterBrandId}
              options={[
                { value: 'all', label: 'All Brands' },
                ...brands.map(b => ({ value: b.id, label: b.brand_name }))
              ]}
              size="sm"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map(br => {
          const brandObj = brands.find(b => b.id === br.brand_id);
          return (
            <div key={br.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      brandObj?.brand_code === 'DENZA' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {brandObj?.brand_code || 'BYD'}
                    </span>
                    {(br.is_dual_brand || br.branch_code === '6A' || br.id === 'b-byd-6a' || (br.supported_brand_ids && br.supported_brand_ids.length > 1)) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Dual-Brand (BYD & DENZA)
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">Code: {br.branch_code}</span>
                </div>

                <h3 className="text-base font-black text-slate-900 font-heading">{br.branch_name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{br.service_center_name || brandObj?.service_center_name}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{br.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{br.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{br.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${
                  br.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  • {br.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(br)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(br)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
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
        title={editingBranch ? 'Edit Branch Location' : 'Create New Branch'}
        subtitle="Configure branch office information, code, and address."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <Select
              label="Primary Affiliated Brand *"
              value={brandId}
              onChange={val => {
                setBrandId(val);
                if (!isDualBrand) {
                  setSupportedBrandIds([val]);
                }
              }}
              options={brands.map(b => ({ value: b.id, label: `${b.brand_name} (${b.brand_code})` }))}
            />
          </div>

          {/* Dual-Brand Facility Toggle */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Dual-Brand Workshop Facility
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  Enable if this physical facility services both BYD & DENZA vehicles (e.g. Chroy Changva 6A).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDualBrand}
                  onChange={e => {
                    const checked = e.target.checked;
                    setIsDualBrand(checked);
                    if (checked) {
                      setSupportedBrandIds(['brand-byd', 'brand-denza']);
                    } else {
                      setSupportedBrandIds([brandId]);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {isDualBrand && (
              <div className="pt-2 border-t border-slate-200/60">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Supported Brands by this Facility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map(b => {
                    const isChecked = supportedBrandIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          if (isChecked) {
                            if (supportedBrandIds.length > 1) {
                              setSupportedBrandIds(supportedBrandIds.filter(id => id !== b.id));
                            }
                          } else {
                            setSupportedBrandIds([...supportedBrandIds, b.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{b.brand_name} ({b.brand_code})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Code *</label>
              <input
                type="text"
                value={branchCode}
                onChange={e => setBranchCode(e.target.value)}
                placeholder="e.g. 6A, CM, PP, SR"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Display Name *</label>
            <input
              type="text"
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              placeholder="e.g. BYD Chroy Changva 6A"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Center Name</label>
            <input
              type="text"
              value={serviceCenterName}
              onChange={e => setServiceCenterName(e.target.value)}
              placeholder="e.g. BYD Sales & Service Center 6A"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Address</label>
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
              Save Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
