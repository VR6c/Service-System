import React from 'react';
import type { Brand, Branch } from '../../types';
import { BYDLogo } from './BYDLogo';
import { DENZALogo } from './DENZALogo';
import { Building2, ShieldCheck } from 'lucide-react';
import { Select } from './Select';

interface BrandBranchSelectorProps {
  brands: Brand[];
  branches: Branch[];
  selectedBrandId: string;
  selectedBranchId: string;
  onBrandChange: (brandId: string) => void;
  onBranchChange: (branchId: string) => void;
  readOnly?: boolean;
  isBranchLocked?: boolean;
  isBrandLocked?: boolean;
}

export const BrandBranchSelector: React.FC<BrandBranchSelectorProps> = ({
  brands,
  branches,
  selectedBrandId,
  selectedBranchId,
  onBrandChange,
  onBranchChange,
  readOnly = false,
  isBranchLocked = false,
  isBrandLocked = false
}) => {
  const currentBrand = brands.find(b => b.id === selectedBrandId) || brands[0];
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const availableBranches = branches.filter(b =>
    (b.supported_brand_ids && b.supported_brand_ids.includes(selectedBrandId)) ||
    b.brand_id === selectedBrandId
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Brand & Service Center Selection
        </h3>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
          Organization Profile
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand Selector Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Automotive Brand
            </label>
            {isBrandLocked && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Single-Brand Assigned
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {brands.map(brand => {
              const isSelected = brand.id === selectedBrandId;
              const isByd = brand.logo_type === 'byd' || brand.brand_code === 'BYD';
              const isDisabled = readOnly || (isBrandLocked && !isSelected);

              return (
                <button
                  key={brand.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onBrandChange(brand.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''
                  } ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center p-1 shrink-0">
                    {isByd ? <BYDLogo className="w-full h-full" /> : <DENZALogo className="w-full h-full text-slate-900" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{brand.brand_name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{brand.brand_code}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Branch / Service Center Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Service Center Branch</span>
            {isBranchLocked && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Workshop Floor Locked (1 Branch)
              </span>
            )}
          </div>
          <Select
            label=""
            disabled={readOnly || isBranchLocked}
            value={selectedBranchId}
            onChange={onBranchChange}
            options={availableBranches.map(branch => ({
              value: branch.id,
              label: `${branch.branch_name} (${branch.branch_code})`
            }))}
          />
          {currentBrand && (
            <p className="text-[11px] text-slate-500 font-medium mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Document prefix: <span className="font-bold text-slate-800">{currentBrand.document_prefix}</span>
              {currentBranch && <span className="text-slate-400">• {currentBranch.branch_name}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
