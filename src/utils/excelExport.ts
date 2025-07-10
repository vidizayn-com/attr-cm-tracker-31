
import * as XLSX from 'xlsx';
import { Patient } from '@/types/patient';

interface MaskedPatientData {
  PatientCode: string;
  Age: number;
  Gender: string;
  LastVisitDate: string;
  NextAppointmentDate: string;
  AssignedSpecialist: string;
  Status: string;
  CancellationReason: string;
  CaregiverAllowed: string;
  // Clinical Findings
  LVH12: string;
  LVH12Value: string;
  NTProBNP: string;
  NTProBNPValue: string;
  BNPValue: string;
  EF40: string;
  EF40Value: string;
  GFR30: string;
  GFR30Value: string;
  Age65Plus: string;
  Age65Value: string;
  // Red Flag Symptoms
  ECGHypovoltage: string;
  PericardialEffusion: string;
  BiatrialDilation: string;
  ThickeningInteratrialSeptum: string;
  FiveFiveFiveFinding: string;
  DiastolicDysfunction: string;
  IntoleranceHeartFailure: string;
  SpontaneousResolutionHypertension: string;
  TAVIAorticStenosis: string;
  OtherSymptoms: string;
  OtherSymptomsValue: string;
  // Physician Data Count
  PhysicianRecords: number;
}

const generatePatientCode = (index: number): string => {
  return `PAT-${String(index + 1).padStart(3, '0')}`;
};

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const booleanToString = (value: boolean): string => {
  return value ? 'Yes' : 'No';
};

const maskPatientData = (patients: Patient[]): MaskedPatientData[] => {
  return patients.map((patient, index) => ({
    PatientCode: generatePatientCode(index),
    Age: calculateAge(patient.dateOfBirth),
    Gender: patient.gender,
    LastVisitDate: patient.lastVisit,
    NextAppointmentDate: patient.nextAppointment,
    AssignedSpecialist: patient.assignedTo,
    Status: patient.status,
    CancellationReason: patient.cancellationReason || '',
    CaregiverAllowed: booleanToString(patient.allowCaregiver),
    // Clinical Findings
    LVH12: booleanToString(patient.clinicalFindings.lvh12),
    LVH12Value: patient.clinicalFindings.lvh12Value,
    NTProBNP: booleanToString(patient.clinicalFindings.ntProBnp),
    NTProBNPValue: patient.clinicalFindings.ntProBnpValue,
    BNPValue: patient.clinicalFindings.bnpValue,
    EF40: booleanToString(patient.clinicalFindings.ef40),
    EF40Value: patient.clinicalFindings.ef40Value,
    GFR30: booleanToString(patient.clinicalFindings.gfr30),
    GFR30Value: patient.clinicalFindings.gfr30Value,
    Age65Plus: booleanToString(patient.clinicalFindings.age65),
    Age65Value: patient.clinicalFindings.age65Value,
    // Red Flag Symptoms
    ECGHypovoltage: booleanToString(patient.redFlagSymptoms.ecgHypovoltage),
    PericardialEffusion: booleanToString(patient.redFlagSymptoms.pericardialEffusion),
    BiatrialDilation: booleanToString(patient.redFlagSymptoms.biatrialDilation),
    ThickeningInteratrialSeptum: booleanToString(patient.redFlagSymptoms.thickeningInteratrialSeptum),
    FiveFiveFiveFinding: booleanToString(patient.redFlagSymptoms.fiveFiveFiveFinding),
    DiastolicDysfunction: booleanToString(patient.redFlagSymptoms.diastolicDysfunction),
    IntoleranceHeartFailure: booleanToString(patient.redFlagSymptoms.intoleranceHeartFailure),
    SpontaneousResolutionHypertension: booleanToString(patient.redFlagSymptoms.spontaneousResolutionHypertension),
    TAVIAorticStenosis: booleanToString(patient.redFlagSymptoms.taviAorticStenosis),
    OtherSymptoms: booleanToString(patient.redFlagSymptoms.other),
    OtherSymptomsValue: patient.redFlagSymptoms.otherValue,
    // Physician Data Count
    PhysicianRecords: patient.physicianData.length
  }));
};

export const exportPatientsToExcel = (patients: Patient[]): void => {
  // Mask patient data
  const maskedData = maskPatientData(patients);
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(maskedData);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 12 }, // PatientCode
    { wch: 8 },  // Age
    { wch: 10 }, // Gender
    { wch: 15 }, // LastVisitDate
    { wch: 18 }, // NextAppointmentDate
    { wch: 20 }, // AssignedSpecialist
    { wch: 12 }, // Status
    { wch: 20 }, // CancellationReason
    { wch: 15 }, // CaregiverAllowed
    // Clinical findings columns
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    // Red flag symptoms columns
    { wch: 15 }, { wch: 18 }, { wch: 16 }, { wch: 25 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 18 },
    // Physician records
    { wch: 16 }
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Masked Patient Data');
  
  // Generate and download the file
  XLSX.writeFile(workbook, 'Masked_Patient_Report.xlsx');
};
