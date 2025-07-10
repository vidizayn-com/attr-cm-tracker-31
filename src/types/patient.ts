
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  address: string;
  lastVisit: string;
  nextAppointment: string;
  assignedTo: string;
  status: 'New' | 'Diagnosis' | 'Follow-up' | 'Cancelled';
  cancellationReason?: string;
  allowCaregiver: boolean;
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
  physicianData: PhysicianEntry[];
}

export interface PhysicianEntry {
  id: string;
  physicianName: string;
  specialty: string;
  date: string;
  notes: string;
  diagnosis: string;
  treatment: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
}

export interface Specialist {
  id: string;
  name: string;
  type: string;
  hospitalId: string;
}

export interface SpecialistType {
  id: string;
  name: string;
  icon: string;
  description: string;
}
