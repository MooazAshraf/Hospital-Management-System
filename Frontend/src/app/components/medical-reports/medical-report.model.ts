export interface PrescribedMedicine {
  medicine: string | { _id: string; name?: string };
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalReport {
  _id?: string;
  patient: string | { _id: string; name?: string; email?: string };
  doctor: string | { _id: string; name?: string; email?: string };
  appointment?: string | null;
  surgery?: string | null;
  reportType: string;
  title: string;
  diagnosis: string;
  findings?: string;
  recommendations?: string;
  prescribedMedicines: PrescribedMedicine[];
  reportDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export function emptyReport(): MedicalReport {
  return {
    patient: '',
    doctor: '',
    reportType: '',
    title: '',
    diagnosis: '',
    findings: '',
    recommendations: '',
    prescribedMedicines: [],
    reportDate: '',
  };
}

export function emptyPrescribedMedicine(): PrescribedMedicine {
  return {
    medicine: '',
    dosage: '',
    frequency: '',
    duration: '',
  };
}
