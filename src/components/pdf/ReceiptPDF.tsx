import React from 'react';
import type { Receipt, Brand, Branch, SystemSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { BYDLogo } from '../common/BYDLogo';
import { DENZALogo } from '../common/DENZALogo';

interface ReceiptPDFProps {
  receipt: Receipt;
  brand?: Brand;
  branch?: Branch;
  settings?: SystemSettings;
  documentId?: string;
  className?: string;
}

const CheckBox: React.FC<{ checked?: boolean; label?: string }> = ({ checked = false, label }) => (
  <span className="inline-flex items-center gap-1.5 cursor-default select-none">
    <span className={`w-3.5 h-3.5 border border-black flex items-center justify-center font-bold text-[10px] leading-none shrink-0 ${checked ? 'bg-black text-white' : 'bg-white text-transparent'}`}>
      ✓
    </span>
    {label && <span className="text-[9.5pt] text-black font-semibold">{label}</span>}
  </span>
);

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  receipt,
  brand,
  branch,
  settings,
  documentId = 'receipt-pdf-document',
  className = ''
}) => {
  const brands = StorageService.getBrands();
  const matchedBrand = brand || brands.find(b => 
    b.id === receipt.brand_id ||
    (receipt.brand_name && (b.brand_name.toLowerCase() === receipt.brand_name.toLowerCase() || b.brand_code.toLowerCase() === receipt.brand_name.toLowerCase())) ||
    receipt.receipt_no.toUpperCase().startsWith(b.receipt_prefix.toUpperCase())
  );

  const isDenza = (matchedBrand?.brand_code || receipt.brand_name || '').toUpperCase().includes('DENZA') ||
    receipt.receipt_no.toUpperCase().startsWith('DENZA');

  // Guard against null/undefined receipt
  if (!receipt) return null;

  // Fill up to 5 rows for authentic document height matching File 1
  const rawItems = Array.isArray(receipt.fee_items) ? receipt.fee_items : [];
  const displayedItems = rawItems.map((item, idx) => ({
    ...item,
    id: item?.id || `item-${idx}`,
    description: item?.description || '',
    quantity: Number(item?.quantity) || 0,
    unit_price: Number(item?.unit_price) || 0,
    amount: Number(item?.amount) || 0,
    sap_no: item?.sap_no || '',
    stock_yes_no: item?.stock_yes_no || 'YES',
    warranty_yes_no: item?.warranty_yes_no || 'YES'
  }));

  while (displayedItems.length < 5) {
    displayedItems.push({
      id: `empty-${displayedItems.length}`,
      description: '',
      quantity: 0,
      unit_price: 0,
      amount: 0,
      sap_no: '',
      stock_yes_no: 'YES',
      warranty_yes_no: 'YES'
    });
  }

  // Header Info - customizable via Settings & Brand/Branch
  const logoType = matchedBrand?.logo_type || settings?.header_logo_type || (isDenza ? 'denza' : 'byd');
  const customLogoUrl = matchedBrand?.logo_url || (isDenza ? settings?.denza_logo_url : settings?.byd_logo_url) || settings?.header_logo_url || '';

  const centerTitle = matchedBrand?.service_center_name || settings?.receipt_header_english_title || 'BYD SALES & SERVICE CENTER';
  const localTitle = matchedBrand?.local_company_name || settings?.receipt_header_khmer_title || 'មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ';
  const phoneText = branch?.telephone || matchedBrand?.telephone || settings?.phone || '+855 63 965 432';
  const addressText = branch?.address || matchedBrand?.address || settings?.address || 'National Road 6, Svay Dangkum, Siem Reap';

  return (
    <div
      id={documentId}
      className={`receipt-print-page bg-white text-black mx-auto font-sans leading-tight select-none box-border shadow-md print:shadow-none border border-slate-200 print:border-none ${className}`}
    >
      {/* Master Outer Frame Box matching File 1 with 190mm content width */}
      <div className="receipt-content border border-black">
        {/* Top Header Grid */}
        <div className="grid grid-cols-4 border-b border-black min-h-[95px]">
          {/* Header Left (Logo + Centered Titles + Bottom Contact Info) */}
          <div className="col-span-3 p-2.5 border-r border-black flex flex-col justify-between">
            {/* Top Row: Logo Left + Centered Header Titles */}
            <div className="flex items-start justify-between">
              <div className="shrink-0 pt-0.5 max-w-[130px] overflow-hidden">
                {customLogoUrl && customLogoUrl.trim() !== '' ? (
                  <img src={customLogoUrl} alt="Logo" className="h-10 object-contain" />
                ) : logoType === 'denza' || isDenza ? (
                  <DENZALogo variant="blue" className="h-10" />
                ) : (
                  <BYDLogo variant="red" className="h-10" />
                )}
              </div>

              <div className="flex-1 text-center pr-4">
                <h1 className="text-[13pt] font-extrabold text-black uppercase tracking-tight font-sans leading-tight">
                  {centerTitle}
                </h1>
                <p className="text-[11.5pt] font-bold text-black font-muol leading-snug mt-0.5">
                  {localTitle}
                </p>
              </div>
            </div>

            {/* Bottom Contact Lines */}
            <div className="text-[9.5pt] text-black leading-tight space-y-0.5 pt-1.5">
              <p>Tel: <span className="font-semibold">{phoneText}</span></p>
              <p>Add: <span className="font-normal">{addressText}</span></p>
            </div>
          </div>

          {/* Header Right (Receipt Number Box) */}
          <div className="col-span-1 p-2 flex items-center justify-center text-center font-mono font-bold text-[14pt] tracking-tight text-black self-stretch">
            <span className="leading-none">{receipt.receipt_no}</span>
          </div>
        </div>

        {/* SA & Time Bar */}
        <div className="grid grid-cols-3 border-b border-black text-[10pt] font-medium py-1.5 px-3 bg-white">
          <div className="text-left">
            SA: <span className="font-bold text-black">{receipt.sa_name || receipt.created_by_name || ''}</span>
          </div>
          <div className="text-center">
            In Time: <span className="font-bold text-black">{receipt.in_time || 'AM'}</span>
          </div>
          <div className="text-right">
            Out Time: <span className="font-bold text-black">{receipt.out_time || 'PM'}</span>
          </div>
        </div>

        {/* Customer & Vehicle Grid */}
        <table className="w-full border-collapse border-b border-black text-[9.5pt] table-fixed">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[22%] p-2 font-medium border-r border-black align-top">
                <div className="space-y-1.5">
                  <div>
                    <CheckBox checked={receipt.is_owner !== false} label="Owner" />
                  </div>
                  <div>
                    <CheckBox checked={receipt.is_sender === true} label="Sender" />
                  </div>
                </div>
              </td>
              <td className="p-2 border-r border-black align-top w-[35%]">
                <div className="flex justify-between">
                  <span className="font-normal w-16">Name:</span>
                  <span className="font-bold text-black flex-1 truncate">{receipt.customer_name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-normal w-16">Battery:</span>
                  <span className="font-semibold text-black flex-1">{receipt.battery || ''}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-normal w-16">Milage:</span>
                  <span className="font-semibold text-black flex-1">
                    {receipt.mileage ? `${Number(receipt.mileage).toLocaleString()} km` : ''}
                  </span>
                </div>
              </td>
              <td className="p-2 border-r border-black align-top w-[25%]">
                <div className="flex justify-between">
                  <span className="font-normal w-12">Tel:</span>
                  <span className="font-bold text-black flex-1">{receipt.phone}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-normal w-12">Model:</span>
                  <span className="font-semibold text-black flex-1 truncate">{receipt.vehicle_model}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-normal w-12">VIN No.:</span>
                  <span className="font-mono text-[9pt] font-semibold text-black flex-1 truncate">{receipt.vin}</span>
                </div>
              </td>
              <td className="p-2 align-top w-[18%]">
                <div className="flex justify-between">
                  <span className="font-normal w-16">Plate No.</span>
                  <span className="font-bold text-black flex-1">{receipt.plate_no}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-normal w-16">Color:</span>
                  <span className="font-semibold text-black flex-1">{receipt.color}</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-normal border-r border-black">Buy Time:</td>
              <td colSpan={3} className="p-2 font-semibold text-black">
                {receipt.buy_time || ''}
              </td>
            </tr>
            <tr>
              <td className="p-2 font-normal border-r border-black">Description:</td>
              <td colSpan={3} className="p-2 font-semibold text-black leading-snug">
                {receipt.description || ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Repair and Charge Fee Section */}
        <div>
          <div className="text-center font-bold text-[10.5pt] py-1.5 border-b border-black tracking-wider uppercase">
            Repair and Charge Fee
          </div>

          <table className="w-full border-collapse text-[9.5pt] table-fixed">
            <thead>
              <tr className="border-b border-black text-center font-bold text-[9.5pt]">
                <th className="py-1.5 px-2 border-r border-black text-center w-[32%]">Spare Part</th>
                <th className="py-1.5 px-2 border-r border-black text-center w-[14%]">SAP No.</th>
                <th className="py-1.5 px-2 border-r border-black text-center w-[9%]">Quantity</th>
                <th className="py-1.5 px-2 border-r border-black text-center w-[13%]">Price</th>
                <th className="py-1.5 px-2 border-r border-black text-center w-[16%]">Stock</th>
                <th className="py-1.5 px-2 text-center w-[16%]">Warranty</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item, idx) => (
                <tr key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="border-b border-black text-center h-8 break-inside-avoid">
                  <td className="py-1 px-2.5 border-r border-black text-left font-medium truncate">
                    {item.description}
                  </td>
                  <td className="py-1 px-2 border-r border-black font-mono text-[9pt] text-center">
                    {item.sap_no || (item.description ? `${isDenza ? 'DNZ' : 'BYD'}-${1000 + idx}` : '')}
                  </td>
                  <td className="py-1 px-2 border-r border-black font-semibold text-center">
                    {item.quantity > 0 ? item.quantity : ''}
                  </td>
                  <td className="py-1 px-2 border-r border-black font-mono font-semibold text-right">
                    {Number(item.unit_price) > 0 ? `$${Number(item.unit_price).toFixed(2)}` : ''}
                  </td>
                  <td className="py-1 px-1 border-r border-slate-800 border-r border-black text-[9pt] text-center align-middle">
                    {item.description ? (
                      <div className="flex items-center justify-center gap-1.5 w-full text-center">
                        <CheckBox checked={item.stock_yes_no !== 'NO'} label="YES" />
                        <CheckBox checked={item.stock_yes_no === 'NO'} label="NO" />
                      </div>
                    ) : null}
                  </td>
                  <td className="py-1 px-1 text-[9pt] text-center align-middle">
                    {item.description ? (
                      <div className="flex items-center justify-center gap-1.5 w-full text-center">
                        <CheckBox checked={item.warranty_yes_no !== 'NO'} label="YES" />
                        <CheckBox checked={item.warranty_yes_no === 'NO'} label="NO" />
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}

              {/* Amount Included VAT10% Row */}
              <tr style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="border-b border-black font-bold break-inside-avoid">
                <td colSpan={4} className="py-2 px-3 border-r border-black">
                  <div className="flex justify-between items-center text-[10.5pt]">
                    <span>Amount included VAT10% ( USD ) :</span>
                    <span className="font-mono text-[11pt] font-extrabold text-black">
                      $ {Number(receipt.total_amount) > 0 ? Number(receipt.total_amount).toFixed(2) : '-'}
                    </span>
                  </div>
                </td>
                <td colSpan={2} className="py-2 px-3 align-top text-[9.5pt]">
                  Warehouse Keeper: <span className="font-normal">{receipt.warehouse_keeper || ''}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Middle Section: Service Reminder & Repair Confirm */}
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="grid grid-cols-3 border-b border-black break-inside-avoid">
          {/* Left Column (Service Reminder & Disclaimers) */}
          <div className="col-span-2 p-2.5 border-r border-black space-y-1.5 text-[9.5pt] leading-tight">
            <div>
              Estimated Repaired Date: <span className="font-bold">{receipt.estimated_repaired_date || ''}</span>
            </div>

            <div className="font-bold text-[10pt] mt-1">Service reminder:</div>
            <p className="text-black font-medium">{receipt.service_reminder || ''}</p>

            <div className="flex items-center gap-4 pt-1">
              <span className="font-normal">*Repair old parts ( non-claimed parts ) processing:</span>
              <CheckBox checked={receipt.old_parts_action !== 'Give up'} label="Take away" />
              <CheckBox checked={receipt.old_parts_action === 'Give up'} label="Give up" />
            </div>

            <p className="text-black text-[8.5pt] pt-1 leading-tight">
              *The above repair quotation is currently checked and determined to be repaired. If there are other items, the customer will be notified in advance and the repair will be continued after confirmation.
            </p>
            <p className="text-black text-[8.5pt] leading-tight">
              *Customers have been reminded to take the valuables in the car away from the car and keep them properly.
            </p>
          </div>

          {/* Right Column (Customer Signature Box) */}
          <div className="col-span-1 p-2.5 flex flex-col justify-between text-[9.5pt]">
            <span className="font-normal text-black">Repair confirm by Customer:</span>
            <div className="h-16 flex items-end justify-center pb-1">
              <span className="text-black font-semibold text-[10pt]">{receipt.repair_confirm_customer || receipt.customer_name || ''}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Complete & Delivery */}
        <div>
          <div className="text-center font-bold text-[10.5pt] py-1.5 border-b border-black tracking-wider uppercase">
            *****Complete & Delivery*****
          </div>

          <table className="w-full border-collapse text-center text-[9.5pt] table-fixed">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="py-1.5 px-2 border-r border-black w-1/4 font-bold">Technician</th>
                <th className="py-1.5 px-2 border-r border-black w-1/4 font-bold">Finished Date</th>
                <th className="py-1.5 px-2 border-r border-black w-1/4 font-bold">QA</th>
                <th className="py-1.5 px-2 w-1/4 font-bold">ASS-Manager Confirm</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black h-9 align-bottom">
                <td className="py-1 px-2 border-r border-black font-semibold">{receipt.completion?.technician || ''}</td>
                <td className="py-1 px-2 border-r border-black font-semibold">{receipt.completion?.finished_date || ''}</td>
                <td className="py-1 px-2 border-r border-black font-semibold">{receipt.completion?.qa || ''}</td>
                <td className="py-1 px-2 font-semibold">{receipt.completion?.ass_manager_confirm || ''}</td>
              </tr>
              <tr className="border-b border-black font-bold">
                <td className="py-1.5 px-2 border-r border-black font-bold">Delivery Date</td>
                <td className="py-1.5 px-2 border-r border-black font-bold">Delivery Person</td>
                <td className="py-1.5 px-2 border-r border-black font-bold">Accounting</td>
                <td className="py-1.5 px-2 font-bold">Delivery Confirm by Customer</td>
              </tr>
              <tr className="h-9 align-bottom">
                <td className="py-1 px-2 border-r border-black font-semibold">{receipt.completion?.delivery_date || ''}</td>
                <td className="py-1 px-2 border-r border-black font-semibold">{receipt.completion?.delivery_person || ''}</td>
                <td className="py-1 px-2 border-r border-black font-semibold text-black">{receipt.completion?.accounting || ''}</td>
                <td className="py-1 px-2 font-semibold">{receipt.completion?.customer_confirm || receipt.customer_name || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
