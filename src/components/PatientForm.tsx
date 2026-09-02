import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import DateOfBirthSelect from '@/components/DateOfBirthSelect';
import DateInputDdMmYyyy from '@/components/DateInputDdMmYyyy';
import { PatientFormData } from '@/lib/patientSchema';

export type DoctorOption = {
  documentId: string;
  fullName: string;
  specialty?: string;
};

type PatientFormProps = {
  formData: PatientFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData>>;
  cardiologists: DoctorOption[];
  showReportDates?: boolean;
  onLastReportDateChange?: (isoVal: string) => void;
  disabled?: boolean;
};

const PatientForm: React.FC<PatientFormProps> = ({
  formData,
  setFormData,
  cardiologists = [],
  showReportDates = false,
  onLastReportDateChange,
  disabled = false,
}) => {
  const safeData = formData || getDefaultPatientFormData();
  const clinical = safeData.clinicalFindings || defaultClinicalFindings;
  const redFlags = safeData.redFlagSymptoms || defaultRedFlags;
  const safeCardiologists = Array.isArray(cardiologists) ? cardiologists : [];

  const updateField = <K extends keyof PatientFormData>(field: K, value: PatientFormData[K]) => {
    setFormData((prev) => ({ ...(prev || getDefaultPatientFormData()), [field]: value }));
  };

  const updateClinicalFinding = (key: string, value: any) => {
    setFormData((prev) => {
      const current = prev || getDefaultPatientFormData();
      return {
        ...current,
        clinicalFindings: {
          ...(current.clinicalFindings || defaultClinicalFindings),
          [key]: value,
        },
      };
    });
  };

  const updateRedFlag = (key: string, value: any) => {
    setFormData((prev) => {
      const current = prev || getDefaultPatientFormData();
      return {
        ...current,
        redFlagSymptoms: {
          ...(current.redFlagSymptoms || defaultRedFlags),
          [key]: value,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Patient Information */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <span className="text-xl sm:text-2xl">👤</span>
            <span>Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                disabled={disabled}
                value={safeData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="First Name"
                className="h-10 sm:h-auto rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                disabled={disabled}
                value={safeData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Last Name"
                className="h-10 sm:h-auto rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                disabled={disabled}
                value={safeData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm sm:text-base bg-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <DateOfBirthSelect
                value={safeData.dateOfBirth}
                onChange={(val) => updateField('dateOfBirth', val)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <Input
                disabled={disabled}
                value={safeData.contactNumber}
                onChange={(e) => updateField('contactNumber', e.target.value)}
                placeholder="(+90) --- -- -- --"
                className="h-10 sm:h-auto rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Email
              </label>
              <Input
                disabled={disabled}
                type="email"
                value={safeData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter email address"
                className="h-10 sm:h-auto rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Primary Cardiologist <span className="text-red-500">*</span>
            </label>
            <select
              disabled={disabled}
              value={safeData.primaryCardiologistDocId}
              onChange={(e) => updateField('primaryCardiologistDocId', e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm sm:text-base bg-white"
            >
              <option value="">Select a cardiologist</option>
              {safeCardiologists.map((doc) => (
                <option key={doc.documentId} value={doc.documentId}>
                  {doc.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Caregiver Permission Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
              <Checkbox
                disabled={disabled}
                id="caregiverPermission"
                checked={safeData.allowCaregiver}
                onCheckedChange={(checked) => updateField('allowCaregiver', Boolean(checked))}
                className="mt-1"
              />
              <label htmlFor="caregiverPermission" className="text-gray-700 font-semibold text-sm sm:text-base leading-relaxed cursor-pointer">
                Permission to share caregiver information received
              </label>
            </div>

            {safeData.allowCaregiver && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Caregiver Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    disabled={disabled}
                    value={safeData.caregiverName}
                    onChange={(e) => updateField('caregiverName', e.target.value)}
                    placeholder="Enter caregiver name"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Caregiver Email
                  </label>
                  <Input
                    disabled={disabled}
                    type="email"
                    value={safeData.caregiverEmail}
                    onChange={(e) => updateField('caregiverEmail', e.target.value)}
                    placeholder="Enter caregiver email"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Caregiver Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    disabled={disabled}
                    type="tel"
                    value={safeData.caregiverPhone}
                    onChange={(e) => updateField('caregiverPhone', e.target.value)}
                    placeholder="Enter caregiver phone"
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Optional Report Deadlines Section (when showReportDates is enabled) */}
      {showReportDates && (
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span className="text-xl sm:text-2xl">📅</span>
              <span>Report Deadlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Last Report Date <span className="text-xs font-normal text-slate-400">(dd/mm/yyyy)</span>
                </label>
                <DateInputDdMmYyyy
                  value={safeData.lastReportDate}
                  onChange={(isoVal) => {
                    updateField('lastReportDate', isoVal);
                    if (onLastReportDateChange) onLastReportDateChange(isoVal);
                  }}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Next Renewal Date <span className="text-xs font-normal text-slate-400">(dd/mm/yyyy)</span> <span className="text-red-500">*</span>
                </label>
                <DateInputDdMmYyyy
                  value={safeData.reportDeadline}
                  onChange={(isoVal) => updateField('reportDeadline', isoVal)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Clinical Findings */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <span className="text-xl sm:text-2xl">📋</span>
            <span>Clinical Findings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* LVH > 12 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={clinical.lvh12}
                onChange={(e) => updateClinicalFinding('lvh12', e.target.checked)}
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="font-semibold text-sm sm:text-base">LVH &gt; 12</span>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Input
                disabled={disabled}
                value={clinical.lvh12Value}
                onChange={(e) => updateClinicalFinding('lvh12Value', e.target.value)}
                className="w-24 text-center h-9 rounded-xl"
                placeholder="Value"
              />
              <span className="text-sm">mm</span>
            </div>
          </div>

          {/* NT-proBNP / BNP */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-3 mb-3">
              <input
                disabled={disabled}
                type="checkbox"
                checked={clinical.ntProBnp}
                onChange={(e) => updateClinicalFinding('ntProBnp', e.target.checked)}
                className="w-5 h-5 flex-shrink-0 mt-1"
              />
              <span className="font-semibold text-sm sm:text-base leading-tight">
                NT-proBNP &gt; 600 (or) BNP &gt; 150
              </span>
            </div>
            <div className="ml-8 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  disabled={disabled}
                  value={clinical.ntProBnpValue}
                  onChange={(e) => updateClinicalFinding('ntProBnpValue', e.target.value)}
                  className="w-24 text-center h-9 rounded-xl"
                  placeholder="Value"
                />
                <span className="text-sm">pg/mL (NT-proBNP)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  disabled={disabled}
                  value={clinical.bnpValue}
                  onChange={(e) => updateClinicalFinding('bnpValue', e.target.value)}
                  className="w-24 text-center h-9 rounded-xl"
                  placeholder="Value"
                />
                <span className="text-sm">pg/mL (BNP)</span>
              </div>
            </div>
          </div>

          {/* EF >= 40 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={clinical.ef40}
                onChange={(e) => updateClinicalFinding('ef40', e.target.checked)}
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="font-semibold text-sm sm:text-base">EF &gt;= 40</span>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Input
                disabled={disabled}
                value={clinical.ef40Value}
                onChange={(e) => updateClinicalFinding('ef40Value', e.target.value)}
                className="w-24 text-center h-9 rounded-xl"
                placeholder="Value"
              />
              <span className="text-sm">%</span>
            </div>
          </div>

          {/* GFR > 30 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-3 mb-3">
              <input
                disabled={disabled}
                type="checkbox"
                checked={clinical.gfr30}
                onChange={(e) => updateClinicalFinding('gfr30', e.target.checked)}
                className="w-5 h-5 flex-shrink-0 mt-1"
              />
              <span className="font-semibold text-sm sm:text-base leading-tight">
                GFR &gt; 30 mL/min/1.73m²
              </span>
            </div>
            <div className="ml-8 flex items-center space-x-2">
              <Input
                disabled={disabled}
                value={clinical.gfr30Value}
                onChange={(e) => updateClinicalFinding('gfr30Value', e.target.value)}
                className="w-24 text-center h-9 rounded-xl"
                placeholder="Value"
              />
              <span className="text-xs sm:text-sm">mL/min/1.73m²</span>
            </div>
          </div>

          {/* Age >= 65 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={clinical.age65}
                onChange={(e) => updateClinicalFinding('age65', e.target.checked)}
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="font-semibold text-sm sm:text-base">Age &gt;= 65</span>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Input
                disabled={disabled}
                value={clinical.age65Value}
                onChange={(e) => updateClinicalFinding('age65Value', e.target.value)}
                className="w-24 text-center h-9 rounded-xl"
                placeholder="Value"
              />
              <span className="text-sm">years</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Echocardiography Findings (Cardiology) */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <span className="text-xl sm:text-2xl">🫀</span>
            <span>Echocardiography Findings (Cardiology)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Echo EF (%)</label>
              <Input
                disabled={disabled}
                type="number"
                value={clinical.echoEfValue || ''}
                onChange={(e) => updateClinicalFinding('echoEfValue', e.target.value)}
                placeholder="e.g. 50"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Echo IVS (mm)</label>
              <Input
                disabled={disabled}
                type="number"
                value={clinical.echoIvsValue || ''}
                onChange={(e) => updateClinicalFinding('echoIvsValue', e.target.value)}
                placeholder="e.g. 13"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Echo PW (mm)</label>
              <Input
                disabled={disabled}
                type="number"
                value={clinical.echoPwValue || ''}
                onChange={(e) => updateClinicalFinding('echoPwValue', e.target.value)}
                placeholder="e.g. 12"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Echo LA (mm)</label>
              <Input
                disabled={disabled}
                type="number"
                value={clinical.echoLaValue || ''}
                onChange={(e) => updateClinicalFinding('echoLaValue', e.target.value)}
                placeholder="e.g. 42"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Echo SDD</label>
              <select
                disabled={disabled}
                value={clinical.echoSddValue || ''}
                onChange={(e) => updateClinicalFinding('echoSddValue', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select SDD</option>
                <option value="Normal">Normal</option>
                <option value="Grade I">Grade I</option>
                <option value="Grade II">Grade II</option>
                <option value="Grade III">Grade III</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Additional Specialty Findings */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <span className="text-xl sm:text-2xl">🔬</span>
            <span>Other Specialty Findings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Bone Scintigraphy (Grade)</label>
              <select
                disabled={disabled}
                value={clinical.nmBoneScintigraphyGrade || ''}
                onChange={(e) => updateClinicalFinding('nmBoneScintigraphyGrade', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select Grade</option>
                <option value="Grade 0">Grade 0</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Genetics Anomaly</label>
              <select
                disabled={disabled}
                value={clinical.geneticsAnomaly || ''}
                onChange={(e) => updateClinicalFinding('geneticsAnomaly', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select Anomaly</option>
                <option value="ATTRv">ATTRv</option>
                <option value="ATTRwt">ATTRwt</option>
                <option value="None">None</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Serum Immunofixation</label>
              <select
                disabled={disabled}
                value={clinical.hemSerumImmunofixation || ''}
                onChange={(e) => updateClinicalFinding('hemSerumImmunofixation', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select Status</option>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Not Done">Not Done</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Urine Immunofixation</label>
              <select
                disabled={disabled}
                value={clinical.hemUrineImmunofixation || ''}
                onChange={(e) => updateClinicalFinding('hemUrineImmunofixation', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select Status</option>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Not Done">Not Done</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Free Light Chain Analysis</label>
              <select
                disabled={disabled}
                value={clinical.hemFreeLightChain || ''}
                onChange={(e) => updateClinicalFinding('hemFreeLightChain', e.target.value)}
                className="h-10 px-3 rounded-xl bg-white border border-gray-200 focus:bg-white w-full outline-none text-sm"
              >
                <option value="">Select Status</option>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Not Done">Not Done</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Red Flag Symptoms */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <span className="text-xl sm:text-2xl">⚠️</span>
            <span>Red Flag Symptoms</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.ecgHypovoltage}
              onChange={(e) => updateRedFlag('ecgHypovoltage', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">ECG Hypovoltage</span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.pericardialEffusion}
              onChange={(e) => updateRedFlag('pericardialEffusion', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">Pericardial Effusion</span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.biatrialDilation}
              onChange={(e) => updateRedFlag('biatrialDilation', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">Biatrial Dilation</span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.thickeningInteratrialSeptum}
              onChange={(e) => updateRedFlag('thickeningInteratrialSeptum', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">
              Thickening of the Interatrial Septum and Valves
            </span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.fiveFiveFiveFinding}
              onChange={(e) => updateRedFlag('fiveFiveFiveFinding', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">5-5-5 Finding</span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.diastolicDysfunction}
              onChange={(e) => updateRedFlag('diastolicDysfunction', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">
              Diastolic Dysfunction with Increased Left Ventricular Filling Pressure
            </span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.intoleranceHeartFailure}
              onChange={(e) => updateRedFlag('intoleranceHeartFailure', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">
              Intolerance to Standard Heart Failure Treatment
            </span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.spontaneousResolutionHypertension}
              onChange={(e) => updateRedFlag('spontaneousResolutionHypertension', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">
              Spontaneous Resolution of Hypertension
            </span>
          </div>

          <div className="flex items-start space-x-3 p-2">
            <input
              disabled={disabled}
              type="checkbox"
              checked={redFlags.taviAorticStenosis}
              onChange={(e) => updateRedFlag('taviAorticStenosis', e.target.checked)}
              className="w-5 h-5 flex-shrink-0 mt-1"
            />
            <span className="text-sm sm:text-base leading-relaxed">TAVI / Aortic Stenosis</span>
          </div>

          <div className="p-2">
            <div className="flex items-start space-x-3 mb-3">
              <input
                disabled={disabled}
                type="checkbox"
                checked={redFlags.other}
                onChange={(e) => updateRedFlag('other', e.target.checked)}
                className="w-5 h-5 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm sm:text-base font-medium">Other / Doctor's Comment</span>
                <Textarea
                  disabled={disabled}
                  value={redFlags.otherValue}
                  onChange={(e) => updateRedFlag('otherValue', e.target.value)}
                  placeholder="Enter additional symptoms or doctor's comments"
                  className="mt-2 min-h-32 resize-none w-full rounded-xl"
                  rows={6}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientForm;
