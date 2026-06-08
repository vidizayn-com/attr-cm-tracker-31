type AnyRecord = Record<string, any>;

function safe(v: any) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function cleanMultiline(v: any) {
  return safe(v).replace(/\r?\n/g, " ");
}

function calcAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "";
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

function toCsv(rows: AnyRecord[]) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escapeCell = (val: any) => {
    const s = safe(val);
    // CSV escaping
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(",")),
  ];
  return lines.join("\n");
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatToGMT3(dateStr: any) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return String(dateStr);

    // If it is just a date string (no 'T' and length is 10, e.g., '2026-06-08')
    if (typeof dateStr === 'string' && dateStr.length === 10 && !dateStr.includes('T')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return dateStr;
    }

    const formatter = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    return formatter.format(date);
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Strapi Patient modeline uygun Excel export
 * - xlsx varsa .xlsx
 * - yoksa csv fallback
 */
export async function exportPatientsToExcel(patients: any[]) {
  const rows = (patients ?? []).map((p) => {
    const findings = p?.clinicalFindings ?? {};
    const redFlags = p?.redFlagSymptoms ?? {};
    const relative = (p?.patient_relatives ?? [])[0] ?? {};

    return {
      ID: p?.id ?? "",
      "Document ID": safe(p?.documentId),
      "First Name": safe(p?.firstName),
      "Last Name": safe(p?.lastName),
      "Full Name": `${safe(p?.firstName)} ${safe(p?.lastName)}`.trim() || `Patient #${p?.id ?? ""}`,
      Gender: safe(p?.gender),
      "Date of Birth": safe(p?.dateOfBirth),
      Age: calcAge(p?.dateOfBirth),
      Phone: safe(p?.contactNumber) || safe(p?.phone),
      Email: safe(p?.email),
      Address: safe(p?.address),
      "Allow Caregiver": p?.allowCaregiver ? "Yes" : "No",
      Status: safe(p?.statu) || safe(p?.status),
      "Cancellation Reason": safe(p?.cancellationReason),
      
      // KVKK
      "KVKK Consent Status": safe(p?.kvkkConsentStatus),
      "KVKK Consent At (GMT+3)": formatToGMT3(p?.kvkkConsentAt),
      
      // Clinical Status
      "Clinical Status": cleanMultiline(p?.clinicalStatus),
      
      // Doctors
      "Primary Cardiologist": safe(p?.primary_cardiologist?.fullName) || safe(p?.primary_cardiologist?.id),
      "Assigned Specialists": (p?.assigned_specialists ?? []).map((s: any) => s.fullName).join(", "),
      
      // Pool
      "Pool Institution": safe(p?.pool_institution?.name),
      "Pool Specialty": safe(p?.pool_specialty),

      // Caregiver details
      "Caregiver Full Name": safe(relative.fullName),
      "Caregiver Phone": safe(relative.phone),
      "Caregiver Email": safe(relative.email),
      "Caregiver Relation": safe(relative.relationToPatient),

      // Clinical Findings
      "Clinical Finding: LVH >= 12mm": findings.lvh12 ? "Yes" : "No",
      "Clinical Finding: LVH Value (mm)": safe(findings.lvh12Value),
      "Clinical Finding: NT-proBNP": findings.ntProBnp ? "Yes" : "No",
      "Clinical Finding: NT-proBNP Value (pg/mL)": safe(findings.ntProBnpValue),
      "Clinical Finding: BNP Value (pg/mL)": safe(findings.bnpValue),
      "Clinical Finding: EF < 40%": findings.ef40 ? "Yes" : "No",
      "Clinical Finding: EF Value (%)": safe(findings.ef40Value),
      "Clinical Finding: GFR < 30": findings.gfr30 ? "Yes" : "No",
      "Clinical Finding: GFR Value (mL/min/1.73m²)": safe(findings.gfr30Value),
      "Clinical Finding: Age >= 65": findings.age65 ? "Yes" : "No",
      "Clinical Finding: Age Value": safe(findings.age65Value),

      // Red Flags
      "Red Flag: ECG Hypovoltage": redFlags.ecgHypovoltage ? "Yes" : "No",
      "Red Flag: Pericardial Effusion": redFlags.pericardialEffusion ? "Yes" : "No",
      "Red Flag: Biatrial Dilation": redFlags.biatrialDilation ? "Yes" : "No",
      "Red Flag: Thickening of Interatrial Septum": redFlags.thickeningInteratrialSeptum ? "Yes" : "No",
      "Red Flag: 5-5-5 Finding": redFlags.fiveFiveFiveFinding ? "Yes" : "No",
      "Red Flag: Diastolic Dysfunction": redFlags.diastolicDysfunction ? "Yes" : "No",
      "Red Flag: Intolerance to Heart Failure Medications": redFlags.intoleranceHeartFailure ? "Yes" : "No",
      "Red Flag: Spontaneous Resolution of Hypertension": redFlags.spontaneousResolutionHypertension ? "Yes" : "No",
      "Red Flag: TAVI / Aortic Stenosis": redFlags.taviAorticStenosis ? "Yes" : "No",
      "Red Flag: Other": redFlags.other ? "Yes" : "No",
      "Red Flag: Other Value": safe(redFlags.otherValue),

      // Dates
      "Last Visit (GMT+3)": formatToGMT3(p?.lastVisit),
      "Next Appointment (GMT+3)": formatToGMT3(p?.nextAppointment),
      "Report Deadline (GMT+3)": formatToGMT3(p?.reportDeadline),
      "Last Report Date (GMT+3)": formatToGMT3(p?.lastReportDate),
      "Created At (GMT+3)": formatToGMT3(p?.createdAt),
      "Updated At (GMT+3)": formatToGMT3(p?.updatedAt),
      "Published At (GMT+3)": formatToGMT3(p?.publishedAt),
    };
  });

  if (!rows.length) {
    const blob = new Blob(["No data"], { type: "text/plain;charset=utf-8" });
    downloadBlob("patients-empty.txt", blob);
    return;
  }

  // 1) .xlsx dene
  try {
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Patients");

    xlsx.writeFile(wb, `patients_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return;
  } catch (e) {
    // 2) CSV fallback
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`patients_${new Date().toISOString().slice(0, 10)}.csv`, blob);
  }
}
