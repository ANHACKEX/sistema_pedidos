export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'delivery' | 'financial';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  description?: string;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    zipCode: string;
    complement?: string;
    reference?: string;
  };
  totalPurchases: number;
  lastPurchase?: Date;
  isActive: boolean;
  customerType: 'residential' | 'commercial';
  creditLimit?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  customerId?: string;
  saleId?: string;
  dueDate?: Date;
  paymentMethod?: string;
  installments?: number;
  currentInstallment?: number;
}

export interface Sale {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod: string;
  sellerId: string;
  deliveryId?: string;
  deliveryAddress?: {
    street: string;
    number: string;
    district: string;
    city: string;
    zipCode: string;
    complement?: string;
    reference?: string;
  };
  deliveryFee: number;
  deliveryDate?: Date;
  notes?: string;
}

export interface Delivery {
  id: string;
  saleId: string;
  customerId: string;
  deliveryPersonId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  scheduledDate: Date;
  deliveredDate?: Date;
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    zipCode: string;
    complement?: string;
    reference?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  deliveryFee: number;
  notes?: string;
  route?: string;
}

export interface Company {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    zipCode: string;
  };
  logo?: string;
  website?: string;
  socialMedia?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  businessHours?: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  deliveryRadius?: number;
  minimumDeliveryValue?: number;
}

export interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  averageTicket: number;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface Report {
  id: string;
  type: 'sales' | 'financial' | 'inventory' | 'customers' | 'deliveries';
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  data: any[];
  generatedAt: Date;
  generatedBy: string;
}

export interface SystemSettings {
  company: Company;
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  integrations: {
    whatsappApi?: {
      enabled: boolean;
      token?: string;
      phoneNumber?: string;
    };
    paymentGateway?: {
      enabled: boolean;
      provider?: string;
      credentials?: Record<string, string>;
    };
  };
  features: {
    deliveryModule: boolean;
    invoiceGeneration: boolean;
    multiplePaymentMethods: boolean;
    customerPortal: boolean;
  };
}