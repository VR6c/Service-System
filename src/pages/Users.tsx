import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types';
import {
  Users as UsersIcon,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Building2,
  Shield,
  UserCheck
} from 'lucide-react';

export const Users: React.FC = () => {
  const { users, brands, branches, addUser, updateUser, deleteUser, currentUser } = useAuth();

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

  const availableBranches = branches.filter(b => b.brand_id === brandId);

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
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setBrandId(u.default_brand_id || u.brand_id || brands[0]?.id || '');
    setBranchId(u.default_branch_id || u.branch_id || branches[0]?.id || '');

    setDefaultSa(u.default_sa || u.name);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in Name and Email.');
      return;
    }

    const bObj = branches.find(b => b.id === branchId);
    const brandObj = brands.find(b => b.id === brandId);
    const branchDisplayName = role === 'Admin'
      ? 'All Brands / All Branches'
      : `${brandObj?.brand_code || 'BYD'} ${bObj?.branch_name || ''}`;

    const profileData: Partial<User> = {
      name,
      email,
      role,
      brand_id: brandId,
      branch_id: branchId,
      branch: branchDisplayName,
      status,
      default_brand_id: brandId,
      default_branch_id: branchId,
      default_sa: defaultSa || name,
      ...(password ? { password } : {})
    };

    if (editingUser) {
      updateUser(editingUser.id, profileData);
    } else {
      addUser(profileData as any);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 font-heading">User & Access Control Management</h2>
            <p className="text-xs text-slate-500 font-medium">Configure User Credentials & Default Receipt Profiles for seamless receipt auto-fill.</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs ${
                      u.role === 'Admin' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'Admin'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {u.role === 'Admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.branch}</span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
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
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
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

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  {editingUser ? `Edit User Profile: ${editingUser.name}` : 'Create New Staff User Profile'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Configure login access and default receipt auto-fill values.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* SECTION A: LOGIN & ACCOUNT INFORMATION */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-heading flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-red-600" />
                    Section A: Login & Account Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (!defaultSa) setDefaultSa(e.target.value);
                      }}
                      placeholder="e.g. Alex Mercer"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Username / Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Role *</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="Service Advisor">Service Advisor (Dashboard, Receipt, Quotation, Customer, Reports)</option>
                      <option value="Admin">Admin (Full Control)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: DEFAULT RECEIPT PROFILE */}
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 space-y-4">
                <div className="flex items-center justify-between border-b border-red-200/80 pb-2">
                  <div>
                    <h4 className="text-xs font-black uppercase text-red-900 tracking-wider font-heading flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-red-600" />
                      Section B: Default Receipt Profile
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">This information will automatically be used when this user creates a receipt.</p>
                  </div>
                </div>

                {/* Organization Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Organization</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Brand *</label>
                      <select
                        value={brandId}
                        onChange={e => {
                          setBrandId(e.target.value);
                          const firstBr = branches.find(b => b.brand_id === e.target.value)?.id || '';
                          setBranchId(firstBr);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                      >
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.brand_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Branch *</label>
                      <select
                        value={branchId}
                        onChange={e => setBranchId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                      >
                        {availableBranches.map(br => (
                          <option key={br.id} value={br.id}>{br.branch_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Service Advisor Default */}
                <div className="space-y-2 pt-2 border-t border-red-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Receipt Default</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Service Advisor (SA)</label>
                      <input
                        type="text"
                        value={defaultSa}
                        onChange={e => setDefaultSa(e.target.value)}
                        placeholder="e.g. Alex Mercer"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save User Profile Settings' : 'Save & Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
