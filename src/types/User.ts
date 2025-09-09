// src/types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'funcionario' | 'cliente';
  isActive: boolean;
  lastLogin: Date;
  permissions: string[];
}
