// src/pages/PatientDetails.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { Copy, TrendingUp, Building2, ClipboardList, UserPlus, FileBarChart, Pencil, Save, ArrowLeft } from "lucide-react";

import CombinedExaminations from "@/components/CombinedExaminations";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import {
  fetchPatientByAnyId,
  updatePatientByAnyId,
  fetchMeasurementsByPatient,
  createMeasurement,
  type Patient as StrapiPatient,
} from "@/lib/strapi";
import { strapiGet, strapiPut } from "@/lib/strapiClient";

type ClinicalFindings = {
  lvh12: boolean;
  lvh12Value: string;

  ntProBnp: boolean;
  ntProBnpValue: string;
  bnpValue: string;

  ef40: boolean;
  ef40Value: string;

  gfr30: boolean;
  gfr30Value: string;

  age65: boolean;
  age65Value: string;
};

type RedFlagSymptoms = {
  ecgHypovoltage: boolean;
  pericardialEffusion: boolean;
  biatrialDilation: boolean;
  thickeningInteratrialSeptum: boolean;
  fiveFiveFiveFinding: boolean;
  diastolicDysfunction: boolean;
  intoleranceHeartFailure: boolean;
  spontaneousResolutionHypertension: boolean;
  taviAorticStenosis: boolean;
  other: boolean;
  otherValue: string;
};

const defaultClinicalFindings: ClinicalFindings = {
  lvh12: false,
  lvh12Value: "",

  ntProBnp: false,
  ntProBnpValue: "",
  bnpValue: "",

  ef40: false,
  ef40Value: "",

  gfr30: false,
  gfr30Value: "",

  age65: false,
  age65Value: "",
};

const defaultRedFlags: RedFlagSymptoms = {
  ecgHypovoltage: false,
  pericardialEffusion: false,
  biatrialDilation: false,
  thickeningInteratrialSeptum: false,
  fiveFiveFiveFinding: false,
  diastolicDysfunction: false,
  intoleranceHeartFailure: false,
  spontaneousResolutionHypertension: false,
  taviAorticStenosis: false,
  other: false,
  otherValue: "",
};

const safeText = (v: any) => (v === undefined || v === null ? "" : String(v));

type UIModel = StrapiPatient & {
  clinicalFindings: ClinicalFindings;
  redFlagSymptoms: RedFlagSymptoms;
};

type ClinicalRow = { date: string; test: string; value: string };

type HistoryEntry = {
  id: number;
  date: string;
  type: string;
  value: number;
  unit: string;
  notes: string | null;
  createdAt: string | null;
};

// küçük yardımcı: input string -> number
function parseNum(v: any): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type DoctorOption = {
  id: number;
  documentId: string;
  fullName: string;
  specialty: string;
};

