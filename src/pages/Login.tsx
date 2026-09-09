import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { BYDLogo } from '../components/common/BYDLogo';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const settings = StorageService.getSettings();
  const customLogoUrl = settings.byd_logo_url || settings.header_logo_url || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Soft Red & Blue Ambient Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-red-100/60 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-slate-200/60 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative z-10">
        {/* Logo Header - Centered without Sales & Service subtext */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4 min-h-[48px]">
            {customLogoUrl ? (
              <img src={customLogoUrl} alt="Logo" className="h-14 max-w-[220px] object-contain mx-auto" />
            ) : (
              <BYDLogo variant="red" className="h-12" showSubtext={false} />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">Sales & Service Portal</h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">BYD Official Quotation & Receipt System</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all"
                placeholder="user@byd.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/25 transition-all"
          >
            <span>Sign In to BYD System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
