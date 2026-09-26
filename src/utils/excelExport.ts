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
 * Exports report data to a corporate-styled Excel (.xlsx) file following
 * the clean table layout:
 * - Centered Company Title & Report Name
 * - Date & Scope Filter Period
 * - Dark Navy Blue table header with White bold text
 * - Clean white data rows with full thin gridlines
 * - Dark Navy Blue bottom TOTAL row with White bold text
 * - Executive Signatures block
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
    { key: 'col1', width: 6 },   // S/n
    { key: 'col2', width: 18 },  // Document No.
    { key: 'col3', width: 12 },  // Brand
    { key: 'col4', width: 24 },  // Branch
    { key: 'col5', width: 22 },  // Customer Name
    { key: 'col6', width: 16 },  // Phone Number
    { key: 'col7', width: 24 },  // Vehicle Details
    { key: 'col8', width: 16 },  // Created By
    { key: 'col9', width: 14 },  // Date
    { key: 'col10', width: 18 }  // Total Amount ($)
  ];

  // Header Details
  const isDenza = brand?.brand_code === 'DENZA' || brandFilterName.toUpperCase().includes('DENZA');
  const centerTitle = brand?.service_center_name || (isDenza ? 'DENZA EXECUTIVE SERVICE CENTER' : (settings?.receipt_header_english_title || 'BYD SALES & SERVICE CENTER'));

  // Row Heights for Corporate Title Header (Rows 1 to 3)
  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 22;
  worksheet.getRow(3).height = 20;

  // Row 1: Company / Service Center Name (Centered across columns A to J)
  worksheet.mergeCells('A1:J1');
  const cellTitle = worksheet.getCell('A1');
  cellTitle.value = centerTitle.toUpperCase();
  cellTitle.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Report Title (Centered across columns A to J)
  worksheet.mergeCells('A2:J2');
  const cellReportTitle = worksheet.getCell('A2');
  cellReportTitle.value = `${reportType.toUpperCase()} DATA REPORT`;
  cellReportTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF000000' } };
  cellReportTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 3: Filter & Date Period (Centered across columns A to J)
  worksheet.mergeCells('A3:J3');
  const cellPeriod = worksheet.getCell('A3');
  cellPeriod.value = `For the Period of ${dateFilterName} (${dateRangeText})${brandFilterName !== 'All Brands' ? `  •  Brand: ${brandFilterName}` : ''}${branchFilterName !== 'All Branches' ? `  •  Branch: ${branchFilterName}` : ''}`;
  cellPeriod.font = { name: 'Arial', size: 10.5, bold: true, italic: true, color: { argb: 'FF000000' } };
  cellPeriod.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. COLUMN HEADERS (Row 4 - Dark Navy Blue #002060 with White Bold Text)
  const headerRowIndex = 4;
  worksheet.getRow(headerRowIndex).height = 28;
  const headers = [
    'S/n',
    'Document No.',
    'Brand',
    'Branch',
    'Customer Name',
    'Phone Number',
    'Vehicle Details',
    'Created By',
    'Date',
    'Total Amount ($)'
  ];

  headers.forEach((h, idx) => {
    const cell = worksheet.getCell(headerRowIndex, idx + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
    cell.alignment = {
      horizontal: idx === 9 ? 'right' : (idx === 0 || idx === 1 || idx === 2 || idx === 5 || idx === 8 ? 'center' : 'left'),
      vertical: 'middle'
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // 3. DATA ROWS (Rows 5 to 4 + N - Clean White with Full Thin Gridlines)
  let currentRow = 5;
  const startDataRow = currentRow;

  reportData.forEach((row, i) => {
    const r = worksheet.getRow(currentRow);
    r.height = 22;

    // Col 1: S/n (Centered & BOLD as shown in image)
    const c1 = r.getCell(1);
    c1.value = i + 1;
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    c1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };

    // Col 2: Document No.
    const c2 = r.getCell(2);
    c2.value = row.doc_no;
    c2.alignment = { horizontal: 'center', vertical: 'middle' };
    c2.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 3: Brand
    const c3 = r.getCell(3);
    c3.value = row.brand;
    c3.alignment = { horizontal: 'center', vertical: 'middle' };
    c3.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 4: Branch
    const c4 = r.getCell(4);
    c4.value = row.branch;
    c4.alignment = { horizontal: 'left', vertical: 'middle' };
    c4.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 5: Customer Name
    const c5 = r.getCell(5);
    c5.value = row.customer;
    c5.alignment = { horizontal: 'left', vertical: 'middle' };
    c5.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 6: Phone Number - Space-grouped format to eliminate green triangle
    const c6 = r.getCell(6);
    c6.value = formatPhoneNumber(row.phone);
    c6.alignment = { horizontal: 'center', vertical: 'middle' };
    c6.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 7: Vehicle Details
    const c7 = r.getCell(7);
    c7.value = row.vehicle;
    c7.alignment = { horizontal: 'left', vertical: 'middle' };
    c7.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 8: Created By
    const c8 = r.getCell(8);
    c8.value = row.created_by;
    c8.alignment = { horizontal: 'left', vertical: 'middle' };
    c8.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 9: Date
    const c9 = r.getCell(9);
    c9.value = row.date;
    c9.alignment = { horizontal: 'center', vertical: 'middle' };
    c9.font = { name: 'Arial', size: 10, color: { argb: 'FF000000' } };

    // Col 10: Total Amount ($)
    const c10 = r.getCell(10);
    c10.value = Number(row.amount || 0);
    c10.numFmt = '$#,##0.00';
    c10.alignment = { horizontal: 'right', vertical: 'middle' };
    c10.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };

    // Thin gridlines all around every cell
    for (let c = 1; c <= 10; c++) {
      const cell = r.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }

    currentRow++;
  });

  const lastDataRow = currentRow - 1;

  // 4. TOTAL ROW (Matching Dark Navy #002060 with White Bold Font)
  worksheet.getRow(currentRow).height = 26;

  // Apply dark navy background and borders to all 10 cells in the total row
  for (let c = 1; c <= 10; c++) {
    const cell = worksheet.getCell(currentRow, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  }

  // Merge A to I for "TOTAL"
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  const grandTotalLabel = worksheet.getCell(`A${currentRow}`);
  grandTotalLabel.value = 'TOTAL';
  grandTotalLabel.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  grandTotalLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  // Total Value in Column J
  const grandTotalValue = worksheet.getCell(`J${currentRow}`);
  if (reportData.length > 0) {
    grandTotalValue.value = {
      formula: `SUM(J${startDataRow}:J${lastDataRow})`,
      result: totalSum
    };
  } else {
    grandTotalValue.value = 0;
  }
  grandTotalValue.numFmt = '$#,##0.00';
  grandTotalValue.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  grandTotalValue.alignment = { horizontal: 'right', vertical: 'middle' };

  // 5. EXECUTIVE SIGNATURES (3 columns below table)
  currentRow += 3;
  const sigStartRow = currentRow;
  worksheet.getRow(sigStartRow).height = 20;
  worksheet.getRow(sigStartRow + 2).height = 20;
  worksheet.getRow(sigStartRow + 3).height = 18;

  worksheet.mergeCells(`B${sigStartRow}:D${sigStartRow}`);
  const s1 = worksheet.getCell(`B${sigStartRow}`);
  s1.value = 'PREPARED BY (SA / STAFF)';
  s1.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF000000' } };
  s1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`E${sigStartRow}:G${sigStartRow}`);
  const s2 = worksheet.getCell(`E${sigStartRow}`);
  s2.value = 'VERIFIED BY (ACCOUNTING)';
  s2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF000000' } };
  s2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`H${sigStartRow}:J${sigStartRow}`);
  const s3 = worksheet.getCell(`H${sigStartRow}`);
  s3.value = 'APPROVED BY (BRANCH MANAGER)';
  s3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF000000' } };
  s3.alignment = { horizontal: 'center', vertical: 'middle' };

  const sigLineRow = sigStartRow + 2;
  worksheet.mergeCells(`B${sigLineRow}:D${sigLineRow}`);
  const u1 = worksheet.getCell(`B${sigLineRow}`);
  u1.value = 'Signature: __________________________';
  u1.font = { name: 'Arial', size: 8.5, color: { argb: 'FF475569' } };
  u1.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`E${sigLineRow}:G${sigLineRow}`);
  const u2 = worksheet.getCell(`E${sigLineRow}`);
  u2.value = 'Signature: __________________________';
  u2.font = { name: 'Arial', size: 8.5, color: { argb: 'FF475569' } };
  u2.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(`H${sigLineRow}:J${sigLineRow}`);
  const u3 = worksheet.getCell(`H${sigLineRow}`);
  u3.value = 'Signature: __________________________';
  u3.font = { name: 'Arial', size: 8.5, color: { argb: 'FF475569' } };
  u3.alignment = { horizontal: 'center', vertical: 'middle' };

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
