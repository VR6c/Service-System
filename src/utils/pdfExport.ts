import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    await document.fonts?.ready;
    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 10000,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(elementId);
          if (clonedEl) {
            clonedEl.style.position = 'relative';
            clonedEl.style.top = '0';
            clonedEl.style.left = '0';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.transform = 'none';
            clonedEl.style.width = '210mm';
            clonedEl.style.boxShadow = 'none';
            clonedEl.style.border = 'none';
            clonedEl.style.visibility = 'visible';
            clonedEl.style.display = 'block';

            // Clean up any empty src image elements to prevent CORS errors
            const imgs = clonedEl.querySelectorAll('img');
            imgs.forEach((img: HTMLImageElement) => {
              if (!img.src || img.src.trim() === '' || img.src === window.location.href) {
                img.style.display = 'none';
              }
            });
          }
        }
      });
    } catch (primaryError) {
      console.warn('Primary high-res PDF generation failed, attempting standard resolution:', primaryError);
      canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000
      });
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= 297;

    while (heightLeft > 0.5) {
      position = position - 297;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= 297;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF export error:', error);
    // Fail-safe print dialog to Save as PDF
    printDocumentElement(elementId);
  }
};

export const printDocumentElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create isolated printing iframe to guarantee 100% un-clipped print preview
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Copy all page stylesheets into the iframe
  const headStyles = Array.from(document.querySelectorAll('head style, head link'))
    .map(el => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-print-page {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 10mm 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          .receipt-content {
            width: 190mm !important;
            margin: 0 auto !important;
          }
          #${elementId} {
            display: block !important;
            visibility: visible !important;
          }
          #${elementId} * {
            visibility: visible !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 400);
};

export const printDocument = () => {
  const receiptEl = document.getElementById('receipt-pdf-document');
  const quotationEl = document.getElementById('quotation-pdf-document');
  if (receiptEl) {
    printDocumentElement('receipt-pdf-document');
  } else if (quotationEl) {
    printDocumentElement('quotation-pdf-document');
  } else {
    window.print();
  }
};
