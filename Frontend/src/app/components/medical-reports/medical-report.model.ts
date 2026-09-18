export interface PrescribedMedicine {
  medicine: string;   // Medicine _id
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalReport {
  _id?: string;
  patient: string;    // User _id
  doctor: string;      // User _id
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
