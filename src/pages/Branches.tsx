import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import type { Branch } from '../types';
import { GitBranch, Plus, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react';

export const Branches: React.FC = () => {
  const { brands, branches, refreshBrandsAndBranches } = useAuth();

  const [filterBrandId, setFilterBrandId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [brandId, setBrandId] = useState<string>(brands[0]?.id || 'brand-byd');
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
    setBranchCode(br.branch_code);
    setBranchName(br.branch_name);
    setServiceCenterName(br.service_center_name || '');
    setAddress(br.address);
    setTelephone(br.telephone);
    setEmail(br.email);
    setStatus(br.status);
    setModalOpen(true);
  };

  const handleDeleteBranch = (br: Branch) => {
    if (confirm(`Are you sure you want to delete branch "${br.branch_name}"?`)) {
      const currentBranches = StorageService.getBranches();
      const updatedBranches = currentBranches.filter(b => b.id !== br.id);
      StorageService.saveBranches(updatedBranches);
      refreshBrandsAndBranches();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchCode || !branchName) {
      alert('Branch Code and Branch Name are required.');
      return;
    }

    const currentBranches = StorageService.getBranches();
    let updatedBranches: Branch[];

    if (editingBranch) {
      updatedBranches = currentBranches.map(b =>
        b.id === editingBranch.id
          ? {
              ...b,
              brand_id: brandId,
              branch_code: branchCode,
              branch_name: branchName,
              service_center_name: serviceCenterName,
              address,
              telephone,
              email,
              status,
              updated_at: new Date().toISOString().split('T')[0]
            }
          : b
      );
    } else {
      const newBranch: Branch = {
        id: `b-${Date.now()}`,
        brand_id: brandId,
        branch_code: branchCode,
        branch_name: branchName,
        service_center_name: serviceCenterName,
        address,
        telephone,
        email,
        status,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      updatedBranches = [...currentBranches, newBranch];
    }

    StorageService.saveBranches(updatedBranches);
    refreshBrandsAndBranches();
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-red-600" />
            Branch Center Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage service center locations, contact details, and brand affiliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBrandId}
            onChange={e => setFilterBrandId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          >
            <option value="all">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.brand_name}</option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Branch
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    brandObj?.brand_code === 'DENZA' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {brandObj?.brand_code || 'BYD'}
                  </span>
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
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              {editingBranch ? 'Edit Branch Location' : 'Create New Branch'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Affiliated Brand *</label>
                <select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.brand_name} ({b.brand_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Code *</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    placeholder="e.g. 6A, CM, PP, SR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Display Name *</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  placeholder="e.g. BYD Chroy Changva 6A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Center Name</label>
                <input
                  type="text"
                  value={serviceCenterName}
                  onChange={e => setServiceCenterName(e.target.value)}
                  placeholder="e.g. BYD Sales & Service Center 6A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Address</label>
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
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
