
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient } from '@/types/patient';

interface PatientContextType {
  patients: Patient[];
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  getPatient: (patientId: string) => Patient | undefined;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '59873209874',
      firstName: 'Robert',
      lastName: 'Thompson',
      gender: 'Male',
      dateOfBirth: '1952-01-01',
      contactNumber: '+1234567890',
      address: '123 Main St',
      lastVisit: 'Apr 15, 2025',
      nextAppointment: 'Jun 22, 2025',
      assignedTo: 'Cardiologist',
      status: 'New',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
    {
      id: '73921265792',
      firstName: 'Margaret',
      lastName: 'Wilson',
      gender: 'Female',
      dateOfBirth: '1957-01-01',
      contactNumber: '+1234567891',
      address: '456 Oak Ave',
      lastVisit: 'Apr 27, 2025',
      nextAppointment: 'May 2, 2025',
      assignedTo: 'Hematologist',
      status: 'Diagnosis',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
    {
      id: '92175362710',
      firstName: 'James',
      lastName: 'Davis',
      gender: 'Male',
      dateOfBirth: '1950-01-01',
      contactNumber: '+1234567892',
      address: '789 Pine Rd',
      lastVisit: 'Feb 12, 2024',
      nextAppointment: 'May 3, 2025',
      assignedTo: 'Cardiologist',
      status: 'Follow-up',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
    {
      id: '44756104578',
      firstName: 'Elizabeth',
      lastName: 'Brown',
      gender: 'Female',
      dateOfBirth: '1965-01-01',
      contactNumber: '+1234567893',
      address: '321 Elm St',
      lastVisit: 'Apr 28, 2025',
      nextAppointment: 'Jun 4, 2025',
      assignedTo: 'Cardiologist',
      status: 'New',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
    {
      id: '59753209876',
      firstName: 'William',
      lastName: 'Garcia',
      gender: 'Male',
      dateOfBirth: '1962-01-01',
      contactNumber: '+1234567894',
      address: '654 Maple Dr',
      lastVisit: 'Nov 18, 2024',
      nextAppointment: 'Jun 8, 2025',
      assignedTo: 'Genetics specialist',
      status: 'Diagnosis',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
    {
      id: '21746756314',
      firstName: 'Patricia',
      lastName: 'Martinez',
      gender: 'Female',
      dateOfBirth: '1960-01-01',
      contactNumber: '+1234567895',
      address: '987 Cedar Ave',
      lastVisit: 'Jan 4, 2025',
      nextAppointment: 'May 6, 2025',
      assignedTo: 'Nuclear medicine specialist',
      status: 'New',
      allowCaregiver: false,
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
        age65: false,
        age65Value: ''
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
  ]);

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === patientId 
          ? { ...patient, ...updates }
          : patient
      )
    );
  };

  const getPatient = (patientId: string): Patient | undefined => {
    return patients.find(patient => patient.id === patientId);
  };

  return (
    <PatientContext.Provider value={{ patients, updatePatient, getPatient }}>
      {children}
    </PatientContext.Provider>
  );
};
