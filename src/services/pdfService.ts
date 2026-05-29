import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  phone: string;
  packageName: string;
  speed: string;
  amount: number;
  dueDate: string;
  status: string;
  createdDate: string;
}

const officeInfo = {
  address: 'Ghari Ikhtiar Khan',
  contacts: [
    { name: 'Muhammad Ramzan', phone: '03040232330' },
    { name: 'Muhammad Bilal', phone: '03039496671' },
    { name: 'JAM Majid', phone: '03047522234' },
  ],
};

const drawOfficeInfo = (doc: jsPDF, startY: number, themeColor: [number, number, number]) => {
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, startY, 170, 30, 3, 3, 'FD');

  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICE ADDRESS & CONTACTS', 26, startY + 7);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Address: ${officeInfo.address}`, 26, startY + 14);

  officeInfo.contacts.forEach((contact, index) => {
    const x = 26 + index * 54;
    doc.setFont('helvetica', 'bold');
    doc.text(contact.name, x, startY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(contact.phone, x, startY + 27);
  });
};

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const themeColor: [number, number, number] = [79, 70, 229]; // Indigo-600

  // Header
  doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MR NETWORK', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Internet Services Provider', 20, 32);

  doc.setFontSize(18);
  doc.text('INVOICE', 160, 25);
  doc.setFontSize(10);
  doc.text(`#${data.invoiceNumber}`, 160, 32);

  // Business Info & Customer Info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName, 20, 62);
  doc.text(`Phone: ${data.phone}`, 20, 68);

  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS:', 130, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${data.createdDate}`, 130, 62);
  doc.text(`Due Date: ${data.dueDate}`, 130, 68);
  doc.text(`Status: ${data.status.toUpperCase()}`, 130, 74);

  drawOfficeInfo(doc, 82, themeColor);

  // Table
  autoTable(doc, {
    startY: 122,
    head: [['Description', 'Package', 'Speed', 'Total']],
    body: [
      ['Internet Service Subscription', data.packageName, data.speed, `Rs. ${data.amount.toLocaleString()}`],
    ],
    headStyles: {
      fillColor: themeColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  doc.setDrawColor(200, 200, 200);
  doc.line(130, finalY, 190, finalY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL:', 130, finalY + 10);
  doc.setFontSize(14);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text(`Rs. ${data.amount.toLocaleString()}`, 190, finalY + 10, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing MR NETWORK.', 105, 280, { align: 'center' });
  doc.text('This is a computer generated invoice and does not require a signature.', 105, 285, { align: 'center' });

  doc.save(`Invoice_${data.invoiceNumber}.pdf`);
};

export const generateReceiptPDF = (data: InvoiceData & { paymentMethod: string; reference: string }) => {
  const doc = new jsPDF();
  const themeColor: [number, number, number] = [16, 185, 129]; // Emerald-500 for Receipt

  // Header
  doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MR NETWORK', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Receipt', 20, 32);

  doc.setFontSize(18);
  doc.text('PAID', 160, 25);
  doc.setFontSize(10);
  doc.text(`Ref: ${data.reference}`, 160, 32);

  // Body
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT CONFIRMED', 105, 60, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const bodyText = `Received from ${data.customerName} the sum of Rs. ${data.amount.toLocaleString()} for ${data.packageName} internet service.`;
  const splitText = doc.splitTextToSize(bodyText, 160);
  doc.text(splitText, 25, 75);

  drawOfficeInfo(doc, 92, themeColor);

  autoTable(doc, {
    startY: 130,
    body: [
      ['Reference ID', data.reference],
      ['Payment Method', data.paymentMethod],
      ['Package', data.packageName],
      ['Amount Paid', `Rs. ${data.amount.toLocaleString()}`],
      ['Date', data.createdDate],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 8
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Visit our dashboard to see your balance and payment history.', 105, 280, { align: 'center' });
  doc.save(`Receipt_${data.reference}.pdf`);
};
