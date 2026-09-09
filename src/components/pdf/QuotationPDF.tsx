import React from 'react';
import type { Quotation, Brand, SystemSettings, Branch } from '../../types';
import { StorageService } from '../../services/storageService';
import { BYDLogo } from '../common/BYDLogo';
import { DENZALogo } from '../common/DENZALogo';

interface QuotationPDFProps {
  quotation: Quotation;
  brand?: Brand;
  settings?: SystemSettings;
  branch?: Branch;
}

export const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotation, brand, settings, branch: _branch }) => {
  const currentSettings = settings || StorageService.getSettings();
  const brands = StorageService.getBrands();
  const matchedBrand = brand || brands.find(b => 
    (quotation.brand_name && (b.brand_name.toLowerCase() === quotation.brand_name.toLowerCase() || b.brand_code.toLowerCase() === quotation.brand_name.toLowerCase())) ||
    quotation.quotation_no.toUpperCase().startsWith(b.document_prefix.toUpperCase())
  );

  const isDenza = (matchedBrand?.brand_code || quotation.brand_name || '').toUpperCase().includes('DENZA') ||
    quotation.quotation_no.toUpperCase().startsWith('DENZA');

  const logoType = matchedBrand?.logo_type || currentSettings?.header_logo_type || (isDenza ? 'denza' : 'byd');
  const customLogoUrl = matchedBrand?.logo_url || (isDenza ? currentSettings?.denza_logo_url : currentSettings?.byd_logo_url) || currentSettings?.header_logo_url || '';

  const englishTitle = matchedBrand?.service_center_name || currentSettings?.quotation_header_english_title || 'Huan Ya He Zhong (Cambodia) Trading Co., Ltd';
  const khmerTitle = matchedBrand?.local_company_name || currentSettings?.quotation_header_khmer_title || 'ហ័ន យ៉ា ហ៊ឺ ​ ចុង (ខេមបូឌា) ត្រេឌីង ឯ.ក';
  const phoneText = matchedBrand?.telephone || currentSettings?.phone || '023 886 687';
  const addressText = matchedBrand?.address || currentSettings?.address || 'Lot No. 52 National Road 6A Phum Dermkor, S. Chroycheongva, K. Chroychongva, Phnom Penh';

  const rawTerms = currentSettings?.quotation_terms || [
    currentSettings?.quotation_deposit_term || '1. Will deposit 30% of full amount.',
    currentSettings?.quotation_payment_term || '2. The remaining needs to be paid after the maintenance is completed.',
    currentSettings?.quotation_bank_details || '3. ABA: HUAN YA HE ZHONG (CAMBODIA) TRADING CO LTD (002 886 771)',
    currentSettings?.quotation_expiration_term || '4. This Quotation will Expire in 30 days and will renew this quote again.'
  ].join('\n');

  const termsList = rawTerms.split('\n').map(t => t.trim()).filter(Boolean);

  // Fill up table rows to minimum 4 rows for clean print appearance
  const displayItems = [...quotation.fee_items];
  while (displayItems.length < 4) {
    displayItems.push({
      id: `empty-${displayItems.length}`,
      description: '',
      quantity: 0,
      unit_price: 0,
      amount: 0,
      sap_no: '',
      paint_check: ''
    });
  }

  return (
    <div id="quotation-pdf-document" className="receipt-print-page bg-white text-slate-900 mx-auto font-sans leading-tight text-xs shadow-xl print:shadow-none border border-slate-200 print:border-none p-6">
      <div className="receipt-content space-y-4">
        {/* Header Block */}
        <div className="relative border-b border-slate-300 pb-3">
          {/* Logo Top Left */}
          <div className="absolute left-0 top-0 max-w-[130px] overflow-hidden">
            {customLogoUrl && customLogoUrl.trim() !== '' ? (
              <img src={customLogoUrl} alt="Logo" className="h-10 object-contain" />
            ) : logoType === 'denza' || isDenza ? (
              <DENZALogo variant="blue" className="h-10" />
            ) : (
              <BYDLogo variant="red" className="h-10" />
            )}
          </div>

          {/* Company Title Center */}
          <div className="text-center space-y-0.5 pt-1">
            <h1 className="text-sm font-extrabold text-slate-900 font-muol tracking-wide">
              {khmerTitle}
            </h1>
            <h2 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight">
              {englishTitle}
            </h2>
            <p className="text-[10px] text-slate-600 font-medium">
              Address: {addressText}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              Telephone: {phoneText}
            </p>
          </div>

          {/* Quotation Title Center */}
          <div className="mt-3 text-center">
            <h2 className="text-sm font-black tracking-wide text-slate-900 uppercase">
              QUOTATION / 报价单
            </h2>
          </div>

          {/* Number & Date Meta Row */}
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-800 px-1">
            <div>
              <span>លេខរៀង / NUMBER : </span>
              <span className="font-mono font-extrabold text-slate-950">{quotation.quotation_no}</span>
            </div>
            <div className="text-right space-y-0.5">
              <div>
                <span>កាលបរិច្ឆេទ / DATE : </span>
                <span className="font-mono">{quotation.created_date}</span>
              </div>
              <div>
                <span>រៀបចំដោយ / PREPARED BY : </span>
                <span>{quotation.created_by_name || 'SA Staff'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info Grid Box */}
        <div className="border border-slate-800 rounded-none grid grid-cols-2 text-[11px] leading-snug">
          {/* Left Column */}
          <div className="border-r border-slate-800 p-2 space-y-1">
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-44 shrink-0">តម្រូវការជួសជុល AFTER SALE :</span>
              <span className="font-semibold text-slate-800">{quotation.after_sale || quotation.description || ''}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-44 shrink-0">អតិថិជន / NAME :</span>
              <span className="font-extrabold text-slate-950">{quotation.customer_name}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-44 shrink-0">លេខទូរស័ព្ទ / TEL :</span>
              <span className="font-bold text-slate-800">{quotation.phone}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-44 shrink-0">អាសយដ្ឋាន / ADDRESS :</span>
              <span className="font-medium text-slate-800">{quotation.address || ''}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-2 space-y-1">
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">ម៉ូឌែល / MODEL :</span>
              <span className="font-extrabold text-slate-900">{quotation.vehicle_model}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">លេខតួរ / VIN :</span>
              <span className="font-mono font-bold text-slate-800">{quotation.vin}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">ផ្លាកលេខ / PLATE :</span>
              <span className="font-mono font-extrabold text-slate-950">{quotation.plate_no}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">ពណ៌ / COLOR :</span>
              <span className="font-semibold text-slate-800">{quotation.color}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">គីឡូ / MILEAGE :</span>
              <span className="font-bold text-slate-800">{quotation.mileage ? `${quotation.mileage.toLocaleString()} km` : ''}</span>
            </div>
            <div className="flex">
              <span className="font-extrabold text-slate-900 w-40 shrink-0">កម្រិតប្រេង / FUEL GAUGE :</span>
              <span className="font-bold text-slate-800">{quotation.fuel_gauge || quotation.battery || ''}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table Grid */}
        <div className="border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-900 font-extrabold text-center bg-slate-50">
                <th className="py-2 px-1 border-r border-slate-800 w-10">No.</th>
                <th className="py-2 px-1 border-r border-slate-800 w-20">SAP</th>
                <th className="py-2 px-2 border-r border-slate-800 text-left">
                  <div>បរិយាយមុខទំនិញ</div>
                  <div className="text-[9px] font-normal text-slate-600">物料描述</div>
                </th>
                <th className="py-2 px-1 border-r border-slate-800 w-14">
                  <div>បរិមាណ</div>
                  <div className="text-[9px] font-normal text-slate-600">数量</div>
                </th>
                <th className="py-2 px-1 border-r border-slate-800 w-20">
                  <div>ថ្លៃឯកតា</div>
                  <div className="text-[9px] font-normal text-slate-600">单价</div>
                </th>
                <th className="py-2 px-1 border-r border-slate-800 w-16">
                  <div>រូបភាព</div>
                  <div className="text-[9px] font-normal text-slate-600">图片</div>
                </th>
                <th className="py-2 px-1 border-r border-slate-800 w-24">
                  <div>បាញ់ថ្នាំ / 检查</div>
                </th>
                <th className="py-2 px-2 w-28 text-right">
                  <div>ថ្លៃទំនិញ</div>
                  <div className="text-[9px] font-normal text-slate-600">总价</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayItems.map((item, idx) => {
                const isEmpty = !item.description && item.amount === 0;
                return (
                  <tr
                    key={item.id || idx}
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                    className={`text-slate-900 font-medium break-inside-avoid ${displayItems.length > 8 ? 'h-7 text-[9.5px]' : 'h-9 text-[10px]'}`}
                  >
                    <td className="py-1 px-1 border-r border-slate-800 text-center font-bold">{idx + 1}</td>
                    <td className="py-1 px-1 border-r border-slate-800 text-center font-mono">{item.sap_no || ''}</td>
                    <td className="py-1 px-2 border-r border-slate-800 font-semibold">{item.description}</td>
                    <td className="py-1 px-1 border-r border-slate-800 text-center font-bold">{isEmpty ? '' : item.quantity}</td>
                    <td className="py-1 px-1 border-r border-slate-800 text-center font-mono">{isEmpty ? '' : `$ ${item.unit_price.toFixed(2)}`}</td>
                    <td className="py-1 px-1 border-r border-slate-800 text-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="h-5 w-5 object-contain mx-auto" />
                      ) : ''}
                    </td>
                    <td className="py-1 px-1 border-r border-slate-800 text-center">{item.paint_check || ''}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold">
                      {isEmpty ? (
                        <span className="flex justify-between w-full"><span>$</span><span>-</span></span>
                      ) : (
                        `$ ${item.amount.toFixed(2)}`
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Subtotal, VAT, Amount Due Summary Table Block */}
          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="border-t border-slate-800 text-[11px] font-bold break-inside-avoid">
            <div className="flex justify-end border-b border-slate-800">
              <div className="w-44 py-1.5 px-3 border-l border-slate-800 text-right font-extrabold text-slate-900">
                Sub Total:
              </div>
              <div className="w-32 py-1.5 px-3 border-l border-slate-800 text-right font-mono flex justify-between">
                <span>$</span>
                <span>{quotation.subtotal > 0 ? quotation.subtotal.toFixed(2) : '-'}</span>
              </div>
            </div>

            <div className="flex justify-end border-b border-slate-800">
              <div className="w-44 py-1.5 px-3 border-l border-slate-800 text-right font-extrabold text-slate-900">
                VAT 10%:
              </div>
              <div className="w-32 py-1.5 px-3 border-l border-slate-800 text-right font-mono flex justify-between">
                <span>$</span>
                <span>{quotation.vat > 0 ? quotation.vat.toFixed(2) : '-'}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-44 py-1.5 px-3 border-l border-slate-800 text-right font-extrabold text-slate-950">
                Amount Due:
              </div>
              <div className="w-32 py-1.5 px-3 border-l border-slate-800 text-right font-mono font-extrabold flex justify-between">
                <span>$</span>
                <span>{quotation.total_amount > 0 ? quotation.total_amount.toFixed(2) : '_________'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Footer Block (Terms + Signatures) - Unbreakable across page breaks */}
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="break-inside-avoid pt-2 space-y-6">
          {/* Terms & Conditions (Official Points - Configurable via Settings) */}
          <div className="text-[10px] text-slate-900 space-y-1 font-semibold">
            {termsList.map((termLine, idx) => (
              <p key={idx}>{termLine}</p>
            ))}
          </div>

          {/* Dual Signatures Block */}
          <div className="pt-4 grid grid-cols-2 text-center text-xs font-bold text-slate-900">
            <div className="space-y-12">
              <div>
                <p className="font-muol text-xs">ត្រួតពិនិត្យដោយ</p>
                <p className="text-[11px] font-sans">CHECKED BY</p>
              </div>
              <div className="w-48 mx-auto border-b border-slate-800"></div>
            </div>

            <div className="space-y-12">
              <div>
                <p className="font-muol text-xs">យល់ព្រមដោយអតិថិជន</p>
                <p className="text-[11px] font-sans">ACKNOWLEDGED BY</p>
              </div>
              <div className="w-48 mx-auto border-b border-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


