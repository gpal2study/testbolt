export interface DocumentType {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  productName: string;
  productType: 'Small Molecule' | 'Biologic' | 'Device' | 'Combination';
  productCode: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface User {
  username: string;
  loginTime: Date;
}
