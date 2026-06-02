/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isValid } from 'date-fns';

export async function generateAppointmentLetterPDF(employee: any, settings: any) {
  const doc = new jsPDF();

  const brandName = settings?.brandName || "NB Safa Agro";
  const brandEmail = settings?.contact?.email || "info@nbsafaagro.com";
  const brandPhone = settings?.contact?.phone || "+880 1711-583424";
  const brandAddress = settings?.contact?.address || "Dhaka Cantonment, Dhaka, Bangladesh";

  // Brand Colors (Emerald/Green/Earth themed)
  const primaryColor: [number, number, number] = [21, 128, 61]; // #15803d (Emerald 700)
  const darkZinc: [number, number, number] = [39, 39, 42]; // Zinc 800
  const secondaryColor: [number, number, number] = [113, 113, 122]; // Zinc 500
  const lightZinc: [number, number, number] = [244, 244, 245]; // Zinc 100

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 15, 'F');

  // 2. Brand Name & Contact
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(brandName.toUpperCase(), 14, 30);

  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(brandAddress, 14, 35);
  doc.text(`Email: ${brandEmail} | Phone: ${brandPhone}`, 14, 39);

  // 3. Document Title
  doc.setFontSize(18);
  doc.setTextColor(darkZinc[0], darkZinc[1], darkZinc[2]);
  doc.setFont("helvetica", "bold");
  doc.text("LETTER OF APPOINTMENT", 105, 55, { align: "center" });

  // Draw a double underline for the title
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(65, 58, 145, 58);
  doc.line(65, 59.5, 145, 59.5);

  // 4. Date & Ref
  const today = new Date();
  const formattedToday = format(today, "dd MMMM yyyy");
  const referenceNo = `SA-HR-${today.getFullYear()}-${String(employee._id || '').slice(-5).toUpperCase()}`;

  doc.setFontSize(9);
  doc.setTextColor(darkZinc[0], darkZinc[1], darkZinc[2]);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${referenceNo}`, 14, 70);
  doc.text(`Date: ${formattedToday}`, 196, 70, { align: "right" });

  // 5. Employee Details Block
  doc.setFont("helvetica", "bold");
  doc.text("To,", 14, 80);
  doc.setFont("helvetica", "bold");
  doc.text(employee.name.toUpperCase(), 14, 85);
  doc.setFont("helvetica", "normal");
  doc.text(`Phone: ${employee.phone}`, 14, 90);
  if (employee.address) {
    doc.text(`Address: ${employee.address}`, 14, 95);
  }

  // 6. Subject
  const joinDateRaw = employee.joiningDate ? new Date(employee.joiningDate) : new Date();
  const formattedJoinDate = isValid(joinDateRaw) ? format(joinDateRaw, "dd MMMM yyyy") : "joining date";

  doc.setFont("helvetica", "bold");
  doc.text(`Subject: Appointment as ${employee.designation}`, 14, 105);

  // 7. Body Text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const bodyText = `Dear ${employee.name},\n\nWe are pleased to offer you employment at ${brandName} as ${employee.designation}. This appointment is effective from your joining date of ${formattedJoinDate}. Your service rules and responsibilities will be guided by the ${brandName} HR handbook.\n\nAs part of your compensation package, your monthly salary structure is detailed as follows:`;
  const splitBody = doc.splitTextToSize(bodyText, 182);
  doc.text(splitBody, 14, 112);

  // 8. Salary Structure Table
  const basic = Number(employee.salaryStructure?.basic) || 0;
  const allowance = Number(employee.salaryStructure?.allowance) || 0;
  const deductions = Number(employee.salaryStructure?.deductions) || 0;
  const netSalary = basic + allowance - deductions;

  const salaryRows = [
    ["Basic Salary", `BDT ${basic.toLocaleString()}`],
    ["Allowances (Conveyance, Medical, etc.)", `BDT ${allowance.toLocaleString()}`],
    ["Deductions (Taxes, Provident, etc.)", `BDT ${deductions.toLocaleString()}`],
    ["Net Monthly Take-home", `BDT ${netSalary.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: 135,
    head: [["Salary Component", "Amount (Monthly)"]],
    body: salaryRows,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkZinc,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: "right", cellWidth: 62 }
    },
    didParseCell: (data) => {
      // Bold the last row (Net Monthly Take-home)
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 245, 235];
      }
    }
  });

  const finalTableY = (doc as any).lastAutoTable.finalY + 10;

  // 9. Terms and Conditions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Terms of Appointment:", 14, finalTableY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termsText = [
    "1. Probation Period: You will be on probation for a period of three (3) months, after which your performance will be reviewed for confirmation.",
    "2. Duties & Responsibility: You are required to submit daily production, field sales, or general task work reports to your reporting Manager.",
    "3. Termination: Either party may terminate this employment by giving thirty (30) days written notice or equivalent base salary in lieu thereof."
  ];

  let currentY = finalTableY + 5;
  termsText.forEach((term) => {
    const splitTerm = doc.splitTextToSize(term, 182);
    doc.text(splitTerm, 14, currentY);
    currentY += (splitTerm.length * 4) + 2;
  });

  // 10. Signature Blocks
  const pageHeight = doc.internal.pageSize.height;
  const signatureY = pageHeight - 35;

  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);

  // Line for Employer
  doc.line(14, signatureY, 74, signatureY);
  // Line for Employee
  doc.line(136, signatureY, 196, signatureY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkZinc[0], darkZinc[1], darkZinc[2]);
  doc.text("Authorized Signature", 14, signatureY + 4);
  doc.text("Employee Signature", 136, signatureY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(brandName, 14, signatureY + 8);
  doc.text(employee.name, 136, signatureY + 8);

  // Footer text
  doc.setFont("helvetica", "italic");
  doc.text("This letter is a legally binding contract of employment upon signing by both parties.", 105, pageHeight - 10, { align: "center" });

  // Save PDF
  const safeName = employee.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`niyogpatra_${safeName}.pdf`);
}