export default function PatientDetails() {
  const { id } = useParams();
  const { currentUser } = useUser();

  const [patient, setPatient] = useState<UIModel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<UIModel | null>(null);

  const [showNtProBnpChart, setShowNtProBnpChart] = useState(false);
  const [showGfrChart, setShowGfrChart] = useState(false);

  // Chart state
  const [gfrChartData, setGfrChartData] = useState<any[]>([]);
  const [ntProBnpChartData, setNtProBnpChartData] = useState<any[]>([]);

  // Historical table state
  const [clinicalRows, setClinicalRows] = useState<ClinicalRow[]>([]);
  const [filterTest, setFilterTest] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Primary Cardiologist editing state
  const [allDoctors, setAllDoctors] = useState<DoctorOption[]>([]);
  const [selectedCardiologistDocId, setSelectedCardiologistDocId] = useState<string>("");

  // Patient detail extras
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<HistoryEntry[]>([]);
  const [reportDate, setReportDate] = useState<string | null>(null);

  // Filtered rows calculation
  const filteredClinicalRows = useMemo(() => {
    let rows = [...clinicalRows];

    // Filter by test type
    if (filterTest !== "all") {
      rows = rows.filter((r) => r.test === filterTest);
    }

    // Sort by date
    rows.sort((a, b) => {
      if (sortOrder === "asc") return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

    return rows;
  }, [clinicalRows, filterTest, sortOrder]);

  // ---------------- Measurements loader (tek kaynak) ----------------
  // ---------------- Measurements loader (tek kaynak) ----------------
  const loadMeasurements = async (p: UIModel) => {
    // Tüm ölçümleri çek
    const allMeasurements = await fetchMeasurementsByPatient(p.id);

    // Chartlar için filtrele
    const gfrData = allMeasurements
      .filter((m) => m.type === "GFR")
      .map((r) => ({ date: r.measurementDate, value: r.value }));

    const ntData = allMeasurements
      .filter((m) => m.type === "NT_PRO_BNP")
      .map((r) => ({ date: r.measurementDate, value: r.value }));

    setGfrChartData(gfrData);
    setNtProBnpChartData(ntData);

    // Tablo için hepsi
    const rows: ClinicalRow[] = allMeasurements.map((r) => {
      let testName = r.type as string;
      if (r.type === "NT_PRO_BNP") testName = "NT-proBNP";
      if (r.type === "GFR") testName = "GFR";
      // Diğerleri oldugu gibi (BNP, EF, LVH vs)

      return {
        date: r.measurementDate,
        test: testName,
        value: `${r.value} ${r.unit ?? ""}`.trim(),
      };
    });

    // Old -> New sıralama
    rows.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.test.localeCompare(b.test)));

    setClinicalRows(rows);
  };

  // ---------------- Fetch all cardiologists for dropdown ----------------
  useEffect(() => {
    (async () => {
      try {
        const doctors = await strapiGet<DoctorOption[]>("/api/auth/doctor/all-doctors?specialty=Cardiology");
        setAllDoctors(Array.isArray(doctors) ? doctors : []);
      } catch (e) {
        console.warn("Failed to load doctors for dropdown:", e);
      }
    })();
  }, []);

  // ---------------- Fetch patient ----------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!id) throw new Error("Patient id missing.");

        const p = await fetchPatientByAnyId(String(id));
        if (!p) throw new Error("Patient not found.");

        const merged: UIModel = {
          ...(p as any),
          clinicalFindings: { ...defaultClinicalFindings, ...(p as any).clinicalFindings },
          redFlagSymptoms: { ...defaultRedFlags, ...(p as any).redFlagSymptoms },
        };

        if (!alive) return;

        setPatient(merged);
        setDraft(JSON.parse(JSON.stringify(merged)));
        setIsEditing(false);

        // Set the currently selected cardiologist
        const currentCardioDocId = (p as any).primary_cardiologist?.documentId || "";
        setSelectedCardiologistDocId(currentCardioDocId);

        // Hasta gelir gelmez measurements çek
        await loadMeasurements(merged);

        // Fetch extra detail (institution + history)
        try {
          const detailData = await strapiGet<any>(`/api/auth/doctor/patient-detail?patientDocumentId=${merged.documentId}`);
          if (detailData) {
            setInstitutionName(detailData.institutionName || null);
            setHistoryRows(detailData.history || []);
            setReportDate(detailData.reportDate || null);
          }
        } catch (e) {
          console.warn('Failed to load patient detail extras:', e);
        }
      } catch (e: any) {
        toast.error(e?.message || "Patient fetch failed");
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // Eğer patient state değişirse (ör. farklı hasta), measurements tekrar çek
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!patient) return;
        await loadMeasurements(patient);
      } catch (e: any) {
        console.error(e);
        if (!alive) return;
        setGfrChartData([]);
        setNtProBnpChartData([]);
        setClinicalRows([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [patient?.id]);

  // ---------------- UI helpers ----------------
  const fullName = useMemo(() => {
    if (!patient) return "";
    const n = `${safeText(patient.firstName).trim()} ${safeText(patient.lastName).trim()}`.trim();
    return n || `Patient #${patient.id}`;
  }, [patient]);

  const uiDisabledClass = (disabled: boolean) => (disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "");

  const startEdit = () => {
    if (!patient) return;
    setDraft(JSON.parse(JSON.stringify(patient)));
    // Reset selected cardiologist to current value
    const currentDocId = (patient as any).primary_cardiologist?.documentId || "";
    setSelectedCardiologistDocId(currentDocId);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!patient) return;
    setDraft(JSON.parse(JSON.stringify(patient)));
    const currentDocId = (patient as any).primary_cardiologist?.documentId || "";
    setSelectedCardiologistDocId(currentDocId);
    setIsEditing(false);
  };

  const save = async () => {
    try {
      if (!id) throw new Error("Patient id missing.");
      if (!draft) throw new Error("Draft missing.");
      if (!patient) throw new Error("Patient missing.");

      // Required alan kontrolü
      const requiredMissing: string[] = [];

      const fn = (draft.firstName ?? "").trim();
      const ln = (draft.lastName ?? "").trim();
      const gd = (draft.gender ?? "").trim();
      const em = (draft.email ?? "").trim();
      const cn = (draft.contactNumber ?? "").trim();
      const lv = ((draft as any).lastVisit ?? "").toString().trim();
      const na = ((draft as any).nextAppointment ?? "").toString().trim();

      if (!fn) requiredMissing.push("First Name");
      if (!ln) requiredMissing.push("Last Name");
      if (!gd) requiredMissing.push("Gender");
      if (!em) requiredMissing.push("Email");
      if (!cn) requiredMissing.push("Contact Number");
      if (!selectedCardiologistDocId) requiredMissing.push("Primary Cardiologist");
      if (!lv) requiredMissing.push("Last Visit");
      if (!na) requiredMissing.push("Next Appointment");

      if (requiredMissing.length) {
        toast.error(`Lütfen zorunlu alanları doldurun: ${requiredMissing.join(", ")}`);
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
      if (!emailOk) {
        toast.error("Email formatı geçersiz.");
        return;
      }

      const payload: Partial<StrapiPatient> = {
        firstName: fn,
        lastName: ln,
        gender: gd,
        email: em,
        contactNumber: cn,

        dateOfBirth: draft.dateOfBirth || undefined,
        address: draft.address || undefined,

        allowCaregiver: Boolean(draft.allowCaregiver),
        clinicalStatus: draft.clinicalStatus || undefined,

        kvkkConsentStatus: (draft as any).kvkkConsentStatus || undefined,
        kvkkConsentAt: (draft as any).kvkkConsentAt || undefined,

        statu: draft.statu ?? "New",
        cancellationReason: draft.statu === "Cancelled" ? (draft.cancellationReason ?? "") : undefined,

        lastVisit: (draft as any).lastVisit || undefined,
        nextAppointment: (draft as any).nextAppointment || undefined,

        reportDeadline: (draft as any).reportDeadline || undefined,

        clinicalFindings: (draft as any).clinicalFindings ?? defaultClinicalFindings,
        redFlagSymptoms: (draft as any).redFlagSymptoms ?? defaultRedFlags,
      };

      // 1) Patient update
      const updated = await updatePatientByAnyId(String(id), payload);
      if (!updated) throw new Error("Save failed (no response).");

      // 2) Measurement auto-log (Changes detected -> Save to Measurement table)
      try {
        const today = new Date().toISOString().slice(0, 10);

        const checkAndCreate = async (
          prevValStr: any,
          nextValStr: any,
          type: "NT_PRO_BNP" | "GFR" | "BNP" | "EF" | "LVH",
          unit: string
        ) => {
          const prev = parseNum(prevValStr);
          const next = parseNum(nextValStr);

          console.log(`Checking ${type}: prev=${prev} (${prevValStr}), next=${next} (${nextValStr})`);

          if (next !== null && next !== prev) {
            console.log(`>> Creating measurement for ${type}:`, next);
            // Strapi 5 prefers documentId for relations if available
            const targetId = patient.documentId || patient.id;

            await createMeasurement({
              patientId: targetId,
              measurementDate: today,
              type,
              value: next,
              unit,
              doctorId: currentUser?.documentId || undefined,
            });
          }
        };

        const oldCF = (patient as any)?.clinicalFindings || {};
        const newCF = (draft as any)?.clinicalFindings || {};

        // GFR
        await checkAndCreate(oldCF.gfr30Value, newCF.gfr30Value, "GFR", "ml/min/1.73 m²");
        // NT-proBNP
        await checkAndCreate(oldCF.ntProBnpValue, newCF.ntProBnpValue, "NT_PRO_BNP", "pg/mL");
        // BNP
        await checkAndCreate(oldCF.bnpValue, newCF.bnpValue, "BNP", "pg/mL");
        // EF
        await checkAndCreate(oldCF.ef40Value, newCF.ef40Value, "EF", "%");
        // LVH
        await checkAndCreate(oldCF.lvh12Value, newCF.lvh12Value, "LVH", "mm");

      } catch (e: any) {
        console.warn("Measurement create skipped:", e);
        toast.error(e?.message || "Measurement kaydı oluşturulamadı (permission/publish kontrol).");
      }

      // 3) Update primary cardiologist if changed
      const oldCardioDocId = (patient as any).primary_cardiologist?.documentId || "";
      if (selectedCardiologistDocId && selectedCardiologistDocId !== oldCardioDocId) {
        try {
          await strapiPut("/api/auth/doctor/update-primary-cardiologist", {
            patientDocumentId: patient.documentId || String(patient.id),
            doctorDocumentId: selectedCardiologistDocId,
          });
        } catch (e: any) {
          console.warn("Primary cardiologist update failed:", e);
          toast.error(e?.message || "Primary Cardiologist güncellenemedi.");
        }
      }

      // 4) Refetch patient (populate)
      const refreshed = await fetchPatientByAnyId(String(id));
      if (!refreshed) throw new Error("Save ok but refetch failed.");

      const merged: UIModel = {
        ...(refreshed as any),
        clinicalFindings: { ...defaultClinicalFindings, ...(refreshed as any).clinicalFindings },
        redFlagSymptoms: { ...defaultRedFlags, ...(refreshed as any).redFlagSymptoms },
      };

      setPatient(merged);
      setDraft(JSON.parse(JSON.stringify(merged)));
      setSelectedCardiologistDocId((refreshed as any).primary_cardiologist?.documentId || "");
      setIsEditing(false);

      // 5) Measurements refresh (grafik + historical table anında güncellenir)
      await loadMeasurements(merged);

      toast.success("Saved!");
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
      console.error(e);
    }
  };

  const generateDiagnosisSummary = (p: any) => {
    if (!p) return "";
    const cf: ClinicalFindings = p.clinicalFindings ?? defaultClinicalFindings;
    const rf: RedFlagSymptoms = p.redFlagSymptoms ?? defaultRedFlags;

    const clinical: string[] = [];
    const red: string[] = [];

    if (cf.lvh12) clinical.push(`LVH >12mm (${safeText(cf.lvh12Value)}mm)`);
    if (cf.ntProBnp) clinical.push(`Elevated NT-proBNP (${safeText(cf.ntProBnpValue)} pg/mL)`);
    if (cf.ef40) clinical.push(`Preserved EF (${safeText(cf.ef40Value)}%)`);
    if (cf.gfr30) clinical.push(`GFR >30 (${safeText(cf.gfr30Value)} ml/min/1.73m²)`);
    if (cf.age65) clinical.push(`Age ≥65 years (${safeText(cf.age65Value)} years)`);

    if (rf.ecgHypovoltage) red.push("ECG hypovoltage");
    if (rf.pericardialEffusion) red.push("pericardial effusion");
    if (rf.biatrialDilation) red.push("biatrial dilation");
    if (rf.thickeningInteratrialSeptum) red.push("thickening of interatrial septum and valves");
    if (rf.fiveFiveFiveFinding) red.push("5-5-5 finding");
    if (rf.diastolicDysfunction) red.push("diastolic dysfunction with increased LV filling pressure");
    if (rf.intoleranceHeartFailure) red.push("intolerance to standard heart failure treatment");
    if (rf.spontaneousResolutionHypertension) red.push("spontaneous resolution of hypertension");
    if (rf.taviAorticStenosis) red.push("TAVI/aortic stenosis");
    if (rf.other && rf.otherValue) red.push(rf.otherValue);

    return `PATIENT DIAGNOSIS SUMMARY

Patient: ${safeText(p.firstName)} ${safeText(p.lastName)}
ID: ${p.id}
Status: ${safeText(p.statu) || "New"}

SIGNIFICANT CLINICAL FINDINGS:
${clinical.length ? clinical.map((x) => `• ${x}`).join("\n") : "• -"}

RED FLAG SYMPTOMS:
${red.length ? red.map((x) => `• ${x}`).join("\n") : "• -"}

Generated on: ${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}
`;
  };

  const copyDiagnosis = async () => {
    try {
      const text = generateDiagnosisSummary(draft ?? patient);
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  if (!patient || !draft) {
    if (!patient || !draft) {
      // If we have an error, show it instead of loading
      // We don't have explicit error state variable exposed here easily unless we add it, 
      // but the component above creates one in useEffect but doesn't store it in a way we check here.
      // Let's assume if it takes too long it's weird, but for now just "Loading..."
      // Ideally we should use the 'error' state if we had one.

      // Check if we hit a permission/fetch error
      // Since we don't have 'error' state in this scope (it was local to useEffect but lost),
      // let's add a global error state for this component.
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="text-lg font-semibold mb-2">Loading Patient Details...</div>
            <div className="text-sm">If this takes too long, please check your connection or previous errors.</div>
          </div>
        </Layout>
      );
    }
  }

  const cf: ClinicalFindings = (draft as any).clinicalFindings ?? defaultClinicalFindings;
  const rf: RedFlagSymptoms = (draft as any).redFlagSymptoms ?? defaultRedFlags;

  const otherButtonsDisabled = isEditing;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Details</h1>
            <div className="text-slate-500 text-sm">
              {fullName} • ID: {patient.id}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <Link to={`/patients/${patient.documentId || patient.id}/assign`} className={uiDisabledClass(otherButtonsDisabled)}>
              <Button className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl px-5 h-10 shadow-sm transition-all">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Patient
              </Button>
            </Link>

            <Button
              className={`bg-[hsl(184,94%,34%)] hover:bg-[hsl(184,94%,28%)] text-white rounded-xl px-5 h-10 shadow-sm transition-all ${uiDisabledClass(
                otherButtonsDisabled
              )}`}
              onClick={() => window.open("#", "_blank")}
            >
              <FileBarChart className="w-4 h-4 mr-2" />
              Report
            </Button>


            {!isEditing ? (
              <Button
                className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl px-5 h-10 shadow-sm transition-all"
                onClick={startEdit}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 shadow-sm transition-all"
                  onClick={save}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="rounded-xl px-5 h-10 border-slate-300 hover:bg-slate-50" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            )}

            <Link to="/patients">
              <Button variant="outline" className="rounded-xl px-5 h-10 border-slate-300 hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">First Name</div>
                  <Input
                    value={safeText(draft.firstName)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, firstName: e.target.value } as any)}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Last Name</div>
                  <Input
                    value={safeText(draft.lastName)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, lastName: e.target.value } as any)}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Gender</div>
                <Select
                  value={safeText((draft as any).gender) || "unspecified"}
                  onValueChange={(v) => setDraft({ ...draft, gender: v === "unspecified" ? null : v } as any)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="unspecified">-</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Date of Birth</div>
                  <Input
                    type="date"
                    value={safeText((draft as any).dateOfBirth)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value } as any)}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Contact Number</div>
                  <Input
                    value={safeText((draft as any).contactNumber)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, contactNumber: e.target.value } as any)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Last Visit <span className="text-red-500">*</span></div>
                  <Input
                    type="date"
                    value={safeText((draft as any).lastVisit)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, lastVisit: e.target.value } as any)}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Next Appointment <span className="text-red-500">*</span></div>
                  <Input
                    type="date"
                    value={safeText((draft as any).nextAppointment)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, nextAppointment: e.target.value || null } as any)}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Email</div>
                <Input
                  value={safeText((draft as any).email)}
                  disabled={!isEditing}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value } as any)}
                />
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Address</div>
                <Input
                  value={safeText((draft as any).address)}
                  disabled={!isEditing}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value } as any)}
                />
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Clinical Status</div>
                <Textarea
                  value={safeText((draft as any).clinicalStatus)}
                  disabled={!isEditing}
                  onChange={(e) => setDraft({ ...draft, clinicalStatus: e.target.value } as any)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">KVKK Consent Status</div>
                  <Select
                    value={safeText((draft as any).kvkkConsentStatus) || "pending"}
                    onValueChange={(v) => setDraft({ ...draft, kvkkConsentStatus: v } as any)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">KVKK Consent At</div>
                  <Input
                    type="date"
                    value={safeText((draft as any).kvkkConsentAt)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, kvkkConsentAt: e.target.value || null } as any)}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <Select
                  value={safeText((draft as any).statu) || "New"}
                  onValueChange={(v) => setDraft({ ...draft, statu: v } as any)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="Specialist_Review">Specialist Review</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {safeText((draft as any).statu) === "Cancelled" && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Cancellation Reason</div>
                  <Textarea
                    value={safeText((draft as any).cancellationReason)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, cancellationReason: e.target.value } as any)}
                  />
                </div>
              )}

              {/* Report Date - shown for Follow-up patients */}
              {safeText((draft as any).statu) === "Follow-up" && reportDate && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <div className="text-xs text-teal-600 font-medium mb-1 flex items-center gap-1">
                    <FileBarChart className="w-3.5 h-3.5" />
                    Report Date
                  </div>
                  <div className="text-sm font-semibold text-teal-800">
                    {new Date(reportDate).toLocaleDateString('tr-TR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              {/* Report Deadline - editable */}
              {(safeText((draft as any).statu) === "Follow-up" || safeText((draft as any).statu) === "Diagnosis") && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Report Deadline</div>
                  <Input
                    type="date"
                    value={safeText((draft as any).reportDeadline)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, reportDeadline: e.target.value || null } as any)}
                  />
                </div>
              )}

              {/* Institution */}
              {institutionName && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Institution / Hospital</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium text-slate-700">{institutionName}</span>
                  </div>
                </div>
              )}

              {/* Care Team Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm font-semibold text-slate-800 mb-2">Care Team</div>

                <div className="mb-2">
                  <div className="text-xs text-slate-500 mb-1">
                    Primary Cardiologist <span className="text-red-500">*</span>
                  </div>
                  {isEditing ? (
                    <Select
                      value={selectedCardiologistDocId || "__none"}
                      onValueChange={(v) => setSelectedCardiologistDocId(v === "__none" ? "" : v)}
                    >
                      <SelectTrigger className={!selectedCardiologistDocId ? "border-red-300" : ""}>
                        <SelectValue placeholder="Select a cardiologist" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="__none" disabled>Select a cardiologist</SelectItem>
                        {allDoctors.map((doc) => (
                          <SelectItem key={doc.documentId} value={doc.documentId}>
                            {doc.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium text-slate-700">
                      {(patient as any).primary_cardiologist?.fullName || (
                        <span className="text-red-500 italic">Not Assigned</span>
                      )}
                    </div>
                  )}
                </div>

                {(patient as any).assigned_specialists && (patient as any).assigned_specialists.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Consulting Specialists</div>
                    <div className="flex flex-col gap-1">
                      {(patient as any).assigned_specialists.map((s: any) => (
                        <div key={s.id} className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          {s.fullName} <span className="text-xs text-slate-400">({s.specialty})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={Boolean((draft as any).allowCaregiver)}
                  disabled={!isEditing}
                  onCheckedChange={(v) => setDraft({ ...draft, allowCaregiver: Boolean(v) } as any)}
                />
                <span className="text-sm text-slate-600">Permission to share caregiver information received</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clinical Findings</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    Historical Records
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Clinical Records</DialogTitle>
                    <DialogDescription>
                      This table shows the historical clinical measurement records for the patient.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-slate-600 text-sm">Strapi Measurement tablosundan ölçüm geçmişi gösterilir.</div>

                  <div className="flex flex-col gap-4 mt-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="w-[200px]">
                        <div className="text-xs text-slate-500 mb-1">Filter by Test</div>
                        <Select value={filterTest} onValueChange={setFilterTest}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Tests" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tests</SelectItem>
                            <SelectItem value="GFR">GFR</SelectItem>
                            <SelectItem value="NT-proBNP">NT-proBNP</SelectItem>
                            <SelectItem value="BNP">BNP</SelectItem>
                            <SelectItem value="EF">EF</SelectItem>
                            <SelectItem value="LVH">LVH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-[150px]">
                        <div className="text-xs text-slate-500 mb-1">Sort by Date</div>
                        <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Test</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClinicalRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-slate-600">
                                Kayıtlı ölçüm bulunamadı.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredClinicalRows.map((r, i) => (
                              <TableRow key={i}>
                                <TableCell>{r.date}</TableCell>
                                <TableCell>{r.test}</TableCell>
                                <TableCell>{r.value}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={cf.lvh12}
                  disabled={!isEditing}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, clinicalFindings: { ...cf, lvh12: Boolean(v) } } as any)
                  }
                />
                <div className="text-sm text-slate-700 w-28">LVH &gt; 12</div>
                <Input
                  className="w-24"
                  value={safeText(cf.lvh12Value)}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setDraft({ ...draft, clinicalFindings: { ...cf, lvh12Value: e.target.value } } as any)
                  }
                />
                <div className="text-xs text-slate-500">mm</div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={cf.ntProBnp}
                  disabled={!isEditing}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, clinicalFindings: { ...cf, ntProBnp: Boolean(v) } } as any)
                  }
                />
                <div className="text-sm text-slate-700 flex-1">NT-proBNP &gt; 600 (or) BNP &gt; 150</div>
                <Button variant="outline" size="icon" className="rounded-lg" onClick={() => setShowNtProBnpChart(true)}>
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pl-8">
                <div>
                  <div className="text-xs text-slate-500 mb-1">NT-proBNP</div>
                  <Input
                    value={safeText(cf.ntProBnpValue)}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setDraft({ ...draft, clinicalFindings: { ...cf, ntProBnpValue: e.target.value } } as any)
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">BNP</div>
                  <Input
                    value={safeText(cf.bnpValue)}
                    disabled={!isEditing}
                    onChange={(e) => setDraft({ ...draft, clinicalFindings: { ...cf, bnpValue: e.target.value } } as any)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={cf.gfr30}
                  disabled={!isEditing}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, clinicalFindings: { ...cf, gfr30: Boolean(v) } } as any)
                  }
                />
                <div className="text-sm text-slate-700 flex-1">GFR &gt; 30 ml/min/1.73 m²</div>
                <Button variant="outline" size="icon" className="rounded-lg" onClick={() => setShowGfrChart(true)}>
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>

              <div className="pl-8">
                <div className="text-xs text-slate-500 mb-1">GFR</div>
                <Input
                  value={safeText(cf.gfr30Value)}
                  disabled={!isEditing}
                  onChange={(e) => setDraft({ ...draft, clinicalFindings: { ...cf, gfr30Value: e.target.value } } as any)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Red Flag Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["ecgHypovoltage", "ECG Hypovoltage"],
                ["pericardialEffusion", "Pericardial Effusion"],
                ["biatrialDilation", "Biatrial Dilation"],
                ["thickeningInteratrialSeptum", "Thickening of the Interatrial Septum and Valves"],
                ["fiveFiveFiveFinding", "5-5-5 Finding"],
                ["diastolicDysfunction", "Diastolic Dysfunction with Increased LV Filling Pressure"],
                ["intoleranceHeartFailure", "Intolerance to Standard Heart Failure Treatment"],
                ["spontaneousResolutionHypertension", "Spontaneous Resolution of Hypertension"],
                ["taviAorticStenosis", "TAVI / Aortic Stenosis"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    checked={Boolean((rf as any)[key])}
                    disabled={!isEditing}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, redFlagSymptoms: { ...rf, [key]: Boolean(v) } } as any)
                    }
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </div>
              ))}

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={rf.other}
                    disabled={!isEditing}
                    onCheckedChange={(v) => setDraft({ ...draft, redFlagSymptoms: { ...rf, other: Boolean(v) } } as any)}
                  />
                  <span className="text-sm text-slate-700">Other / Doctor’s Comment</span>
                </div>
                <Textarea
                  value={safeText(rf.otherValue)}
                  disabled={!isEditing || !rf.other}
                  onChange={(e) =>
                    setDraft({ ...draft, redFlagSymptoms: { ...rf, otherValue: e.target.value } } as any)
                  }
                  placeholder="Notes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Examinations & Specialist Notes (combined) ── */}
        {patient.documentId && (
          <CombinedExaminations
            patientDocumentId={patient.documentId}
            historyRows={historyRows}
          />
        )}

        {/* ── Diagnosis Summary ── */}
        <Card className="rounded-2xl mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Diagnosis Summary</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyDiagnosis} className="rounded-xl">
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-50 border rounded-xl p-4 text-xs whitespace-pre-wrap">
              {generateDiagnosisSummary(draft)}
            </pre>
          </CardContent>
        </Card>

        {/* NT-proBNP */}
        <Dialog open={showNtProBnpChart} onOpenChange={setShowNtProBnpChart}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>NT-proBNP Trend</DialogTitle>
            </DialogHeader>

            {ntProBnpChartData.length === 0 && (
              <div className="text-sm text-slate-600 mb-3">Kayıtlı NT-proBNP ölçümü yok.</div>
            )}

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ntProBnpChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={600} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" name="NT-proBNP" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>

        {/* GFR */}
        <Dialog open={showGfrChart} onOpenChange={setShowGfrChart}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>GFR Trend</DialogTitle>
            </DialogHeader>

            {gfrChartData.length === 0 && <div className="text-sm text-slate-600 mb-3">Kayıtlı GFR ölçümü yok.</div>}

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gfrChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" padding={{ left: 40, right: 40 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={30} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" name="GFR (ml/min/1.73 m²)" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
