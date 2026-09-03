type AnyRecord = Record<string, any>;

function safe(v: any) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
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

function toCsv(rows: AnyRecord[]) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escapeCell = (val: any) => {
    const s = safe(val);
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

/**
 * Professional Excel Table Export with formatting:
 * - AutoFilter
 * - Header Row Freeze (Freeze Panes)
 * - Auto Column Widths
 */
export async function generateExcelTableFile(rows: AnyRecord[], filenamePrefix = "ATTR_Patient_List") {
  if (!rows || !rows.length) {
    const blob = new Blob(["No patient records found"], { type: "text/plain;charset=utf-8" });
    downloadBlob(`${filenamePrefix}_Empty.txt`, blob);
    return;
  }

  const dateTag = new Date().toISOString().slice(0, 10);
  const fullFileName = `${filenamePrefix}_${dateTag}.xlsx`;

  try {
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.json_to_sheet(rows);

    const keys = Object.keys(rows[0]);
    const rowCount = rows.length;
    const colCount = keys.length;

    // 1) Set AutoFilter across all columns
    ws["!autofilter"] = {
      ref: xlsx.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: colCount - 1, r: rowCount },
      }),
    };

    // 2) Freeze Header Row (Row 1 fixed)
    ws["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" }];

    // 3) Calculate optimal Column Widths
    const colWidths = keys.map((key) => {
      let maxLen = key.length;
      for (const row of rows) {
        const valStr = String(row[key] ?? "");
        if (valStr.length > maxLen) maxLen = valStr.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
    ws["!cols"] = colWidths;

    // Create workbook and download
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Patient List");
    xlsx.writeFile(wb, fullFileName);
  } catch (e) {
    console.warn("SheetJS XLSX failed, falling back to CSV", e);
    const csv = toCsv(rows);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`${filenamePrefix}_${dateTag}.csv`, blob);
  }
}

// Backward compatibility export function name
export async function exportPatientsToExcel(patients: any[]) {
  return generateExcelTableFile(patients);
}

