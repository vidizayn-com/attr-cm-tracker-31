// src/pages/PatientDetails.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { toast } from "sonner";
import { Copy, TrendingUp, Upload } from "lucide-react";

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

// küçük yardımcı: input string -> number
function parseNum(v: any): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function PatientDetails() {
  const { id } = useParams();

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

  // ---------------- Measurements loader (tek kaynak) ----------------
  const loadMeasurements = async (p: UIModel) => {
    const [gfrRows, ntRows] = await Promise.all([
      fetchMeasurementsByPatient(p.id, "GFR"),
      fetchMeasurementsByPatient(p.id, "NT_PRO_BNP"),
    ]);

    setGfrChartData(
      (gfrRows ?? []).map((r: any) => ({
        date: r.measurementDate,
        value: r.value,
      }))
    );

    setNtProBnpChartData(
      (ntRows ?? []).map((r: any) => ({
        date: r.measurementDate,
        value: r.value,
      }))
    );

    const rows: ClinicalRow[] = [];

    for (const r of ntRows ?? []) rows.push({ date: r.measurementDate, test: "NT-proBNP", value: String(r.value) });
    for (const r of gfrRows ?? []) rows.push({ date: r.measurementDate, test: "GFR", value: String(r.value) });

    // İstersen newest-first yapmak için tersine çevirebiliriz, şimdilik old->new
    rows.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.test.localeCompare(b.test)));

    setClinicalRows(rows);
  };

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

        // Hasta gelir gelmez measurements çek
        await loadMeasurements(merged);
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
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!patient) return;
    setDraft(JSON.parse(JSON.stringify(patient)));
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

      if (!fn) requiredMissing.push("First Name");
      if (!ln) requiredMissing.push("Last Name");
      if (!gd) requiredMissing.push("Gender");
      if (!em) requiredMissing.push("Email");
      if (!cn) requiredMissing.push("Contact Number");

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

        statu: draft.statu ?? "New",
        cancellationReason: draft.statu === "Cancelled" ? (draft.cancellationReason ?? "") : undefined,

        clinicalFindings: (draft as any).clinicalFindings ?? defaultClinicalFindings,
        redFlagSymptoms: (draft as any).redFlagSymptoms ?? defaultRedFlags,
      };

      // 1) Patient update
      const updated = await updatePatientByAnyId(String(id), payload);
      if (!updated) throw new Error("Save failed (no response).");

      // 2) Measurement auto-log (GFR + NT-proBNP değiştiyse)
      try {
        const today = new Date().toISOString().slice(0, 10);

        const prevGfr = parseNum((patient as any)?.clinicalFindings?.gfr30Value);
        const nextGfr = parseNum((draft as any)?.clinicalFindings?.gfr30Value);

        if (nextGfr !== null && nextGfr !== prevGfr) {
          await createMeasurement({
            patientId: patient.id,
            measurementDate: today,
            type: "GFR",
            value: nextGfr,
            unit: "ml/min/1.73 m²",
          });
        }

        const prevNt = parseNum((patient as any)?.clinicalFindings?.ntProBnpValue);
        const nextNt = parseNum((draft as any)?.clinicalFindings?.ntProBnpValue);

        if (nextNt !== null && nextNt !== prevNt) {
          await createMeasurement({
            patientId: patient.id,
            measurementDate: today,
            type: "NT_PRO_BNP",
            value: nextNt,
            unit: "pg/mL",
          });
        }
      } catch (e: any) {
        console.warn("Measurement create skipped:", e);
        toast.error(e?.message || "Measurement kaydı oluşturulamadı (permission/publish kontrol).");
      }

      // 3) Refetch patient (populate)
      const refreshed = await fetchPatientByAnyId(String(id));
      if (!refreshed) throw new Error("Save ok but refetch failed.");

      const merged: UIModel = {
        ...(refreshed as any),
        clinicalFindings: { ...defaultClinicalFindings, ...(refreshed as any).clinicalFindings },
        redFlagSymptoms: { ...defaultRedFlags, ...(refreshed as any).redFlagSymptoms },
      };

      setPatient(merged);
      setDraft(JSON.parse(JSON.stringify(merged)));
      setIsEditing(false);

      // 4) Measurements refresh (grafik + historical table anında güncellenir)
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
    return (
      <Layout>
        <div className="p-6 text-white">Loading...</div>
      </Layout>
    );
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

          <div className="flex flex-wrap gap-3 items-center">
            <Link to={`/patients/${patient.id}/assign`} className={uiDisabledClass(otherButtonsDisabled)}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-11">👤 Assign patient</Button>
            </Link>

            <Button
              className={`bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 h-11 ${uiDisabledClass(
                otherButtonsDisabled
              )}`}
              onClick={() => window.open("#", "_blank")}
            >
              📋 Report
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className={`bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-5 h-11 ${uiDisabledClass(
                    otherButtonsDisabled
                  )}`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Patient Files</DialogTitle>
                </DialogHeader>
                <div className="text-slate-600 text-sm">
                  Şimdilik popup hazır. Sonraki adımda Strapi “upload/files + relation” bağlayacağız.
                </div>
              </DialogContent>
            </Dialog>

            {!isEditing ? (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 h-11" onClick={startEdit}>
                ✏️ Edit
              </Button>
            ) : (
              <>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 h-11" onClick={save}>
                  💾 Save
                </Button>
                <Button variant="outline" className="rounded-xl px-5 h-11" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            )}

            <Link to="/patients">
              <Button variant="outline" className="rounded-xl px-5 h-11">
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
                  <Input value={safeText((draft as any).kvkkConsentStatus)} disabled />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">KVKK Consent At</div>
                  <Input value={safeText((draft as any).kvkkConsentAt)} disabled />
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
                  </DialogHeader>
                  <div className="text-slate-600 text-sm">Strapi Measurement tablosundan ölçüm geçmişi gösterilir.</div>

                  <div className="mt-4 border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clinicalRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-slate-600">
                              Kayıtlı ölçüm bulunamadı.
                            </TableCell>
                          </TableRow>
                        ) : (
                          clinicalRows.map((r, i) => (
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
