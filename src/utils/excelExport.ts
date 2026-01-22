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

/**
 * Strapi Patient modeline uygun Excel export
 * - xlsx varsa .xlsx
 * - yoksa csv fallback
 */
export async function exportPatientsToExcel(patients: any[]) {
  const rows = (patients ?? []).map((p) => ({
    ID: p?.id ?? "",
    "Document ID": safe(p?.documentId),
    "Full Name": `${safe(p?.firstName)} ${safe(p?.lastName)}`.trim() || `Patient #${p?.id ?? ""}`,
    Status: safe(p?.statu) || safe(p?.status), // statu = Strapi, status = eski dummy
    Gender: safe(p?.gender),
    "Date of Birth": safe(p?.dateOfBirth),
    Age: calcAge(p?.dateOfBirth),
    Phone: safe(p?.contactNumber) || safe(p?.phone),
    Email: safe(p?.email),
    "KVKK Consent Status": safe(p?.kvkkConsentStatus),
    "KVKK Consent At": safe(p?.kvkkConsentAt),
    "Clinical Status": cleanMultiline(p?.clinicalStatus),
    "Created At": safe(p?.createdAt),
    "Updated At": safe(p?.updatedAt),
    "Published At": safe(p?.publishedAt),
  }));

  if (!rows.length) {
    // boşsa yine de bir dosya indir (kafa karışmasın)
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

    // Tarayıcıda writeFile çalışır
    xlsx.writeFile(wb, `patients_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return;
  } catch (e) {
    // 2) CSV fallback
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`patients_${new Date().toISOString().slice(0, 10)}.csv`, blob);
  }
}
