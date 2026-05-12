import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Packet, AppSettings, PhotoItem } from '../types';
import { db } from '../storage/db';
import { format } from 'date-fns';

export async function generatePDF(packet: Packet, settings: AppSettings, options: {
  includeCover: boolean;
  includeSummary: boolean;
  includeChecklist: boolean;
  includePhotos: boolean;
  includeCommLog: boolean;
  includeSignatures: boolean;
  includeDisclaimer: boolean;
}) {
  const doc = new jsPDF();
  const photos = await db.photos.where('packetId').equals(packet.id).toArray();
  
  const title = settings.defaultPdfTitle || 'Condition Report';
  let yPos = 20;

  // Helper for adding new page
  const checkPageBreak = (needed: number) => {
    if (yPos + needed > 280) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // 1. Cover Page
  if (options.includeCover) {
    doc.setFontSize(24);
    doc.text('ProofPacket', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(18);
    doc.text(title, 105, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(12);
    doc.text(`Packet: ${packet.title}`, 20, yPos);
    yPos += 10;
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, yPos);
    yPos += 10;
    if (packet.location) {
      doc.text(`Location: ${packet.location}`, 20, yPos);
      yPos += 10;
    }
    if (packet.companyOrPerson) {
      doc.text(`Company/Person: ${packet.companyOrPerson}`, 20, yPos);
      yPos += 10;
    }

    doc.addPage();
    yPos = 20;
  }

  // 2. Summary
  if (options.includeSummary) {
    doc.setFontSize(16);
    doc.text('Packet Summary', 20, yPos);
    yPos += 10;

    const summaryData = [
      ['Title', packet.title],
      ['Type', packet.type.replace(/_/g, ' ')],
      ['Date Range', `${packet.startDate} to ${packet.endDate}`],
      ['Reference', packet.referenceNumber || 'N/A'],
      ['Notes', packet.notes || 'None']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Field', 'Details']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] } // slate-800
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // 3. Checklist
  if (options.includeChecklist && packet.checklistItems.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.text('Checklist', 20, yPos);
    yPos += 10;

    const sections = Array.from(new Set(packet.checklistItems.map(i => i.section)));
    
    sections.forEach(section => {
      const items = packet.checklistItems.filter(i => i.section === section);
      
      autoTable(doc, {
        startY: yPos,
        head: [[section, 'Status', 'Notes']],
        body: items.map(item => [
          item.label,
          item.status.replace(/_/g, ' '),
          item.notes || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] } // slate-700
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      checkPageBreak(20);
    });
  }

  // 4. Photos
  if (options.includePhotos && photos.length > 0) {
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.text('Photos', 20, yPos);
    yPos += 15;

    let xPos = 20;
    const imgWidth = 80;
    const imgHeight = 60;

    for (const photo of photos) {
      if (yPos + imgHeight + 20 > 280) {
        doc.addPage();
        yPos = 20;
        xPos = 20;
      }

      try {
        doc.addImage(photo.imageData, 'JPEG', xPos, yPos, imgWidth, imgHeight);
        doc.setFontSize(10);
        doc.text(photo.caption || photo.category, xPos, yPos + imgHeight + 5);
        doc.text(format(new Date(photo.dateTaken), 'PPp'), xPos, yPos + imgHeight + 10);
        
        xPos += imgWidth + 10;
        if (xPos > 120) {
          xPos = 20;
          yPos += imgHeight + 20;
        }
      } catch (e) {
        console.error("Failed to add image to PDF", e);
      }
    }
  }

  // 5. Signatures
  if (options.includeSignatures && packet.signatures && packet.signatures.length > 0) {
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.text('Signatures', 20, yPos);
    yPos += 15;

    for (const sig of packet.signatures) {
      checkPageBreak(60);
      try {
        doc.addImage(sig.signatureData, 'PNG', 20, yPos, 80, 40);
        yPos += 45;
        doc.setFontSize(12);
        doc.text(`Name: ${sig.signerName}`, 20, yPos);
        yPos += 6;
        doc.text(`Role: ${sig.signerRole}`, 20, yPos);
        yPos += 6;
        doc.text(`Date: ${format(new Date(sig.signedAt), 'PPpp')}`, 20, yPos);
        yPos += 15;
      } catch (e) {
        console.error("Failed to add signature to PDF", e);
      }
    }
  }

  // Watermark
  if (settings.watermarkExports) {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setTextColor(200);
      doc.setFontSize(60);
      // add rotated text
      doc.text('ProofPacket', 105, 150, { align: 'center', angle: 45, opacity: 0.1 } as any);
      doc.setTextColor(0); // reset
    }
  }

  // Disclaimer
  if (options.includeDisclaimer || settings.showDisclaimer) {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      const text = "ProofPacket is an organization and documentation tool. It does not provide legal, insurance, medical, safety, code-compliance, inspection, appraisal, valuation, or professional advice.";
      doc.text(text, 105, 290, { align: 'center', maxWidth: 180 });
      doc.setTextColor(0);
    }
  }

  doc.save(`${title.replace(/ /g, '_')}_${packet.id.substring(0,6)}.pdf`);
}
