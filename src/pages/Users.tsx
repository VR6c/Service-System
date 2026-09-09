import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { useConfirm, useAlert, useToast } from '../context/DialogContext';
import { Select } from '../components/common/Select';
import {
  Users as UsersIcon,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  Shield,
  UserCheck,
  User as UserIcon,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  Save,
  Check
} from 'lucide-react';

export const Users: React.FC = () => {
  const { users, brands, branches, addUser, updateUser, deleteUser, currentUser } = useAuth();
  const confirm = useConfirm();
  const showAlert = useAlert();
  const showToast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Section A: Login & Account Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('Service Advisor');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Section B: Default Receipt Profile State
  const [brandId, setBrandId] = useState<string>(brands[0]?.id || 'brand-byd');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || 'b-byd-6a');
  const [defaultSa, setDefaultSa] = useState('');

  // Form error state for friendly inline feedback
  const [formError, setFormError] = useState<string | null>(null);

  const availableBranches = branches.filter(b => b.brand_id === brandId);
  const selectedBrand = brands.find(b => b.id === brandId);
  const selectedBranch = branches.find(b => b.id === branchId);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('password123');
    setRole('Service Advisor');
    setStatus('Active');
    const firstBrand = brands[0]?.id || 'brand-byd';
    setBrandId(firstBrand);
    const firstBranch = branches.find(b => b.brand_id === firstBrand)?.id || branches[0]?.id || '';
    setBranchId(firstBranch);
    setDefaultSa('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setStatus(u.status);
    const uBrandId = u.default_brand_id || u.brand_id || brands[0]?.id || '';
    setBrandId(uBrandId);
    const uBranchId = u.default_branch_id || u.branch_id || branches.find(b => b.brand_id === uBrandId)?.id || '';
    setBranchId(uBranchId);
    setDefaultSa(u.default_sa || u.name);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDeleteUser = async (u: User) => {
    const isConfirmed = await confirm({
      title: 'Delete Staff User',
      message: `Are you sure you want to delete staff account for "${u.name}"? This action cannot be undone.`,
      details: `${u.email} • Role: ${u.role} • ${u.branch}`,
      confirmText: 'Delete User',
      cancelText: 'Keep User',
      type: 'danger'
    });

    if (isConfirmed) {
      deleteUser(u.id);
      showToast({
        type: 'success',
        title: 'Staff User Deleted',
        message: `Account for ${u.name} has been removed successfully.`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Please provide both Full Name and Email address.');
      showAlert({
        title: 'Required Information Missing',
        message: 'Please fill in Full Name and Email address to proceed.',
        type: 'warning'
      });
      return;
    }

    const bObj = branches.find(b => b.id === branchId);
    const brandObj = brands.find(b => b.id === brandId);
    const branchDisplayName =
      role === 'Admin'
        ? 'All Brands / All Branches'
        : `${brandObj?.brand_code || 'BYD'} ${bObj?.branch_name || ''}`;

    const profileData: Partial<User> = {
      name: name.trim(),
      email: email.trim(),
      role,
      brand_id: brandId,
      branch_id: branchId,
      branch: branchDisplayName,
      status,
      default_brand_id: brandId,
      default_branch_id: branchId,
      default_sa: defaultSa.trim() || name.trim(),
      ...(password ? { password } : {})
    };

    if (editingUser) {
      updateUser(editingUser.id, profileData);
      showToast({
        type: 'success',
        title: 'Staff Profile Updated',
        message: `Changes to ${name} have been saved successfully.`
      });
    } else {
      addUser(profileData as any);
      showToast({
        type: 'success',
        title: 'Staff Member Created',
        message: `Account for ${name} has been added to the system.`
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 font-heading tracking-tight">
              User & Access Control Management
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure User Credentials & Default Receipt Profiles for seamless receipt auto-fill.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-heading font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200/90">
                <th className="py-3.5 px-5">User Name</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Assigned Brand & Branch</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Created Date</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/90 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-3 font-heading text-sm">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs ${
                        u.role === 'Admin' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'Admin'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {u.role === 'Admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{u.branch}</span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {u.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-medium">{u.created_date}</td>
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-2xs cursor-pointer"
                        title="Edit User & Default Receipt Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redesigned Portal Modal: Add / Edit User */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="2xl"
        title={editingUser ? `Edit Staff Profile: ${editingUser.name}` : 'Add New Staff User'}
        subtitle="Configure authentication credentials, access role, and default receipt auto-fill values."
        icon={
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
            {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </div>
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              {editingUser ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{editingUser ? 'Save Profile Changes' : 'Create Staff Member'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Dynamic Live Staff Preview Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Live Staff User Preview
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                {status}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-lg transition-colors ${
                  role === 'Admin' ? 'bg-red-600 ring-2 ring-red-400/40' : 'bg-blue-600 ring-2 ring-blue-400/40'
                }`}
              >
                {name ? name.charAt(0).toUpperCase() : '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black tracking-tight truncate">
                    {name || 'New Staff Member'}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      role === 'Admin' ? 'bg-red-500/30 text-red-200 border border-red-500/40' : 'bg-blue-500/30 text-blue-200 border border-blue-500/40'
                    }`}
                  >
                    {role === 'Admin' ? <Shield className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                    {role}
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                  {email || 'username@byd-cambodia.com'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {role === 'Admin'
                      ? 'Global Admin (All Brands & Branches)'
                      : `${selectedBrand?.brand_name || 'BYD'} • ${selectedBranch?.branch_name || 'Siem Reap Center'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION A: LOGIN & ACCOUNT INFORMATION */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-heading flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-red-600" />
                Section A: Login & Access Credentials
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => {
                      const newName = e.target.value;
                      setName(newName);
                      if (!defaultSa || defaultSa === name) setDefaultSa(newName);
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username / Email <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="alex@byd-cambodia.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password {editingUser && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={editingUser ? '••••••••' : 'password123'}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Active')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      status === 'Active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Inactive')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      status === 'Inactive'
                        ? 'bg-slate-200 border-slate-300 text-slate-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Role Selection Cards */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Assigned Access Role <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Service Advisor Card */}
                <div
                  onClick={() => setRole('Service Advisor')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'Service Advisor'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">Service Advisor</span>
                    </div>
                    {role === 'Service Advisor' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Access to Dashboard, Quotations, Receipts, Customers, Vehicles & Reports.
                  </p>
                </div>

                {/* Admin Card */}
                <div
                  onClick={() => setRole('Admin')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'Admin'
                      ? 'border-red-600 bg-red-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-red-100 text-red-700">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">Administrator</span>
                    </div>
                    {role === 'Admin' && (
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Full System Control across all Brands, Branches, Staff Users, Logs & Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: DEFAULT RECEIPT PROFILE */}
          <div className="bg-red-50/40 p-4.5 rounded-2xl border border-red-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
              <div>
                <h4 className="text-xs font-black uppercase text-red-900 tracking-wider font-heading flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-red-600" />
                  Section B: Default Receipt Profile
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Pre-fills automatically whenever this user creates new receipts or quotations.
                </p>
              </div>
            </div>

            {/* Brand and Branch Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Select
                  label="Assigned Brand *"
                  value={brandId}
                  onChange={val => {
                    setBrandId(val);
                    const firstBr = branches.find(b => b.brand_id === val)?.id || '';
                    setBranchId(firstBr);
                  }}
                  options={brands.map(b => ({ value: b.id, label: `${b.brand_code} - ${b.brand_name}` }))}
                />
              </div>

              <div>
                <Select
                  label="Assigned Branch *"
                  value={branchId}
                  onChange={setBranchId}
                  options={availableBranches.map(br => ({ value: br.id, label: br.branch_name }))}
                />
              </div>
            </div>

            {/* Service Advisor (SA) Default Signature */}
            <div className="pt-2 border-t border-red-100/80">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Service Advisor (SA) Name for Receipts
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={defaultSa}
                  onChange={e => setDefaultSa(e.target.value)}
                  placeholder={name || 'e.g. Alex Mercer'}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                This name will be stamped on customer receipts generated by this user.
              </p>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
