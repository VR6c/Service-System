import React from 'react';
import type { FeeItem } from '../../types';
import { Plus, Trash2, Wrench, DollarSign } from 'lucide-react';

interface FeeItemsTableProps {
  feeItems: FeeItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof FeeItem, value: any) => void;
  subtotal: number;
  vat: number;
  totalAmount: number;
  currencySymbol?: string;
  showSapAndStock?: boolean;
  readOnly?: boolean;
}

export const FeeItemsTable: React.FC<FeeItemsTableProps> = ({
  feeItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  subtotal,
  vat,
  totalAmount,
  currencySymbol = '$',
  showSapAndStock = true,
  readOnly = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          Repair & Charge Fee Items
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fee Item
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">Item Description</th>
              {showSapAndStock && <th className="py-3 px-3 w-28">SAP No</th>}
              {showSapAndStock && <th className="py-3 px-3 w-20 text-center">Stock</th>}
              {showSapAndStock && <th className="py-3 px-3 w-24 text-center">Warranty</th>}
              <th className="py-3 px-3 w-24 text-right">Qty</th>
              <th className="py-3 px-3 w-32 text-right">Unit Price</th>
              <th className="py-3 px-3 w-32 text-right">Amount</th>
              {!readOnly && <th className="py-3 px-3 w-12 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {feeItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition">
                <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.description}
                    onChange={e => onUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Enter item or service description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </td>
                {showSapAndStock && (
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={item.sap_no || ''}
                      onChange={e => onUpdateItem(item.id, 'sap_no', e.target.value)}
                      placeholder="SAP-001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-[11px] font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </td>
                )}
                {showSapAndStock && (
                  <td className="py-2.5 px-3 text-center">
                    <select
                      disabled={readOnly}
                      value={item.stock_yes_no || 'YES'}
                      onChange={e => onUpdateItem(item.id, 'stock_yes_no', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                )}
                {showSapAndStock && (
                  <td className="py-2.5 px-3 text-center">
                    <select
                      disabled={readOnly}
                      value={item.warranty_yes_no || 'NO'}
                      onChange={e => onUpdateItem(item.id, 'warranty_yes_no', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                )}
                <td className="py-2.5 px-3 text-right">
                  <input
                    type="number"
                    min="1"
                    disabled={readOnly}
                    value={item.quantity}
                    onChange={e => onUpdateItem(item.id, 'quantity', e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="py-2.5 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={readOnly}
                    value={item.unit_price}
                    onChange={e => onUpdateItem(item.id, 'unit_price', e.target.value)}
                    className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                  {currencySymbol}
                  {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {!readOnly && (
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-100">
        {!readOnly && (
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add line item
          </button>
        )}
        <div className="w-full sm:w-72 bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-200/80 ml-auto">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Subtotal:</span>
            <span className="font-extrabold text-slate-900">
              {currencySymbol}
              {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {vat > 0 && (
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>VAT:</span>
              <span className="font-extrabold text-slate-900">
                {currencySymbol}
                {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Amount:</span>
            <span className="text-blue-600 font-heading">
              {currencySymbol}
              {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
