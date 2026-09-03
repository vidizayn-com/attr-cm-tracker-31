import { jsPDF } from "jspdf";

export interface PatientPdfData {
  id: number | string;
  documentId?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  email?: string;
  statu?: string;
  institutionName?: string;
  primaryCardiologistName?: string;
  clinicalFindings?: any;
  redFlagSymptoms?: any;
}

export function generatePatientDiagnosisPdf(patient: PatientPdfData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const leftMargin = 15;
  const rightMargin = 15;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 180mm
  const bottomMargin = 22;

  let currentY = 15;

  // Helper: Page overflow check
  function checkPageBreak(neededHeight: number) {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  }

  // ── 1. Top Header Banner ──
  // Brand Header Line
  doc.setFillColor(8, 155, 171); // #089bab
  doc.rect(0, 0, pageWidth, 6, "F");

  // Title Box
  currentY = 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(5, 106, 117); // #056a75
  doc.text("PATIENT DIAGNOSIS REPORT", leftMargin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748b
  const nowStr = new Date().toLocaleDateString("tr-TR") + " " + new Date().toLocaleTimeString("tr-TR");
  doc.text(`Generated on: ${nowStr}`, pageWidth - rightMargin, currentY, { align: "right" });

  currentY += 4;
  doc.setFontSize(9);
  doc.setTextColor(8, 155, 171);
  doc.text("ATTR Navigator • Clinical Medical Summary", leftMargin, currentY);

  currentY += 6;
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.5);
  doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);

  currentY += 8;

  // ── 2. Patient Information Card ──
  const infoCardHeight = 36;
  checkPageBreak(infoCardHeight);

  // Card Outer Box
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, currentY, contentWidth, infoCardHeight, 3, 3, "FD");

  // Card Title Bar
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.roundedRect(leftMargin, currentY, contentWidth, 8, 3, 3, "F");
  // Sharp bottom for top title bar
  doc.rect(leftMargin, currentY + 5, contentWidth, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(5, 106, 117);
  doc.text("PATIENT INFORMATION", leftMargin + 4, currentY + 5.5);

  // Divider under card title
  doc.setDrawColor(226, 232, 240);
  doc.line(leftMargin, currentY + 8, leftMargin + contentWidth, currentY + 8);

  // Content Inside Card (Grid)
  const col1X = leftMargin + 6;
  const col2X = leftMargin + 66;
  const col3X = leftMargin + 126;

  let infoY = currentY + 14;

  const patientName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || `Patient #${patient.id}`;
  const patientId = String(patient.id || "-");
  const status = patient.statu || "New";
  const doctorName = patient.primaryCardiologistName || "-";
  const hospital = patient.institutionName || "-";
  const genderDob = [patient.gender, patient.dateOfBirth].filter(Boolean).join(" • ") || "-";

  // Row 1
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Patient Name", col1X, infoY);
  doc.text("Patient ID", col2X, infoY);
  doc.text("Status", col3X, infoY);

  infoY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(patientName, col1X, infoY);
  doc.text(patientId, col2X, infoY);
  doc.text(status, col3X, infoY);

  // Divider line
  infoY += 3;
  doc.setDrawColor(241, 245, 249);
  doc.line(leftMargin + 4, infoY, leftMargin + contentWidth - 4, infoY);

  // Row 2
  infoY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Gender / DOB", col1X, infoY);
  doc.text("Primary Cardiologist", col2X, infoY);
  doc.text("Hospital / Institution", col3X, infoY);

  infoY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(genderDob, col1X, infoY);
  doc.text(doctorName, col2X, infoY);
  doc.text(hospital, col3X, infoY);

  currentY += infoCardHeight + 8;

  // ── Section Title Component ──
  function drawSectionHeader(titleText: string) {
    checkPageBreak(14);
    doc.setFillColor(241, 245, 249); // #f1f5f9
    doc.rect(leftMargin, currentY, contentWidth, 7, "F");

    // Left brand indicator bar
    doc.setFillColor(8, 155, 171);
    doc.rect(leftMargin, currentY, 3, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(5, 106, 117);
    doc.text(titleText, leftMargin + 6, currentY + 5);

    currentY += 10;
  }

  const cf = patient.clinicalFindings || {};

  // ── 3. Significant Clinical Findings ──
  drawSectionHeader("SIGNIFICANT CLINICAL FINDINGS");

  const clinicalItems: string[] = [];
  if (cf.lvh12) clinicalItems.push(`LVH >12mm (${cf.lvh12Value ? cf.lvh12Value + "mm" : "Positive"})`);
  if (cf.ntProBnp) clinicalItems.push(`Elevated NT-proBNP (${cf.ntProBnpValue ? cf.ntProBnpValue + " pg/mL" : "Positive"})`);
  if (cf.bnpValue) clinicalItems.push(`BNP (${cf.bnpValue} pg/mL)`);
  if (cf.ef40) clinicalItems.push(`Preserved EF (${cf.ef40Value ? cf.ef40Value + "%" : "Positive"})`);
  if (cf.gfr30) clinicalItems.push(`GFR >30 (${cf.gfr30Value ? cf.gfr30Value + " ml/min/1.73m²" : "Positive"})`);
  if (cf.age65) clinicalItems.push(`Age ≥65 years (${cf.age65Value ? cf.age65Value + " years" : "Positive"})`);

  if (clinicalItems.length === 0) {
    clinicalItems.push("No significant clinical findings recorded");
  }

  // Draw Findings Box
  checkPageBreak(clinicalItems.length * 6 + 6);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, currentY, contentWidth, clinicalItems.length * 6 + 4, 2, 2, "FD");

  let itemY = currentY + 5;
  clinicalItems.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(8, 155, 171);
    doc.text("•", leftMargin + 4, itemY);

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(item, leftMargin + 8, itemY);
    itemY += 6;
  });

  currentY += clinicalItems.length * 6 + 10;

  // ── 4. Specialty Findings ──
  drawSectionHeader("SPECIALTY FINDINGS");

  // 4A. Echocardiography (Cardiology)
  checkPageBreak(38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("ECHOCARDIOGRAPHY", leftMargin, currentY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("(Cardiology)", leftMargin + 42, currentY);

  currentY += 4;

  // Echo Table Header
  const echoTableX = leftMargin;
  const echoTableWidth = contentWidth;
  const colFindingWidth = 80;
  const colResultWidth = echoTableWidth - colFindingWidth;

  doc.setFillColor(8, 155, 171);
  doc.rect(echoTableX, currentY, echoTableWidth, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Finding / Parameter", echoTableX + 4, currentY + 4.2);
  doc.text("Result", echoTableX + colFindingWidth + 4, currentY + 4.2);

  currentY += 6;

  const echoRows = [
    { label: "Ejection Fraction (EF)", val: cf.echoEfValue ? `${cf.echoEfValue}%` : "-" },
    { label: "Interventricular Septal Thickness (IVS)", val: cf.echoIvsValue ? `${cf.echoIvsValue} mm` : "-" },
    { label: "Posterior Wall Thickness (PW)", val: cf.echoPwValue ? `${cf.echoPwValue} mm` : "-" },
    { label: "Systolic/Diastolic Dysfunction (SDD)", val: cf.echoSddValue || "-" },
    { label: "Left Atrial Diameter (LA)", val: cf.echoLaValue ? `${cf.echoLaValue} mm` : "-" },
  ];

  echoRows.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(echoTableX, currentY, echoTableWidth, 5.5, "F");

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(echoTableX, currentY + 5.5, echoTableX + echoTableWidth, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(row.label, echoTableX + 4, currentY + 3.8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(row.val, echoTableX + colFindingWidth + 4, currentY + 3.8);

    currentY += 5.5;
  });

  currentY += 8;

  // 4B. Other Specialty Findings
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("OTHER SPECIALTY FINDINGS", leftMargin, currentY);

  currentY += 5;

  const extraSpecialties = [
    {
      discipline: "Nuclear Medicine",
      items: [
        { label: "Bone Scintigraphy (Grade)", val: cf.nmBoneScintigraphyGrade || "-" }
      ]
    },
    {
      discipline: "Genetics",
      items: [
        { label: "Anomaly / Mutation", val: cf.geneticsAnomaly || "-" }
      ]
    },
    {
      discipline: "Hematology",
      items: [
        { label: "Serum Immunofixation", val: cf.hemSerumImmunofixation || "-" },
        { label: "Urine Immunofixation", val: cf.hemUrineImmunofixation || "-" },
        { label: "Free Light Chain", val: cf.hemFreeLightChain || "-" }
      ]
    }
  ];

  extraSpecialties.forEach((spec) => {
    checkPageBreak(spec.items.length * 5 + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(8, 155, 171);
    doc.text(spec.discipline, leftMargin, currentY);

    currentY += 3.5;

    spec.items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${item.label}:`, leftMargin + 4, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(item.val, leftMargin + 65, currentY);

      currentY += 4.5;
    });

    currentY += 2;
  });

  currentY += 6;

  // ── 5. Red Flag Symptoms ──
  const rf = patient.redFlagSymptoms || {};
  const redFlagsList: string[] = [];

  if (rf.ecgHypovoltage) redFlagsList.push("ECG hypovoltage");
  if (rf.pericardialEffusion) redFlagsList.push("Pericardial effusion");
  if (rf.biatrialDilation) redFlagsList.push("Biatrial dilation");
  if (rf.thickeningInteratrialSeptum) redFlagsList.push("Thickening of interatrial septum and valves");
  if (rf.fiveFiveFiveFinding) redFlagsList.push("5-5-5 finding");
  if (rf.diastolicDysfunction) redFlagsList.push("Diastolic dysfunction with increased LV filling pressure");
  if (rf.intoleranceHeartFailure) redFlagsList.push("Intolerance to standard heart failure treatment");
  if (rf.spontaneousResolutionHypertension) redFlagsList.push("Spontaneous resolution of hypertension");
  if (rf.taviAorticStenosis) redFlagsList.push("TAVI / Aortic stenosis");
  if (rf.other && rf.otherValue) redFlagsList.push(rf.otherValue);

  const rfCardHeight = Math.max(redFlagsList.length * 5.5 + 10, 18);
  checkPageBreak(rfCardHeight + 10);

  // Red Flag Header Box (Subtle Warning Rose Palette)
  doc.setFillColor(255, 241, 242); // #fff1f2
  doc.setDrawColor(254, 205, 211); // #fecdd3
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, currentY, contentWidth, rfCardHeight, 3, 3, "FD");

  // Title bar inside Red Flag Box
  doc.setFillColor(254, 226, 226); // #fee2e2
  doc.roundedRect(leftMargin, currentY, contentWidth, 7, 3, 3, "F");
  doc.rect(leftMargin, currentY + 4, contentWidth, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(153, 27, 27); // #991b1b
  doc.text("RED FLAG SYMPTOMS", leftMargin + 4, currentY + 5);

  let rfY = currentY + 12;
  if (redFlagsList.length > 0) {
    redFlagsList.forEach((flag) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text("•", leftMargin + 4, rfY);

      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(flag, leftMargin + 8, rfY);
      rfY += 5.5;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("• No red flag symptoms recorded", leftMargin + 4, rfY);
  }

  currentY += rfCardHeight + 10;

  // ── 6. Page Footers (Loop across all pages) ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 12;

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(leftMargin, footerY - 3, pageWidth - rightMargin, footerY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // #94a3b8

    doc.text(`Generated on: ${nowStr}`, leftMargin, footerY);
    doc.text(`ATTR Navigator Medical Systems • Page ${p} of ${totalPages}`, pageWidth - rightMargin, footerY, { align: "right" });
  }

  // Save the PDF
  const cleanFirstName = (patient.firstName || "").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanLastName = (patient.lastName || "").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Patient_Diagnosis_Report_${cleanFirstName}_${cleanLastName}.pdf`);
}
