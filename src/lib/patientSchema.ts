export type ClinicalFindings = {
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

  // Cardiology Echo
  echoEfValue?: string;
  echoIvsValue?: string;
  echoPwValue?: string;
  echoSddValue?: string;
  echoLaValue?: string;

  // Additional Specialties
  nmBoneScintigraphyGrade?: string;
  geneticsAnomaly?: string;
  hemSerumImmunofixation?: string;
  hemUrineImmunofixation?: string;
  hemFreeLightChain?: string;
};

export type RedFlagSymptoms = {
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

export type PatientFormData = {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  address: string;
  primaryCardiologistDocId: string;
  statu: string;
  allowCaregiver: boolean;
  caregiverName: string;
  caregiverEmail: string;
  caregiverPhone: string;
  lastVisit: string;
  nextAppointment: string;
  lastReportDate: string;
  reportDeadline: string;
  clinicalFindings: ClinicalFindings;
  redFlagSymptoms: RedFlagSymptoms;
};

export const defaultClinicalFindings: ClinicalFindings = {
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
  echoEfValue: "",
  echoIvsValue: "",
  echoPwValue: "",
  echoSddValue: "",
  echoLaValue: "",
  nmBoneScintigraphyGrade: "",
  geneticsAnomaly: "",
  hemSerumImmunofixation: "",
  hemUrineImmunofixation: "",
  hemFreeLightChain: "",
};

export const defaultRedFlags: RedFlagSymptoms = {
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

export type ReportPriority = "High" | "Mid" | "Low";

export function calculateReportPriority(reportDeadline?: string | null): {
  priority: ReportPriority;
  diffDays: number;
} {
  if (!reportDeadline) {
    return { priority: "High", diffDays: 0 };
  }

  const cleanStr = String(reportDeadline).trim().split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) {
    return { priority: "High", diffDays: 0 };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { priority: "High", diffDays: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(year, month, day);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 20) {
    return { priority: "High", diffDays };
  } else if (diffDays <= 30) {
    return { priority: "Mid", diffDays };
  } else {
    return { priority: "Low", diffDays };
  }
}

export function calculateAgeFromDob(dobString?: string | null): number | null {
  if (!dobString) return null;
  const cleanStr = String(dobString).trim().split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - month;
  const dayDiff = today.getDate() - day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age >= 0 ? age : null;
}

export function getDefaultPatientFormData(overrides?: Partial<PatientFormData>): PatientFormData {
  return {
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    contactNumber: "",
    email: "",
    address: "",
    primaryCardiologistDocId: "",
    statu: "New",
    allowCaregiver: false,
    caregiverName: "",
    caregiverEmail: "",
    caregiverPhone: "",
    lastVisit: "",
    nextAppointment: "",
    lastReportDate: "",
    reportDeadline: "",
    clinicalFindings: { ...defaultClinicalFindings },
    redFlagSymptoms: { ...defaultRedFlags },
    ...overrides,
  };
}

export type ValidationResult = {
  isValid: boolean;
  missingFields: string[];
  errorMessage: string;
};

export function validatePatientFormData(
  data: PatientFormData,
  options?: { isReportTracker?: boolean }
): ValidationResult {
  const missingFields: string[] = [];

  const fn = (data.firstName ?? "").trim();
  const ln = (data.lastName ?? "").trim();
  const gd = (data.gender ?? "").trim();
  const dob = (data.dateOfBirth ?? "").trim();
  const cn = (data.contactNumber ?? "").trim();
  const pc = (data.primaryCardiologistDocId ?? "").trim();
  const em = (data.email ?? "").trim();

  if (!fn) missingFields.push("Ad (First Name)");
  if (!ln) missingFields.push("Soyad (Last Name)");
  if (!gd) missingFields.push("Cinsiyet (Gender)");
  if (!dob) missingFields.push("Doğum Tarihi (Date of Birth)");
  if (!cn) missingFields.push("İletişim Numarası (Contact Number)");
  if (!pc) missingFields.push("Birincil Kardiyolog (Primary Cardiologist)");

  if (em) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    if (!emailOk) {
      return {
        isValid: false,
        missingFields: [],
        errorMessage: "Girdiğiniz e-posta adresi geçerli bir formatta değil.",
      };
    }
  }

  if (data.allowCaregiver) {
    const cName = (data.caregiverName ?? "").trim();
    const cPhone = (data.caregiverPhone ?? "").trim();
    const cEmail = (data.caregiverEmail ?? "").trim();

    if (!cName) missingFields.push("Hasta Yakını Adı (Caregiver Name)");
    if (!cPhone) missingFields.push("Hasta Yakını Telefonu (Caregiver Phone)");

    if (cEmail) {
      const caregiverEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail);
      if (!caregiverEmailOk) {
        return {
          isValid: false,
          missingFields: [],
          errorMessage: "Hasta yakını e-posta adresi geçerli bir formatta değil.",
        };
      }
    }
  }

  if (options?.isReportTracker) {
    const rd = (data.reportDeadline ?? "").trim();
    if (!rd) missingFields.push("Rapor Yenileme Tarihi (Next Renewal Date)");
  }

  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      errorMessage: `Lütfen zorunlu alanları doldurun: ${missingFields.join(", ")}`,
    };
  }

  return {
    isValid: true,
    missingFields: [],
    errorMessage: "",
  };
}
