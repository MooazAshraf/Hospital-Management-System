export interface Department {
  _id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Not returned by the backend yet — kept optional so the UI can show it
  // once/if a real doctor-count aggregation is added to GET /api/departments.
  doctorsCount?: number;
}
