export interface Medicine {
  _id?: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  expiryDate: string;
  requiresPrescription: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Blank object used to seed the Add / Edit modal form.
export function emptyMedicine(): Medicine {
  return {
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    unit: '',
    pricePerUnit: 0,
    stockQuantity: 0,
    expiryDate: '',
    requiresPrescription: false,
  };
}
