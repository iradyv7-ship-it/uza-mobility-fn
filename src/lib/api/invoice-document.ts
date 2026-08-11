export function invoiceDocumentFilename(invoiceNumber: string) {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, '_').trim();
  return `${safe || 'invoice'}.pdf`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function openInvoiceDocumentPdf(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Trigger a browser download of the invoice PDF file. */
export function downloadInvoiceDocumentPdf(blob: Blob, filename: string) {
  triggerBlobDownload(blob, filename);
}

export async function fetchAuthenticatedInvoiceDocument(
  url: string,
  accessToken: string,
): Promise<Blob> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error('Could not load invoice document');
  }
  return response.blob();
}

/** @deprecated Use downloadInvoiceDocumentPdf */
export const downloadInvoiceDocumentHtml = downloadInvoiceDocumentPdf;
/** @deprecated Use openInvoiceDocumentPdf */
export const openInvoiceDocumentInNewTab = openInvoiceDocumentPdf;
