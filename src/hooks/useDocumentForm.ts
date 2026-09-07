import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Brand, Branch } from '../types';

interface UseDocumentFormOptions {
  initialBrandId?: string;
  initialBranchId?: string;
  initialCustomerName?: string;
  initialPhone?: string;
  initialPlateNo?: string;
  initialVehicleModel?: string;
  initialColor?: string;
  initialVin?: string;
  initialMileage?: number;
  initialBattery?: string;
  initialDescription?: string;
}

export const useDocumentForm = (options: UseDocumentFormOptions = {}) => {
  const { currentUser, brands, branches } = useAuth();

  // Helper to find default branch for selected brand
  const getPreferredBranchId = useCallback(
    (targetBrandId: string, currentBranchList: Branch[]) => {
      const brandBranches = currentBranchList.filter(br => br.brand_id === targetBrandId);
      const userAssignedBranchId = currentUser?.default_branch_id || currentUser?.branch_id;
      const userMatch = brandBranches.find(br => br.id === userAssignedBranchId);
      if (userMatch) return userMatch.id;
      return brandBranches[0]?.id || '';
    },
    [currentUser]
  );

  const [selectedBrandId, setSelectedBrandId] = useState<string>(() => {
    return (
      options.initialBrandId ||
      currentUser?.default_brand_id ||
      currentUser?.brand_id ||
      brands[0]?.id ||
      'brand-byd'
    );
  });

  const availableBranches = branches.filter(b => b.brand_id === selectedBrandId);

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return (
      options.initialBranchId ||
      getPreferredBranchId(selectedBrandId, branches) ||
      availableBranches[0]?.id ||
      ''
    );
  });

  // Keep branch in sync when brand changes
  const handleBrandChange = (newBrandId: string) => {
    setSelectedBrandId(newBrandId);
    const newAvailable = branches.filter(b => b.brand_id === newBrandId);
    const preferredBranchId = getPreferredBranchId(newBrandId, branches);
    setSelectedBranchId(preferredBranchId || newAvailable[0]?.id || '');
  };

  // Customer & Vehicle State
  const [customerName, setCustomerName] = useState<string>(options.initialCustomerName || '');
  const [phone, setPhone] = useState<string>(options.initialPhone || '');
  const [plateNo, setPlateNo] = useState<string>(options.initialPlateNo || '');
  const [vehicleModel, setVehicleModel] = useState<string>(options.initialVehicleModel || '');
  const [color, setColor] = useState<string>(options.initialColor || '');
  const [vin, setVin] = useState<string>(options.initialVin || '');
  const [mileage, setMileage] = useState<number>(options.initialMileage ?? 0);
  const [battery, setBattery] = useState<string>(options.initialBattery || 'SoC 85%');
  const [description, setDescription] = useState<string>(options.initialDescription || '');

  // Active brand and branch objects
  const currentBrand: Brand | undefined = brands.find(b => b.id === selectedBrandId) || brands[0];
  const currentBranch: Branch | undefined = availableBranches.find(b => b.id === selectedBranchId) || availableBranches[0];

  useEffect(() => {
    if (!options.initialBrandId && currentUser) {
      const targetBrandId = currentUser.default_brand_id || currentUser.brand_id || brands[0]?.id || 'brand-byd';
      if (brands.some(b => b.id === targetBrandId)) {
        setSelectedBrandId(targetBrandId);
        const prefBranch = getPreferredBranchId(targetBrandId, branches);
        if (prefBranch) setSelectedBranchId(prefBranch);
      }
    }
  }, [currentUser, brands, branches, options.initialBrandId, getPreferredBranchId]);

  return {
    brands,
    branches,
    availableBranches,
    selectedBrandId,
    setSelectedBrandId: handleBrandChange,
    selectedBranchId,
    setSelectedBranchId,
    currentBrand,
    currentBranch,
    customerName,
    setCustomerName,
    phone,
    setPhone,
    plateNo,
    setPlateNo,
    vehicleModel,
    setVehicleModel,
    color,
    setColor,
    vin,
    setVin,
    mileage,
    setMileage,
    battery,
    setBattery,
    description,
    setDescription
  };
};
