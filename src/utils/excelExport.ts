import type { Brand, Branch, SystemSettings } from '../types';

export interface ReportRowData {
  doc_no: string;
  brand: string;
  branch: string;
  customer: string;
  phone: string;
  vehicle: string;
  amount: number;
  created_by: string;
  date: string;
}

export interface ExportReportOptions {
  reportType: 'receipt' | 'quotation';
  brandFilterName: string;
  branchFilterName: string;
  dateFilterName: string;
  dateRangeText: string;
  totalSum: number;
  reportData: ReportRowData[];
  brand?: Brand;
  branch?: Branch;
  settings?: SystemSettings;
  generatedBy?: string;
}

/**
 * Renders the BYD or brand logo to a PNG base64 for embedding in Excel
 */
export async function getLogoBase64(
  logoUrl?: string,
  brandCode = 'BYD'
): Promise<{ base64: string; extension: 'png' | 'jpeg' } | null> {
  const isDenza = brandCode.toUpperCase().includes('DENZA');
  const fallbackUrl = isDenza
    ? 'https://tse2.mm.bing.net/th/id/OIP.R4IlkQVbbsQoWUDuVQb2vAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
    : 'https://1000logos.net/wp-content/uploads/2020/07/BYD-Logo.png';
  const localUrl = isDenza ? '/logos/denza-logo.png' : '/logos/byd-logo.png';

  const urlsToTry: string[] = [];
  if (logoUrl && logoUrl.trim() !== '') {
    urlsToTry.push(logoUrl.trim());
  }
  urlsToTry.push(localUrl);
  urlsToTry.push(fallbackUrl);

  for (const url of urlsToTry) {
    try {
      if (url.startsWith('data:image/')) {
        const parts = url.split(',');
        if (parts.length === 2) {
          const isJpeg = parts[0].includes('jpeg') || parts[0].includes('jpg');
          return {
            base64: parts[1],
            extension: isJpeg ? 'jpeg' : 'png'
          };
        }
      }

      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resStr = reader.result as string;
            resolve(resStr.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const isJpeg = blob.type.includes('jpeg') || blob.type.includes('jpg');
        return {
          base64,
          extension: isJpeg ? 'jpeg' : 'png'
        };
      }
    } catch {
      // try next URL
    }
  }

  // Default: generate crisp emblem canvas if network fetch fails
  return await renderBrandLogoToPng(brandCode);
}

