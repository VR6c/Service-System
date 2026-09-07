import { useState, useMemo, useCallback } from 'react';
import type { FeeItem } from '../types';

interface UseFeeItemsOptions {
  initialItems?: FeeItem[];
  defaultVatRate?: number; // e.g. 0 or 0.1
}

export const useFeeItems = (options: UseFeeItemsOptions = {}) => {
  const { initialItems = [], defaultVatRate = 0 } = options;

  const [feeItems, setFeeItems] = useState<FeeItem[]>(() =>
    initialItems.length > 0
      ? initialItems.map(item => ({ ...item }))
      : [
          {
            id: 'item-1',
            description: '',
            quantity: 1,
            unit_price: 0,
            amount: 0,
            sap_no: '',
            stock_yes_no: 'YES',
            warranty_yes_no: 'NO'
          }
        ]
  );

  const [vatRate] = useState<number>(defaultVatRate);

  const addItem = useCallback(() => {
    setFeeItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0,
        sap_no: '',
        stock_yes_no: 'YES',
        warranty_yes_no: 'NO'
      }
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setFeeItems(prev => {
      if (prev.length <= 1) {
        // Keep at least one item row, reset its values
        return [
          {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unit_price: 0,
            amount: 0,
            sap_no: '',
            stock_yes_no: 'YES',
            warranty_yes_no: 'NO'
          }
        ];
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const updateItem = useCallback((id: string, field: keyof FeeItem, value: any) => {
    setFeeItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const price = field === 'unit_price' ? Number(value) || 0 : item.unit_price;
          updated.amount = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  }, []);

  const subtotal = useMemo(() => {
    return feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  }, [feeItems]);

  const vat = useMemo(() => {
    return Math.round(subtotal * vatRate * 100) / 100;
  }, [subtotal, vatRate]);

  const totalAmount = useMemo(() => {
    return Math.round((subtotal + vat) * 100) / 100;
  }, [subtotal, vat]);

  return {
    feeItems,
    setFeeItems,
    addItem,
    removeItem,
    updateItem,
    subtotal,
    vat,
    totalAmount
  };
};
