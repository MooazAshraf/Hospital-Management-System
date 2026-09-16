export interface Department {
  name: string;
  description: string;
  doctorsCount: number;
}

export interface Doctor {
  name: string;
  specialty: string;
  experienceYears: number;
}

export interface Review {
  quote: string;
  name: string;
  role: string;
}
