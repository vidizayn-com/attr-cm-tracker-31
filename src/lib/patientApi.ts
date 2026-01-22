import { strapiPost, strapiPut } from "./strapiClient";

type CreatePatientInput = {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  contactNumber: string;
  email?: string;
  address?: string;
  phone?: string;
  allowCaregiver?: boolean;
  statu?: string; // UI status
  cancellationReason?: string;

  clinicalStatus?: string;
  kvkkConsentStatus?: string;
  kvkkConsentAt?: string;

  clinicalFindings?: any; // JSON
  redFlagSymptoms?: any; // JSON

  institution?: number; // institution id
  assignedCardiologistId?: number; // doctor id (tek)
};

type CreateCaregiverInput = {
  fullName?: string;
  phone: string;
  email?: string;
  relationToPatient?: string;
  patientId?: number;
};

export async function createPatient(input: CreatePatientInput) {
  // UI -> Strapi mapping:
  // status -> statu (Strapi alan adı)
  const payload: any = {
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    contactNumber: input.contactNumber,
    email: input.email ?? null,
    address: input.address ?? null,

    allowCaregiver: input.allowCaregiver ?? false,
    statu: input.statu ?? "New",
    cancellationReason: input.cancellationReason ?? null,

    clinicalStatus: input.clinicalStatus ?? null,
    kvkkConsentStatus: input.kvkkConsentStatus ?? "pending",
    kvkkConsentAt: input.kvkkConsentAt ?? null,

    clinicalFindings: input.clinicalFindings ?? null,
    redFlagSymptoms: input.redFlagSymptoms ?? null,

    // relations (Strapi v5 outputunda array gördük, o yüzden id göndermek yeterli)
    institution: input.institution ? [input.institution] : [],
    assigned_cardiologists: input.assignedCardiologistId
      ? [input.assignedCardiologistId]
      : [],
  };

  // Strapi create format
  return await strapiPost("/api/patients", { data: payload });
}

export async function createCaregiver(input: CreateCaregiverInput) {
  const payload: any = {
  fullName: input.fullName ?? null,
  phone: input.phone,
  email: input.email ?? null,
  relationToPatient: input.relationToPatient ?? null,
};


  return await strapiPost("/api/patient-relatives", { data: payload });
}

// Eğer istersen hasta oluşturduktan sonra ilişkiyi patient_relatives’e de bağlarız.
// Ama PatientRelative zaten patient’a bağlı olduğu için populate ile görünür.
export async function linkCaregiverToPatient(
  patientDocumentId: string,
  relativeIds: number[]
) {
  return await strapiPut(`/api/patients/${patientDocumentId}`, {
    data: { patient_relatives: relativeIds },
  });
}


