/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  name: 'Gas Gestão+',
  version: '2.0.0',
  description: 'Sistema completo de gestão para empresas de gás',
  author: 'Bolt',
} as const;

export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
} as const;

export const STORAGE_KEYS = {
  products: 'products',
  customers: 'customers',
  sales: 'sales',
  transactions: 'transactions',
  deliveries: 'deliveries',
  users: 'users',
  company: 'company',
  settings: 'settings',
  auth: 'auth_user',
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  products: '/products',
  customers: '/customers',
  sales: '/sales',
  deliveries: '/deliveries',
  financial: '/financial',
  reports: '/reports',
  users: '/users',
  settings: '/settings',
} as const;

export const USER_ROLES = {
  admin: 'admin',
  seller: 'seller',
  delivery: 'delivery',
  financial: 'financial',
} as const;

export const DELIVERY_STATUS = {
  pending: 'pending',
  in_transit: 'in_transit',
  delivered: 'delivered',
  failed: 'failed',
} as const;

export const SALE_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  delivered: 'delivered',
  cancelled: 'cancelled',
} as const;

export const TRANSACTION_STATUS = {
  pending: 'pending',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'cancelled',
} as const;

export const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
  'Cheque',
  'Crediário',
] as const;

export const PRODUCT_CATEGORIES = [
  'Botijões',
  'Acessórios',
  'Equipamentos',
  'Serviços',
  'Outros',
] as const;

export const CUSTOMER_TYPES = {
  residential: 'residential',
  commercial: 'commercial',
} as const;