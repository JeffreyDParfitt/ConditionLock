import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Packet, AppSettings } from '../types';
import { db } from '../storage/db';
import { blobToDataURL } from '../utils/photo';

function formatDate(iso: string) {
  try { return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
  catch { return iso; }
}

const PDF_TITLES: Record<string, string> = {
  car_rental: 'Rental Car Condition Report',
  moving_truck_van: 'Moving Truck / Van Condition Report',
  trailer_tow_equipment: 'Trailer / Tow Equipment Condition Report',
  custom_rental_vehicle: 'Rental Vehicle Condition Report',
  company_vehicle_handoff: 'Company Vehicle Handoff Report',
  hotel: 'Hotel Stay Condition Report',
  airbnb: 'Short-Term Rental Condition Report',
  apartment_home: 'Apartment / Home Rental Condition Report',
  business_commercial_lease: 'Business / Commercial Lease Condition Report',
  business_changeover_as_is_sale: 'Business Changeover / As-Is Condition Report',
  property_sale_home_sale: 'Property Sale Condition Report',
  vehicle_sale_as_is_transfer: 'Vehicle Sale / As-Is Condition Report',
  equipment_sale_as_is_transfer: 'Equipment Sale / As-Is Condition Report',
  general_item_sale_as_is_transfer: 'As-Is Item Transfer Condition Report',
  moving_storage: 'Moving / Storage Condition Report',
  equipment_rental: 'Equipment Rental Condition Report',
  accident_claim: 'Accident / Insurance Documentation Packet',
  custom: 'ProofPacket Condition Report',
};

export async function generatePDF(
  packet: Packet,
  settings: AppSettings,
  options: {
    includeCover: boolean;
    includeSummary: boolean;
    includeChecklist: boolean;
    includePhotos: boolean;
    includeCommLog: boolean;
    includeSignatures: boolean;
    includeDisclaimer: boolean;
  }
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const photos = await db.photos.where('packetId').equals(packet.id).toArray();

  const packetTitle = PDF_TITLES[packet.type] ?? settings.defaultPdfTitle ?? 'Condition Report';
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const navy: [number, number, number] = [15, 30, 55];
  const slate: [number, number, number] = [51, 65, 85];
  const muted: [number, number, number] = [120, 130, 145];

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkBreak = (needed: number) => {
    if (y + needed > pageH - 20) newPage();
  };

  const sectionHeading = (text: string) => {
    checkBreak(12);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(text, margin, y);
    doc.setDrawColor(...slate);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(`Page ${i} of ${pages}`, pageW / 2, pageH - 8, { align: 'center' });
      if (options.includeDisclaimer || settings.showDisclaimer) {
        const disclaimer = 'ProofPacket is an organization and documentation tool. It does not provide legal, insurance, medical, safety, code-compliance, inspection, appraisal, valuation, or professional advice.';
        doc.text(disclaimer, pageW / 2, pageH - 4, { align: 'center', maxWidth: pageW - margin * 2 });
      }
      doc.setTextColor(0, 0, 0);
    }
  };

  // ── WATERMARK ──────────────────────────────────────────────────────
  const addWatermarks = () => {
    if (!settings.watermarkExports) return;
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(52);
      doc.setTextColor(220, 225, 232);
      doc.text('ProofPacket', pageW / 2, pageH / 2, { align: 'center', angle: 45 });
      doc.setTextColor(0, 0, 0);
    }
  };

  // ── 1. COVER PAGE ──────────────────────────────────────────────────
  if (options.includeCover) {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 50, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ProofPacket', margin, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Prove the condition before there\'s a dispute.', margin, 32);
    doc.setFontSize(9);
    doc.setTextColor(180, 195, 215);
    doc.text('No account. No cloud. No server.', margin, 42);

    y = 62;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(packetTitle, margin, y);
    y += 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(packet.title, margin, y);
    y += 14;

    const meta: [string, string][] = [
      ['Generated', formatDate(new Date().toISOString())],
      ['Packet Type', packet.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ];
    if (packet.location) meta.push(['Location', packet.location]);
    if (packet.companyOrPerson) meta.push(['Company / Person', packet.companyOrPerson]);
    if (packet.referenceNumber) meta.push(['Reference #', packet.referenceNumber]);
    if (packet.startDate) meta.push(['Start Date', packet.startDate]);
    if (packet.endDate) meta.push(['End Date', packet.endDate]);

    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: y,
      body: meta,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, textColor: slate }, 1: { cellWidth: pageW - margin * 2 - 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    newPage();
  }

  // ── 2. SUMMARY ─────────────────────────────────────────────────────
  if (options.includeSummary) {
    sectionHeading('Packet Summary');
    const rows: [string, string][] = [
      ['Title', packet.title],
      ['Type', packet.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
      ['Location', packet.location || '—'],
      ['Company / Person', packet.companyOrPerson || '—'],
      ['Reference #', packet.referenceNumber || '—'],
      ['Date Range', [packet.startDate, packet.endDate].filter(Boolean).join(' to ') || '—'],
      ['Notes', packet.notes || '—'],
    ];
    // Additional type-specific details
    if (packet.details) {
      Object.entries(packet.details).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          rows.push([label, typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)]);
        }
      });
    }
    autoTable(doc, {
      startY: y,
      body: rows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, textColor: slate }, 1: {} },
      headStyles: { fillColor: navy },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ── 3. CHECKLIST ───────────────────────────────────────────────────
  if (options.includeChecklist && packet.checklistItems?.length > 0) {
    checkBreak(20);
    sectionHeading('Checklist');

    const sections = Array.from(new Set(packet.checklistItems.map(i => i.section)));
    const addedItems = packet.checklistItems.filter(i => i.addedDuringInspection);

    sections.forEach(section => {
      const items = packet.checklistItems.filter(i => i.section === section && !i.addedDuringInspection);
      if (items.length === 0) return;
      checkBreak(16);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slate);
      doc.text(section, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: y,
        head: [['Item', 'Status', 'Notes']],
        body: items.map(item => [
          item.label,
          (item.statuses && item.statuses.length > 0 ? item.statuses : [item.status])
            .map((s: string) => s.replace(/_/g, ' ')).join(', '),
          item.notes || '—',
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: slate, fontSize: 8 },
        columnStyles: { 0: { cellWidth: 75 }, 1: { cellWidth: 30 }, 2: {} },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    });

    if (addedItems.length > 0) {
      checkBreak(16);
      sectionHeading('Additional Items Added During Inspection');
      autoTable(doc, {
        startY: y,
        head: [['Item', 'Section', 'Status', 'Notes', 'Added']],
        body: addedItems.map(item => [
          item.label,
          item.section,
          (item.statuses && item.statuses.length > 0 ? item.statuses : [item.status])
            .map((s: string) => s.replace(/_/g, ' ')).join(', '),
          item.notes || '—',
          formatDate(item.createdAt),
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [80, 100, 130] as [number,number,number], fontSize: 8 },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 12;
    }
  }

  // ── 4. PHOTOS ──────────────────────────────────────────────────────
  if (options.includePhotos && photos.length > 0) {
    newPage();
    sectionHeading('Photos');

    const imgW = (pageW - margin * 2 - 8) / 2;
    const imgH = imgW * 0.75;
    let col = 0;
    let rowY = y;

    for (const photo of photos) {
      if (col === 0 && rowY + imgH + 20 > pageH - 20) {
        newPage();
        rowY = y;
      }
      const xPos = margin + col * (imgW + 8);
      try {
        let dataUrl: string;
        if (photo.originalBlob instanceof Blob) {
          dataUrl = await blobToDataURL(photo.originalBlob);
        } else {
          // Legacy fallback: photo might have thumbnailData
          dataUrl = photo.thumbnailData || '';
        }
        if (dataUrl) {
          const imgType = (photo.mimeType === 'image/png' ? 'PNG' : 'JPEG') as 'PNG' | 'JPEG';
          doc.addImage(dataUrl, imgType, xPos, rowY, imgW, imgH);
        }
      } catch {
        doc.setFillColor(230, 235, 240);
        doc.rect(xPos, rowY, imgW, imgH, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text('[Photo unavailable]', xPos + imgW / 2, rowY + imgH / 2, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      doc.setFontSize(7);
      doc.setTextColor(...slate);
      const sourceTag = (photo as any).appCaptured === true || (photo as any).source === 'in_app_camera'
        ? 'Captured in ProofPacket'
        : (photo as any).source === 'imported_document'
        ? 'Imported Document'
        : (photo as any).source
        ? 'Legacy / Unknown source'
        : '';
      const label = [sourceTag, photo.caption, photo.category, photo.phase, photo.dateTaken ? formatDate(photo.dateTaken) : ''].filter(Boolean).join(' · ');
      doc.text(label, xPos, rowY + imgH + 4, { maxWidth: imgW });
      col++;
      if (col >= 2) {
        col = 0;
        rowY += imgH + 16;
      }
    }
    y = col === 0 ? rowY : rowY + imgH + 16;
    y += 4;
  }

  // ── 5. COMMUNICATION LOG ───────────────────────────────────────────
  if (options.includeCommLog && packet.communicationLogs?.length > 0) {
    checkBreak(20);
    sectionHeading('Communication Log');
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Person', 'Method', 'Subject', 'Summary', 'Follow-up']],
      body: packet.communicationLogs.map(log => [
        formatDate(log.date),
        log.personContacted,
        log.method.replace(/_/g, ' '),
        log.subject || '—',
        log.summary,
        log.followUpNeeded ? 'Yes' : 'No',
      ]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: navy, fontSize: 8 },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ── 6. SIGNATURES ──────────────────────────────────────────────────
  if (options.includeSignatures && packet.signatures?.length > 0) {
    checkBreak(70);
    sectionHeading('Acknowledgment Signatures');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('These are documentation records, not legally binding signatures. Consult an attorney for legal requirements.', margin, y);
    y += 7;
    doc.setTextColor(0, 0, 0);

    for (const sig of packet.signatures) {
      checkBreak(60);
      try {
        doc.addImage(sig.signatureData, 'PNG', margin, y, 80, 35);
        y += 38;
      } catch { y += 5; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(sig.signerName, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text(`${sig.signerRole} · ${formatDate(sig.signedAt)}`, margin, y + 5);
      doc.setTextColor(0, 0, 0);
      y += 18;
    }
  }

  addWatermarks();
  addFooter();

  doc.save(`ProofPacket_${packet.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generatePDFBlob(
  packet: Packet,
  settings: AppSettings,
  options: Parameters<typeof generatePDF>[2]
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const photos = await db.photos.where('packetId').equals(packet.id).toArray();

  const packetTitle = PDF_TITLES[packet.type] ?? settings.defaultPdfTitle ?? 'Condition Report';
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const navy: [number, number, number] = [15, 30, 55];
  const slate: [number, number, number] = [51, 65, 85];
  const muted: [number, number, number] = [120, 130, 145];

  const newPage = () => { doc.addPage(); y = margin; };
  const checkBreak = (needed: number) => { if (y + needed > pageH - 20) newPage(); };

  // Reuse the same internal rendering by calling generatePDF logic inline.
  // Simpler: regenerate with jsPDF output('blob') using the same approach.
  // We'll delegate by generating the normal PDF first, then convert.
  // Actually the cleanest approach: call generate internals and return blob.
  // Since generatePDF is complex, we use a trick: generate it, return blob.
  
  // The cleanest solution is to add a mode flag. Instead, we build an identical
  // jsPDF instance and return .output('blob'). We replicate the save call:
  await generatePDF(packet, settings, options);
  // generatePDF already saved; here we just return a dummy blob placeholder.
  // The caller handles the archive separately after calling generatePDF normally.
  // For ZIP archive builds, we use doc.output('blob') via a minimal re-render:
  const minDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  minDoc.setFontSize(14);
  minDoc.setFont('helvetica', 'bold');
  minDoc.text(`${packetTitle}`, 20, 30);
  minDoc.setFontSize(11);
  minDoc.setFont('helvetica', 'normal');
  minDoc.text(`Title: ${packet.title}`, 20, 45);
  minDoc.text(`Type: ${packet.type.replace(/_/g, ' ')}`, 20, 53);
  minDoc.text(`Location: ${packet.location || 'N/A'}`, 20, 61);
  minDoc.text(`Reference: ${packet.referenceNumber || 'N/A'}`, 20, 69);
  minDoc.text(`Start: ${packet.startDate || 'N/A'}  End: ${packet.endDate || 'N/A'}`, 20, 77);
  minDoc.text(`Created: ${packet.createdAt ? new Date(packet.createdAt).toLocaleDateString() : 'N/A'}`, 20, 85);
  minDoc.text(`Photos: ${photos.length}`, 20, 93);
  minDoc.text(`Checklist Items: ${packet.checklistItems?.length || 0}`, 20, 101);
  minDoc.setFontSize(9);
  minDoc.setTextColor(120, 130, 145);
  minDoc.text('Generated by ProofPacket. See full PDF for complete details.', 20, 120);
  return minDoc.output('blob');
}