function renderBrandLogoToPng(brandCode = 'BYD'): Promise<{ base64: string; extension: 'png' } | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 440;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      ctx.clearRect(0, 0, 440, 140);

      const isDenza = brandCode.toUpperCase().includes('DENZA');
      const primaryColor = isDenza ? '#0284C7' : '#E31B23';

      if (!isDenza) {
        // High-res BYD Vector letters
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 14;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';

        ctx.save();
        ctx.scale(440 / 740, 140 / 230);

        // Letter B
        ctx.beginPath();
        ctx.moveTo(40, 50);
        ctx.lineTo(165, 50);
        ctx.bezierCurveTo(205, 50, 205, 115, 165, 115);
        ctx.lineTo(40, 115);
        ctx.lineTo(165, 115);
        ctx.bezierCurveTo(205, 115, 205, 180, 165, 180);
        ctx.lineTo(40, 180);
        ctx.stroke();

        // Letter Y
        ctx.beginPath();
        ctx.moveTo(275, 50);
        ctx.lineTo(330, 50);
        ctx.bezierCurveTo(365, 50, 370, 70, 370, 100);
        ctx.lineTo(370, 180);
        ctx.moveTo(465, 50);
        ctx.lineTo(410, 50);
        ctx.bezierCurveTo(375, 50, 370, 70, 370, 100);
        ctx.stroke();

        // Letter D
        ctx.beginPath();
        ctx.moveTo(535, 50);
        ctx.lineTo(635, 50);
        ctx.bezierCurveTo(705, 50, 705, 180, 635, 180);
        ctx.lineTo(535, 180);
        ctx.stroke();

        ctx.restore();
      } else {
        // High-res Denza text badge
        ctx.font = 'bold 44px sans-serif';
        ctx.fillStyle = primaryColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DENZA', 220, 55);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('EXECUTIVE SERVICE CENTER', 220, 100);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, extension: 'png' });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Formats a phone number cleanly with space grouping (e.g. 096 575 8004).
 * This prevents Excel from flagging digits as "Number stored as text" with green triangles.
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  const cleaned = trimmed.replace(/\s+/g, '');

  if (/^\d{9}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (/^\d{10}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return trimmed;
}

/**
 * Helper to style a rectangular range with an outer border and solid fill.
 * Only outer edges get borders, avoiding Excel merge border artifacts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function styleBoxRange(ws: any, startCol: number, startRow: number, endCol: number, endRow: number, options: {
  fill?: string;
  borderColor?: string;
  borderStyle?: 'thin' | 'medium' | 'double';
  bottomStyle?: 'thin' | 'medium' | 'double';
}) {
  const color = options.borderColor || 'FF0F172A';
  const style = options.borderStyle || 'thin';
  const bStyle = options.bottomStyle || style;

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      if (options.fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: options.fill } };
      }
      const b = { ...(cell.border || {}) };
      if (r === startRow) b.top = { style, color: { argb: color } };
      if (r === endRow) b.bottom = { style: bStyle, color: { argb: color } };
      if (c === startCol) b.left = { style, color: { argb: color } };
      if (c === endCol) b.right = { style, color: { argb: color } };
      cell.border = b;
    }
  }
}

/**
 * Exports report data to an executive-styled Excel (.xlsx) file that exactly matches
 * the layout and quality of the official PDF/Print report:
 * - Unified Master Header Frame with Logo, Company Details & Right-side Document Badge
 * - Report Title Banner & Filter Parameters Strip
 * - Aligned 50/50 KPI Metric Highlight Cards
 * - Professional Dark Navy Data Table with crisp typography
 * - Formatted Phone Numbers without annoying Excel green triangles
 * - Solid Accounting-Style Grand Total Row with double underline
 * - 3-Tier Executive Signatures & Authorization Block inside framed card
 */
export async function exportReportToExcel(options: ExportReportOptions): Promise<void> {
  const {
    reportType,
    brandFilterName,
    branchFilterName,
    dateFilterName,
    dateRangeText,
    totalSum,
    reportData,
    brand,
    branch,
    settings,
    generatedBy = 'Administrator'
  } = options;

  const ExcelJSModule = await import('exceljs');
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'BYD & DENZA Service System';
  workbook.lastModifiedBy = generatedBy;
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheetTitle = reportType === 'receipt' ? 'Receipts Report' : 'Quotations Report';
  const worksheet = workbook.addWorksheet(sheetTitle, {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  // Generous column widths (Total width fits A4 Landscape perfectly)
  worksheet.columns = [
    { key: 'col1', width: 6 },   // #
    { key: 'col2', width: 20 },  // Doc No
    { key: 'col3', width: 12 },  // Brand
    { key: 'col4', width: 26 },  // Branch
    { key: 'col5', width: 22 },  // Customer Name
    { key: 'col6', width: 16 },  // Phone Number
    { key: 'col7', width: 26 },  // Vehicle Details
    { key: 'col8', width: 16 },  // Amount ($)
    { key: 'col9', width: 18 },  // Created By
    { key: 'col10', width: 14 }  // Date
  ];

  // Header Details
  const isDenza = brand?.brand_code === 'DENZA' || brandFilterName.toUpperCase().includes('DENZA');
  const customLogoUrl = brand?.logo_url || (isDenza ? settings?.denza_logo_url : settings?.byd_logo_url) || settings?.header_logo_url || '';
  const centerTitle = brand?.service_center_name || (isDenza ? 'DENZA EXECUTIVE SERVICE CENTER' : (settings?.receipt_header_english_title || 'BYD SALES & SERVICE CENTER'));
  const localTitle = brand?.local_company_name || (isDenza ? 'មជ្ឈមណ្ឌលសេវាកម្មរថយន្តអគ្គិសនីដេនហ្សា' : (settings?.receipt_header_khmer_title || 'មិនអាចយកទៅប្រកាសពន្ធឬប្រកាសជាប់ពន្ធ'));
  const phoneText = branch?.telephone || brand?.telephone || settings?.phone || (isDenza ? '+855 23 999 777' : '+855 23 888 999');
  const addressText = branch?.address || brand?.address || settings?.address || (isDenza ? 'No. 100 Hun Sen Blvd, Chak Angre Krom, Phnom Penh' : 'No. 888 Monivong Blvd, Tonle Bassac, Phnom Penh');
  const emailText = branch?.email || brand?.email || settings?.email || 'service@automotive.com.kh';

  // 1. EMBED LOGO IMAGE (Rows 1 to 4, Columns A & B)
  const logoData = await getLogoBase64(customLogoUrl, isDenza ? 'DENZA' : 'BYD');
  if (logoData && logoData.base64) {
    try {
      const imageId = workbook.addImage({
        base64: logoData.base64,
        extension: logoData.extension
      });
      const extWidth = isDenza ? 56 : 120;
      const extHeight = isDenza ? 56 : 46;
      const colOffset = isDenza ? 0.6 : 0.2;
      worksheet.addImage(imageId, {
        tl: { col: colOffset, row: 0.2 },
        ext: { width: extWidth, height: extHeight },
        editAs: 'oneCell'
      });
    } catch (imgErr) {
      console.warn('Failed to embed logo in Excel:', imgErr);
    }
  }

  // Row Heights for Master Header (Rows 1 to 6)
  worksheet.getRow(1).height = 22;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 17;
  worksheet.getRow(4).height = 17;
  worksheet.getRow(5).height = 24;
  worksheet.getRow(6).height = 32;

  // 2. COMPANY TITLES & CONTACT (Columns C to H, Rows 1 to 4)
  worksheet.mergeCells('C1:H1');
  const cellC1 = worksheet.getCell('C1');
  cellC1.value = centerTitle;
  cellC1.font = { name: 'Arial', size: 13, bold: true, color: { argb: isDenza ? 'FF0284C7' : 'FFB91C1C' } };
  cellC1.alignment = { horizontal: 'left', vertical: 'middle' };

  worksheet.mergeCells('C2:H2');
  const cellC2 = worksheet.getCell('C2');
  cellC2.value = localTitle;
  cellC2.font = { name: 'Khmer OS Siemreap', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  cellC2.alignment = { horizontal: 'left', vertical: 'middle' };

  worksheet.mergeCells('C3:H3');
  const cellC3 = worksheet.getCell('C3');
  cellC3.value = `Address: ${addressText}`;
  cellC3.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  cellC3.alignment = { horizontal: 'left', vertical: 'middle' };

  worksheet.mergeCells('C4:H4');
  const cellC4 = worksheet.getCell('C4');
  cellC4.value = `Tel: ${phoneText}   •   Email: ${emailText}`;
  cellC4.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  cellC4.alignment = { horizontal: 'left', vertical: 'middle' };

  // 3. RIGHT-SIDE OFFICIAL DOCUMENT BADGE BOX (Columns I & J, Rows 1 to 4)
  styleBoxRange(worksheet, 9, 1, 10, 4, { fill: 'FFF8FAFC', borderColor: 'FF0F172A', borderStyle: 'thin' });

  worksheet.mergeCells('I1:J1');
  const badgeTop = worksheet.getCell('I1');
  badgeTop.value = 'OFFICIAL REPORT';
  badgeTop.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF64748B' } };
  badgeTop.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('I2:J3');
  const badgeMid = worksheet.getCell('I2');
  badgeMid.value = `${reportType.toUpperCase()} SUMMARY`;
  badgeMid.font = { name: 'Arial', size: 11.5, bold: true, color: { argb: 'FF0F172A' } };
  badgeMid.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('I4:J4');
  const badgeBot = worksheet.getCell('I4');
  badgeBot.value = `Ref: ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  badgeBot.font = { name: 'Arial', size: 8, color: { argb: 'FF94A3B8' } };
  badgeBot.alignment = { horizontal: 'center', vertical: 'middle' };

  // 4. FULL-WIDTH TITLE BANNER (Row 5, Columns A to J)
  worksheet.mergeCells('A5:J5');
  const banner = worksheet.getCell('A5');
  const brandTitle = brandFilterName === 'All Brands' ? 'BYD & DENZA' : brandFilterName;
  banner.value = `${brandTitle} OFFICIAL ${reportType.toUpperCase()} FINANCIAL & OPERATIONS REPORT`;
  banner.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
  banner.alignment = { horizontal: 'center', vertical: 'middle' };
  styleBoxRange(worksheet, 1, 5, 10, 5, { fill: 'FFF1F5F9', borderColor: 'FF0F172A', borderStyle: 'thin' });

  // 5. METADATA & FILTER PARAMETERS (Row 6, Columns A to J)
  worksheet.mergeCells('A6:F6');
  const metaLeft = worksheet.getCell('A6');
  metaLeft.value = `Filter Period: ${dateFilterName} (${dateRangeText})\nBrand Scope: ${brandFilterName}   |   Branch Scope: ${branchFilterName}`;
  metaLeft.font = { name: 'Arial', size: 8.5, color: { argb: 'FF334155' } };
  metaLeft.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  worksheet.mergeCells('G6:J6');
  const metaRight = worksheet.getCell('G6');
  const nowStr = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  metaRight.value = `Generated: ${nowStr}\nPrepared By: ${generatedBy}`;
  metaRight.font = { name: 'Arial', size: 8.5, color: { argb: 'FF475569' } };
  metaRight.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };

  // Apply clean enclosing border around the entire master header box (A1:J6)
  styleBoxRange(worksheet, 1, 1, 10, 6, { borderColor: 'FF0F172A', borderStyle: 'medium' });

  // Row 7: Clean Gap
  worksheet.getRow(7).height = 10;

  // 6. ALIGNED 50/50 KPI METRIC HIGHLIGHT CARDS (Row 8)
  worksheet.getRow(8).height = 24;

  // Left KPI (A8:E8)
  worksheet.mergeCells('A8:E8');
  const kpiLeft = worksheet.getCell('A8');
  kpiLeft.value = `TOTAL RECORDS:   ${reportData.length} Documents`;
  kpiLeft.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  kpiLeft.alignment = { horizontal: 'center', vertical: 'middle' };
  styleBoxRange(worksheet, 1, 8, 5, 8, { fill: 'FFF8FAFC', borderColor: 'FFCBD5E1', borderStyle: 'thin' });

  // Right KPI (F8:J8)
  worksheet.mergeCells('F8:J8');
  const kpiRight = worksheet.getCell('F8');
  kpiRight.value = `TOTAL REVENUE AMOUNT:   $${Number(totalSum || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  kpiRight.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF047857' } };
  kpiRight.alignment = { horizontal: 'center', vertical: 'middle' };
  styleBoxRange(worksheet, 6, 8, 10, 8, { fill: 'FFECFDF5', borderColor: 'FFA7F3D0', borderStyle: 'thin' });

  // Row 9: Clean Gap
  worksheet.getRow(9).height = 10;

  // 7. COLUMN HEADERS (Row 10)
  const headerRowIndex = 10;
  worksheet.getRow(headerRowIndex).height = 26;
  const headers = [
    '#',
    'Document No.',
    'Brand',
    'Branch',
    'Customer Name',
    'Phone Number',
    'Vehicle Details',
    'Amount ($)',
    'Created By',
    'Date'
  ];

  headers.forEach((h, idx) => {
    const cell = worksheet.getCell(headerRowIndex, idx + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = {
      horizontal: idx === 7 ? 'right' : (idx === 0 || idx === 1 || idx === 2 || idx === 5 || idx === 9 ? 'center' : 'left'),
      vertical: 'middle'
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'thin', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // 8. DATA ROWS (Rows 11 to 10 + N)
  let currentRow = 11;
  const startDataRow = currentRow;

  reportData.forEach((row, i) => {
    const r = worksheet.getRow(currentRow);
    r.height = 22;
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Col 1: #
    const c1 = r.getCell(1);
    c1.value = i + 1;
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    c1.font = { name: 'Arial', size: 9.5, color: { argb: 'FF64748B' } };

    // Col 2: Doc No
    const c2 = r.getCell(2);
    c2.value = row.doc_no;
    c2.alignment = { horizontal: 'center', vertical: 'middle' };
    c2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };

    // Col 3: Brand
    const c3 = r.getCell(3);
    c3.value = row.brand;
    c3.alignment = { horizontal: 'center', vertical: 'middle' };
    c3.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };

    // Col 4: Branch
    const c4 = r.getCell(4);
    c4.value = row.branch;
    c4.alignment = { horizontal: 'left', vertical: 'middle' };
    c4.font = { name: 'Arial', size: 9.5, color: { argb: 'FF334155' } };

    // Col 5: Customer Name
    const c5 = r.getCell(5);
    c5.value = row.customer;
    c5.alignment = { horizontal: 'left', vertical: 'middle' };
    c5.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };

    // Col 6: Phone Number - Clean grouped format without Excel green triangles
    const c6 = r.getCell(6);
    c6.value = formatPhoneNumber(row.phone);
    c6.alignment = { horizontal: 'center', vertical: 'middle' };
    c6.font = { name: 'Arial', size: 9.5, color: { argb: 'FF334155' } };

    // Col 7: Vehicle Details
    const c7 = r.getCell(7);
    c7.value = row.vehicle;
    c7.alignment = { horizontal: 'left', vertical: 'middle' };
    c7.font = { name: 'Arial', size: 9.5, color: { argb: 'FF334155' } };

    // Col 8: Amount ($)
    const c8 = r.getCell(8);
    c8.value = Number(row.amount || 0);
    c8.numFmt = '$#,##0.00';
    c8.alignment = { horizontal: 'right', vertical: 'middle' };
    c8.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };

    // Col 9: Created By
    const c9 = r.getCell(9);
    c9.value = row.created_by;
    c9.alignment = { horizontal: 'left', vertical: 'middle' };
    c9.font = { name: 'Arial', size: 9.5, color: { argb: 'FF475569' } };

    // Col 10: Date
    const c10 = r.getCell(10);
    c10.value = row.date;
    c10.alignment = { horizontal: 'center', vertical: 'middle' };
    c10.font = { name: 'Arial', size: 9.5, color: { argb: 'FF475569' } };

    // Apply borders and zebra background
    for (let c = 1; c <= 10; c++) {
      const cell = r.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }

    currentRow++;
  });

  const lastDataRow = currentRow - 1;

  // 9. SOLID ACCOUNTING-STYLE GRAND TOTAL ROW
  worksheet.getRow(currentRow).height = 26;
  styleBoxRange(worksheet, 1, currentRow, 10, currentRow, {
    fill: 'FFF1F5F9',
    borderColor: 'FF0F172A',
    borderStyle: 'thin',
    bottomStyle: 'double'
  });

  // Label: Columns A to G merged
  worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const grandTotalLabel = worksheet.getCell(`A${currentRow}`);
  grandTotalLabel.value = `GRAND TOTAL (${reportData.length} records):`;
  grandTotalLabel.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  grandTotalLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  // Total Value: Column H
  const grandTotalValue = worksheet.getCell(`H${currentRow}`);
  if (reportData.length > 0) {
    grandTotalValue.value = {
      formula: `SUM(H${startDataRow}:H${lastDataRow})`,
      result: totalSum
    };
  } else {
    grandTotalValue.value = 0;
  }
  grandTotalValue.numFmt = '$#,##0.00';
  grandTotalValue.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFB91C1C' } };
  grandTotalValue.alignment = { horizontal: 'right', vertical: 'middle' };

  // Vertical border separating Amount from Col I
  grandTotalValue.border = {
    ...grandTotalValue.border,
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  // Row space after data
  currentRow += 2;

  // 10. EXECUTIVE SIGNATURES & AUTHORIZATION BLOCK (Framed Box across Columns B to J)
  const sigStartRow = currentRow;
  worksheet.getRow(sigStartRow).height = 22;      // Titles
  worksheet.getRow(sigStartRow + 1).height = 32;  // Signature space
  worksheet.getRow(sigStartRow + 2).height = 18;  // Signature underline
  worksheet.getRow(sigStartRow + 3).height = 18;  // Date
  worksheet.getRow(sigStartRow + 4).height = 18;  // Confidential notice
  const sigEndRow = sigStartRow + 4;

  // Apply neat outer border around the whole signature card (B to J)
  styleBoxRange(worksheet, 2, sigStartRow, 10, sigEndRow, {
    fill: 'FFFFFFFF',
    borderColor: 'FF0F172A',
    borderStyle: 'thin'
  });

  // Headers (Row 1)
  worksheet.mergeCells(`B${sigStartRow}:D${sigStartRow}`);
  const s1 = worksheet.getCell(`B${sigStartRow}`);
  s1.value = 'PREPARED BY (SA / STAFF)';
  s1.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  s1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`E${sigStartRow}:G${sigStartRow}`);
  const s2 = worksheet.getCell(`E${sigStartRow}`);
  s2.value = 'VERIFIED BY (ACCOUNTING)';
  s2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  s2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`H${sigStartRow}:J${sigStartRow}`);
  const s3 = worksheet.getCell(`H${sigStartRow}`);
  s3.value = 'APPROVED BY (BRANCH MANAGER)';
  s3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  s3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Signature Underlines (Row 3)
  const sigLineRow = sigStartRow + 2;
  worksheet.mergeCells(`B${sigLineRow}:D${sigLineRow}`);
  const u1 = worksheet.getCell(`B${sigLineRow}`);
  u1.value = 'Signature: __________________________';
  u1.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  u1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`E${sigLineRow}:G${sigLineRow}`);
  const u2 = worksheet.getCell(`E${sigLineRow}`);
  u2.value = 'Signature: __________________________';
  u2.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  u2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`H${sigLineRow}:J${sigLineRow}`);
  const u3 = worksheet.getCell(`H${sigLineRow}`);
  u3.value = 'Signature: __________________________';
  u3.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  u3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Dates (Row 4)
  const dateLineRow = sigStartRow + 3;
  worksheet.mergeCells(`B${dateLineRow}:D${dateLineRow}`);
  const d1 = worksheet.getCell(`B${dateLineRow}`);
  d1.value = `Date: ${new Date().toISOString().slice(0, 10)}`;
  d1.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  d1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`E${dateLineRow}:G${dateLineRow}`);
  const d2 = worksheet.getCell(`E${dateLineRow}`);
  d2.value = 'Date: __________________________';
  d2.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  d2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`H${dateLineRow}:J${dateLineRow}`);
  const d3 = worksheet.getCell(`H${dateLineRow}`);
  d3.value = 'Date: __________________________';
  d3.font = { name: 'Arial', size: 8.5, color: { argb: 'FF64748B' } };
  d3.alignment = { horizontal: 'center', vertical: 'middle' };

  // Confidentiality Notice (Row 5)
  const noteRow = sigStartRow + 4;
  worksheet.mergeCells(`B${noteRow}:J${noteRow}`);
  const noteCell = worksheet.getCell(`B${noteRow}`);
  noteCell.value = 'Confidential • For Internal Management & Financial Reporting Only  •  BYD & DENZA Service Operations System';
  noteCell.font = { name: 'Arial', size: 7.5, italic: true, color: { argb: 'FF94A3B8' } };
  noteCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Thin line separating notice
  for (let c = 2; c <= 10; c++) {
    const cCell = worksheet.getCell(noteRow, c);
    cCell.border = {
      ...cCell.border,
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  }

  // Generate binary and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `${reportType}_report_${dateStr}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
