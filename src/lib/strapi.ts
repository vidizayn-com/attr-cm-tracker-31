// src/lib/strapi.ts

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

type FetchFromStrapiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
};

async function fetchFromStrapi<T>(path: string, opts: FetchFromStrapiOptions = {}): Promise<T> {
  if (!STRAPI_URL) throw new Error("VITE_STRAPI_URL is not set.");

  // Strapi 5 deep populate syntax with 'on' or standard v4 populate
  // Here we use standard object notation or wildcard if simple.
  // For deep fields: populate[primary_cardiologist][fields][0]=name&populate[primary_cardiologist][fields][1]=role
  // We'll use a helper or simple wildcard for now if permissions allowed.
  // Let's stick to standard URL if we can, or just use * if it works for relations.
  // "populate=*" usually creates 1-level deep. If we need deeply nested (like doctor's hospital), we need query builder.
  // For now, let's keep it robust.
  const url = `${STRAPI_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // ignore
    }

    // Strapi validation errors -> okunur hale getir
    const details =
      parsed?.error?.details?.errors?.map((x: any) => `${(x.path ?? []).join(".")}: ${x.message}`).join(" | ") || "";

    const msg =
      parsed?.error?.message ||
      parsed?.message ||
      details ||
      (typeof text === "string" && text.length < 800 ? text : "Unknown error");

    throw new Error(`Strapi request failed (${res.status}): ${msg}`);
  }

  return (await res.json()) as T;
}

export type Patient = {
  id: number;
  documentId?: string | null;

  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  address?: string | null;

  contactNumber?: string | null;

  allowCaregiver?: boolean | null;

  clinicalStatus?: string | null;

  kvkkConsentStatus?: string | null;
  kvkkConsentAt?: string | null;

  statu?: string | null;
  cancellationReason?: string | null;

  clinicalFindings?: any;
  redFlagSymptoms?: any;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  lastVisit?: string | null;
  nextAppointment?: string | null;
  reportDeadline?: string | null;

  primary_cardiologist?: {
    id: number;
    documentId: string;
    fullName: string;
    specialty: string;
  } | null;

  assigned_specialists?: Array<{
    id: number;
    documentId: string;
    fullName: string;
    specialty: string;
  }> | null;
};

function sanitizePatientPayload(payload: Partial<Patient>) {
  const clean: Record<string, any> = {};

  const setIfDefined = (k: string, v: any) => {
    if (v === undefined) return;
    clean[k] = v;
  };

  // Required alanlar (null göndermemeye çalış)
  setIfDefined("firstName", payload.firstName ?? undefined);
  setIfDefined("lastName", payload.lastName ?? undefined);
  setIfDefined("gender", payload.gender ?? undefined);
  setIfDefined("email", payload.email ?? undefined);
  setIfDefined("contactNumber", payload.contactNumber ?? undefined);

  // Optional
  setIfDefined("dateOfBirth", payload.dateOfBirth ?? undefined);
  setIfDefined("address", payload.address ?? undefined);
  setIfDefined("allowCaregiver", payload.allowCaregiver ?? undefined);
  setIfDefined("clinicalStatus", payload.clinicalStatus ?? undefined);
  setIfDefined("statu", payload.statu ?? undefined);
  setIfDefined("kvkkConsentStatus", payload.kvkkConsentStatus ?? undefined);
  setIfDefined("kvkkConsentAt", payload.kvkkConsentAt ?? undefined);

  // JSON
  setIfDefined("clinicalFindings", payload.clinicalFindings ?? undefined);
  setIfDefined("redFlagSymptoms", payload.redFlagSymptoms ?? undefined);

  setIfDefined("lastVisit", payload.lastVisit ?? undefined);
  setIfDefined("nextAppointment", payload.nextAppointment ?? undefined);

  if (payload.statu === "Cancelled") {
    setIfDefined("cancellationReason", payload.cancellationReason ?? "");
  }

  return clean as Partial<Patient>;
}

async function fetchPatientDocumentIdByNumericId(numericId: string) {
  const json = await fetchFromStrapi<{ data: Patient[] }>(
    `/api/patients?filters[id][$eq]=${encodeURIComponent(numericId)}&pagination[pageSize]=1`,
    { method: "GET" }
  );
  return (json?.data ?? [])[0]?.documentId ?? null;
}

export async function fetchPatientByAnyId(anyId: string, opts?: { populate?: boolean }) {
  const populate = opts?.populate ?? true;
  // Revert to simple populate=* to ensure page loads.
  // Complex field selection queries can fail if not properly encoded or if schema doesn't match exactly.
  const popQuery = populate ? "?populate=*" : "";
  // Note: we also keep clinicalFindings/redFlagSymptoms populated just in case they are components (Strapi often needs explicit pop for comps)

  if (!/^\d+$/.test(anyId)) {
    // anyId is likely documentId
    const json = await fetchFromStrapi<{ data: Patient }>(`/api/patients/${anyId}${popQuery}`, { method: "GET" });
    return json?.data ?? null;
  }

  const documentId = await fetchPatientDocumentIdByNumericId(anyId);
  if (!documentId) return null;

  const json = await fetchFromStrapi<{ data: Patient }>(`/api/patients/${documentId}${popQuery}`, { method: "GET" });
  return json?.data ?? null;
}

export async function updatePatientByAnyId(anyId: string, payload: Partial<Patient>) {
  const clean = sanitizePatientPayload(payload);

  if (!/^\d+$/.test(anyId)) {
    const json = await fetchFromStrapi<{ data: Patient }>(`/api/patients/${anyId}`, {
      method: "PUT",
      body: { data: clean },
    });
    return json?.data ?? null;
  }

  const documentId = await fetchPatientDocumentIdByNumericId(anyId);
  if (!documentId) throw new Error("Patient documentId not found for update.");

  const json = await fetchFromStrapi<{ data: Patient }>(`/api/patients/${documentId}`, {
    method: "PUT",
    body: { data: clean },
  });

  return json?.data ?? null;
}

export type Measurement = {
  id: number;
  documentId?: string;
  measurementDate: string;
  type: "NT_PRO_BNP" | "GFR" | "BNP" | "EF" | "LVH";
  value: number;
  unit?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  patient?: any;
};

export async function fetchMeasurementsByPatient(patientId: number, type?: "NT_PRO_BNP" | "GFR" | "BNP" | "EF" | "LVH") {
  const filters: Record<string, string> = {
    "filters[patient][id][$eq]": String(patientId),
    "sort": "measurementDate:asc",
    "pagination[pageSize]": "100",
    "populate": "*",
  };

  if (type) {
    filters["filters[type][$eq]"] = type;
  }

  const qs = new URLSearchParams(filters);

  const json = await fetchFromStrapi<{ data: Measurement[] }>(`/api/measurements?${qs.toString()}`);
  return json.data ?? [];
}

/**
 * ✅ FIX: Measurement create + relation connect + auto publish
 * - patient relation: { connect: [id] }
 * - create sonrası publishedAt boşsa PUT/PATCH ile publish
 */
export async function createMeasurement(input: {
  patientId: number | string;
  measurementDate: string; // YYYY-MM-DD
  type: "NT_PRO_BNP" | "GFR" | "BNP" | "EF" | "LVH";
  value: number;
  unit?: string;
  notes?: string;
  doctorId?: number | string;
}) {
  // 1) CREATE (relation connect ile)
  const createBody: any = {
    data: {
      patient: { connect: [input.patientId] },
      measurementDate: input.measurementDate,
      type: input.type,
      value: input.value,
      unit: input.unit ?? null,
      notes: input.notes ?? null,
    },
  };
  if (input.doctorId) {
    createBody.data.doctor = { connect: [input.doctorId] };
  }

  const created = await fetchFromStrapi<{ data: Measurement }>(`/api/measurements`, {
    method: "POST",
    body: createBody,
  });

  const item = created?.data ?? null;
  if (!item) return null;

  // 2) DRAFT ise publish et
  const isDraft = item.publishedAt === null || item.publishedAt === undefined;
  const docOrId: any = (item as any).documentId ?? item.id;

  if (!isDraft || !docOrId) return item;

  const publishBody = { data: { publishedAt: new Date().toISOString() } };

  try {
    const published = await fetchFromStrapi<{ data: Measurement }>(`/api/measurements/${docOrId}`, {
      method: "PUT",
      body: publishBody,
    });
    return published?.data ?? item;
  } catch {
    const published = await fetchFromStrapi<{ data: Measurement }>(`/api/measurements/${docOrId}`, {
      method: "PATCH",
      body: publishBody,
    });
    return published?.data ?? item;
  }
}
