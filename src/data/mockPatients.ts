
import { PhysicianEntry } from '@/types/patient';

export interface PatientProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  specialty: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  institution: string;
  registrationNumber: string;
  lastVisit: string;
  nextAppointment: string;
  assignedTo: string;
  caregiverPermission: boolean;
  caregiverName: string;
  caregiverEmail: string;
  caregiverPhone: string;
  status: 'New' | 'Diagnosis' | 'Follow-up' | 'Cancelled';
  cancellationReason?: string;
  physicianData: PhysicianEntry[];
  clinicalFindings: {
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
  redFlagSymptoms: {
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
}

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const mockPatients: Record<string, PatientProfile> = {
  '59873209874': {
    id: '59873209874',
    fullName: 'Robert Thompson',
    firstName: 'Robert',
    lastName: 'Thompson',
    gender: 'Male',
    dateOfBirth: '1952-01-01',
    age: calculateAge('1952-01-01'),
    specialty: 'Cardiology',
    title: 'Patient',
    email: 'robert.thompson@email.com',
    phone: '+1234567890',
    address: '123 Main St',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-598732',
    lastVisit: 'Apr 15, 2025',
    nextAppointment: 'Jun 22, 2025',
    assignedTo: 'Cardiologist',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'New',
    physicianData: [],
    clinicalFindings: {
      lvh12: false,
      lvh12Value: '',
      ntProBnp: false,
      ntProBnpValue: '',
      bnpValue: '',
      ef40: false,
      ef40Value: '',
      gfr30: false,
      gfr30Value: '',
      age65: true,
      age65Value: calculateAge('1952-01-01').toString()
    },
    redFlagSymptoms: {
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
      otherValue: ''
    }
  },
  '73921265792': {
    id: '73921265792',
    fullName: 'Margaret Wilson',
    firstName: 'Margaret',
    lastName: 'Wilson',
    gender: 'Female',
    dateOfBirth: '1957-01-01',
    age: calculateAge('1957-01-01'),
    specialty: 'Hematology',
    title: 'Patient',
    email: 'margaret.wilson@email.com',
    phone: '+1234567891',
    address: '456 Oak Ave',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-739212',
    lastVisit: 'Apr 27, 2025',
    nextAppointment: 'May 2, 2025',
    assignedTo: 'Hematologist',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'Diagnosis',
    physicianData: [
      {
        id: '1',
        physicianName: 'Dr. Sarah Johnson',
        specialty: 'Hematology',
        date: '2024-04-27',
        notes: 'Patient shows signs consistent with ATTR-CM. Recommended cardiac evaluation.',
        diagnosis: 'Suspected ATTR-CM',
        treatment: 'Referred to cardiology for further evaluation'
      }
    ],
    clinicalFindings: {
      lvh12: true,
      lvh12Value: '13',
      ntProBnp: true,
      ntProBnpValue: '650',
      bnpValue: '',
      ef40: true,
      ef40Value: '45',
      gfr30: true,
      gfr30Value: '45',
      age65: true,
      age65Value: calculateAge('1957-01-01').toString()
    },
    redFlagSymptoms: {
      ecgHypovoltage: true,
      pericardialEffusion: false,
      biatrialDilation: true,
      thickeningInteratrialSeptum: true,
      fiveFiveFiveFinding: false,
      diastolicDysfunction: true,
      intoleranceHeartFailure: false,
      spontaneousResolutionHypertension: false,
      taviAorticStenosis: false,
      other: false,
      otherValue: ''
    }
  },
  '92175362710': {
    id: '92175362710',
    fullName: 'James Davis',
    firstName: 'James',
    lastName: 'Davis',
    gender: 'Male',
    dateOfBirth: '1950-01-01',
    age: calculateAge('1950-01-01'),
    specialty: 'Cardiology',
    title: 'Patient',
    email: 'james.davis@email.com',
    phone: '+1234567892',
    address: '789 Pine Rd',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-921753',
    lastVisit: 'Feb 12, 2024',
    nextAppointment: 'May 3, 2025',
    assignedTo: 'Cardiologist',
    caregiverPermission: true,
    caregiverName: 'Mary Davis',
    caregiverEmail: 'mary.davis@email.com',
    caregiverPhone: '+1234567899',
    status: 'Follow-up',
    physicianData: [
      {
        id: '1',
        physicianName: 'Dr. Michael Chen',
        specialty: 'Cardiology',
        date: '2024-02-12',
        notes: 'Follow-up appointment. Patient responding well to treatment.',
        diagnosis: 'ATTR-CM - stable',
        treatment: 'Continue current medication regimen'
      }
    ],
    clinicalFindings: {
      lvh12: true,
      lvh12Value: '15',
      ntProBnp: true,
      ntProBnpValue: '800',
      bnpValue: '',
      ef40: true,
      ef40Value: '38',
      gfr30: false,
      gfr30Value: '25',
      age65: true,
      age65Value: calculateAge('1950-01-01').toString()
    },
    redFlagSymptoms: {
      ecgHypovoltage: true,
      pericardialEffusion: true,
      biatrialDilation: true,
      thickeningInteratrialSeptum: true,
      fiveFiveFiveFinding: true,
      diastolicDysfunction: true,
      intoleranceHeartFailure: true,
      spontaneousResolutionHypertension: false,
      taviAorticStenosis: false,
      other: false,
      otherValue: ''
    }
  },
  '44756104578': {
    id: '44756104578',
    fullName: 'Elizabeth Brown',
    firstName: 'Elizabeth',
    lastName: 'Brown',
    gender: 'Female',
    dateOfBirth: '1965-01-01',
    age: calculateAge('1965-01-01'),
    specialty: 'Cardiology',
    title: 'Patient',
    email: 'elizabeth.brown@email.com',
    phone: '+1234567893',
    address: '321 Elm St',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-447561',
    lastVisit: 'Apr 28, 2025',
    nextAppointment: 'Jun 4, 2025',
    assignedTo: 'Cardiologist',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'New',
    physicianData: [],
    clinicalFindings: {
      lvh12: false,
      lvh12Value: '11',
      ntProBnp: false,
      ntProBnpValue: '500',
      bnpValue: '',
      ef40: true,
      ef40Value: '42',
      gfr30: true,
      gfr30Value: '55',
      age65: false,
      age65Value: calculateAge('1965-01-01').toString()
    },
    redFlagSymptoms: {
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
      otherValue: ''
    }
  },
  '59753209876': {
    id: '59753209876',
    fullName: 'William Garcia',
    firstName: 'William',
    lastName: 'Garcia',
    gender: 'Male',
    dateOfBirth: '1962-01-01',
    age: calculateAge('1962-01-01'),
    specialty: 'Genetics',
    title: 'Patient',
    email: 'william.garcia@email.com',
    phone: '+1234567894',
    address: '654 Maple Dr',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-597532',
    lastVisit: 'Nov 18, 2024',
    nextAppointment: 'Jun 8, 2025',
    assignedTo: 'Genetics specialist',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'Diagnosis',
    physicianData: [
      {
        id: '1',
        physicianName: 'Dr. Lisa Rodriguez',
        specialty: 'Genetics',
        date: '2024-11-18',
        notes: 'Genetic testing ordered for hereditary ATTR amyloidosis. Family history significant.',
        diagnosis: 'Hereditary ATTR amyloidosis - pending genetic confirmation',
        treatment: 'Awaiting genetic test results'
      }
    ],
    clinicalFindings: {
      lvh12: true,
      lvh12Value: '16',
      ntProBnp: true,
      ntProBnpValue: '920',
      bnpValue: '',
      ef40: false,
      ef40Value: '35',
      gfr30: true,
      gfr30Value: '40',
      age65: false,
      age65Value: calculateAge('1962-01-01').toString()
    },
    redFlagSymptoms: {
      ecgHypovoltage: true,
      pericardialEffusion: false,
      biatrialDilation: true,
      thickeningInteratrialSeptum: true,
      fiveFiveFiveFinding: false,
      diastolicDysfunction: true,
      intoleranceHeartFailure: false,
      spontaneousResolutionHypertension: true,
      taviAorticStenosis: false,
      other: true,
      otherValue: 'Family history of cardiomyopathy'
    }
  },
  '21746756314': {
    id: '21746756314',
    fullName: 'Patricia Martinez',
    firstName: 'Patricia',
    lastName: 'Martinez',
    gender: 'Female',
    dateOfBirth: '1960-01-01',
    age: calculateAge('1960-01-01'),
    specialty: 'Nuclear Medicine',
    title: 'Patient',
    email: 'patricia.martinez@email.com',
    phone: '+1234567895',
    address: '987 Cedar Ave',
    institution: 'Medical Center',
    registrationNumber: 'REG-2024-217467',
    lastVisit: 'Jan 4, 2025',
    nextAppointment: 'May 6, 2025',
    assignedTo: 'Nuclear medicine specialist',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'New',
    physicianData: [],
    clinicalFindings: {
      lvh12: false,
      lvh12Value: '10',
      ntProBnp: false,
      ntProBnpValue: '450',
      bnpValue: '',
      ef40: true,
      ef40Value: '48',
      gfr30: true,
      gfr30Value: '62',
      age65: true,
      age65Value: calculateAge('1960-01-01').toString()
    },
    redFlagSymptoms: {
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
      otherValue: ''
    }
  }
};

export const getPatientProfile = (id: string): PatientProfile => {
  return mockPatients[id] || mockPatients['59753209876']; // Default to William Garcia if not found
};
