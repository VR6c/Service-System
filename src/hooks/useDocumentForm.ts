import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  const isSA = currentUser?.role === 'Service Advisor';
  const saBranchId = currentUser?.branch_id || currentUser?.default_branch_id;

  const saAssignedBrands: string[] = useMemo(() => {
    if (!currentUser) return brands.map(b => b.id);
    if (currentUser.role === 'Admin') return brands.map(b => b.id);
    if (currentUser.assigned_brand_ids && currentUser.assigned_brand_ids.length > 0) {
      return currentUser.assigned_brand_ids;
    }
    // Fallback if SA has no assigned_brand_ids explicitly set:
    const userBranch = branches.find(b => b.id === (currentUser.branch_id || currentUser.default_branch_id));
    if (userBranch?.supported_brand_ids && userBranch.supported_brand_ids.length > 0) {
      return userBranch.supported_brand_ids;
    }
    const defaultB = currentUser.active_brand_id || currentUser.default_brand_id || currentUser.brand_id || brands[0]?.id || 'brand-byd';
    return [defaultB];
  }, [currentUser, brands, branches]);

  const isSingleBrandLocked = isSA && saAssignedBrands.length === 1;
  const isDualBrandSA = isSA && saAssignedBrands.length >= 2;
  const isBranchLocked = isSA;

  // Helper to find default branch for selected brand
  const getPreferredBranchId = useCallback(
    (targetBrandId: string, currentBranchList: Branch[]) => {
      if (isSA && saBranchId) {
        const saBranch = currentBranchList.find(b => b.id === saBranchId);
        if (
          saBranch &&
          ((saBranch.supported_brand_ids && saBranch.supported_brand_ids.includes(targetBrandId)) ||
            saBranch.brand_id === targetBrandId)
        ) {
          return saBranchId;
        }
      }
      const brandBranches = currentBranchList.filter(
        br =>
          (br.supported_brand_ids && br.supported_brand_ids.includes(targetBrandId)) ||
          br.brand_id === targetBrandId
      );
      const userAssignedBranchId = currentUser?.default_branch_id || currentUser?.branch_id;
      const userMatch = brandBranches.find(br => br.id === userAssignedBranchId);
      if (userMatch) return userMatch.id;
      return brandBranches[0]?.id || currentBranchList[0]?.id || '';
    },
    [currentUser, isSA, saBranchId]
  );

  const getDefaultBrandIdForUser = useCallback(() => {
    if (options.initialBrandId) return options.initialBrandId;
    if (isSA) {
      if (currentUser?.active_brand_id && saAssignedBrands.includes(currentUser.active_brand_id)) {
        return currentUser.active_brand_id;
      }
      return saAssignedBrands[0] || 'brand-byd';
    }
    if (currentUser?.active_brand_id && brands.some(b => b.id === currentUser.active_brand_id)) {
      return currentUser.active_brand_id;
    }
    return currentUser?.default_brand_id || currentUser?.brand_id || brands[0]?.id || 'brand-byd';
  }, [options.initialBrandId, isSA, currentUser, saAssignedBrands, brands]);

  const [selectedBrandId, setSelectedBrandId] = useState<string>(() => {
    return getDefaultBrandIdForUser();
  });

  const availableBranches = useMemo(() => {
    if (isSA && saBranchId) {
      return branches.filter(b => b.id === saBranchId);
    }
    return branches.filter(
      b =>
        (b.supported_brand_ids && b.supported_brand_ids.includes(selectedBrandId)) ||
        b.brand_id === selectedBrandId
    );
  }, [isSA, saBranchId, branches, selectedBrandId]);

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (options.initialBranchId) return options.initialBranchId;
    if (isSA && saBranchId) return saBranchId;
    const initialBrand = getDefaultBrandIdForUser();
    return getPreferredBranchId(initialBrand, branches) || branches[0]?.id || '';
  });

  // Keep branch in sync when brand changes
  const handleBrandChange = useCallback(
    (newBrandId: string) => {
      if (isSA && !saAssignedBrands.includes(newBrandId)) {
        return;
      }
      setSelectedBrandId(newBrandId);
      if (!isSA) {
        const currentBranchObj = branches.find(b => b.id === selectedBranchId);
        const isCurrentBranchSupported =
          currentBranchObj &&
          ((currentBranchObj.supported_brand_ids && currentBranchObj.supported_brand_ids.includes(newBrandId)) ||
            currentBranchObj.brand_id === newBrandId);
        if (!isCurrentBranchSupported) {
          const preferredBranchId = getPreferredBranchId(newBrandId, branches);
          setSelectedBranchId(preferredBranchId || '');
        }
      }
    },
    [isSA, saAssignedBrands, branches, selectedBranchId, getPreferredBranchId]
  );

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
  const currentBranch: Branch | undefined =
    branches.find(b => b.id === selectedBranchId) || availableBranches[0] || branches[0];

  // Sync brand and branch ONLY when currentUser genuinely changes (switch user) or initial mount
  const prevUserIdRef = useRef<string | undefined>(currentUser?.id);

  useEffect(() => {
    if (options.initialBrandId) return;

    if (prevUserIdRef.current !== currentUser?.id) {
      prevUserIdRef.current = currentUser?.id;

      const targetBrandId = isSA
        ? (currentUser?.active_brand_id && saAssignedBrands.includes(currentUser.active_brand_id)
            ? currentUser.active_brand_id
            : saAssignedBrands[0] || 'brand-byd')
        : (currentUser?.active_brand_id || currentUser?.default_brand_id || currentUser?.brand_id || brands[0]?.id || 'brand-byd');

      if (brands.some(b => b.id === targetBrandId)) {
        setSelectedBrandId(targetBrandId);
        const prefBranch = getPreferredBranchId(targetBrandId, branches);
        if (prefBranch) setSelectedBranchId(prefBranch);
      }
    }
  }, [currentUser?.id, options.initialBrandId, isSA, saAssignedBrands, brands, branches, getPreferredBranchId, currentUser]);

  // Safety constraint: If user is an SA and the selected brand is not among their assigned brands, adjust to their allowed brand
  useEffect(() => {
    if (options.initialBrandId) return;
    if (isSA && saAssignedBrands.length > 0 && !saAssignedBrands.includes(selectedBrandId)) {
      const validBrand = saAssignedBrands[0];
      setSelectedBrandId(validBrand);
      const prefBranch = getPreferredBranchId(validBrand, branches);
      if (prefBranch) setSelectedBranchId(prefBranch);
    }
  }, [isSA, saAssignedBrands, selectedBrandId, options.initialBrandId, branches, getPreferredBranchId]);

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
    isSA,
    saAssignedBrands,
    isSingleBrandLocked,
    isDualBrandSA,
    isBranchLocked,
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
