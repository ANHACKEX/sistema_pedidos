import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Transaction, Sale, Company, DashboardStats, Delivery, User, SystemSettings } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { ValidationUtils } from '../utils/validation';

interface DataContextType {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  sales: Sale[];
  deliveries: Delivery[];
  users: User[];
  company: Company;
  settings: SystemSettings;
  dashboardStats: DashboardStats;
  
  // Product methods
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Sale methods
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  
  // Delivery methods
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  
  // User methods
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Company methods
  updateCompany: (company: Partial<Company>) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const defaultCompany: Company = {
  name: 'Distribuidora de Gás São Paulo Ltda',
  document: '98.765.432/0001-10',
  phone: '(11) 99999-9999',
  email: 'contato@distribuidorasp.com.br',
  address: {
    street: 'Av. Industrial',
    number: '1500',
    district: 'Distrito Industrial',
    city: 'São Paulo',
    zipCode: '08500-000'
  },
  logo: '',
  deliveryRadius: 15,
  minimumDeliveryValue: 80,
  socialMedia: {
    whatsapp: '(11) 99999-9999',
    instagram: '@distribuidorasp',
    facebook: 'distribuidoraspoficial'
  }
};

const defaultSettings: SystemSettings = {
  company: defaultCompany,
  notifications: {
    email: true,
    sms: false,
    whatsapp: true
  },
  integrations: {
    whatsappApi: {
      enabled: false
    },
    paymentGateway: {
      enabled: false
    }
  },
  features: {
    deliveryModule: true,
    invoiceGeneration: true,
    multiplePaymentMethods: true,
    customerPortal: false
  }
};

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Botijão P13 - 13kg',
    category: 'Botijões',
    price: 85.00,
    stock: 50,
    minStock: 10,
    unit: 'un',
    description: 'Botijão de gás P13 para uso residencial',
    supplier: 'Ultragaz',
    barcode: '7891234567890',
    weight: 13,
    isActive: true
  },
  {
    id: '2',
    name: 'Botijão P20 - 20kg',
    category: 'Botijões',
    price: 120.00,
    stock: 30,
    minStock: 8,
    unit: 'un',
    description: 'Botijão de gás P20 para uso comercial',
    supplier: 'Ultragaz',
    barcode: '7891234567891',
    weight: 20,
    isActive: true
  },
  {
    id: '3',
    name: 'Regulador de Pressão',
    category: 'Acessórios',
    price: 25.00,
    stock: 100,
    minStock: 20,
    unit: 'un',
    description: 'Regulador de pressão para botijões',
    supplier: 'Aliança',
    barcode: '7891234567892',
    isActive: true
  },
  {
    id: '4',
    name: 'Mangueira 1,5m',
    category: 'Acessórios',
    price: 15.00,
    stock: 80,
    minStock: 15,
    unit: 'un',
    description: 'Mangueira de gás 1,5 metros',
    supplier: 'Aliança',
    barcode: '7891234567893',
    isActive: true
  }
];

const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'Maria Santos',
    document: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'maria@email.com',
    address: {
      street: 'Rua das Palmeiras',
      number: '123',
      district: 'Vila Nova',
      city: 'São Paulo',
      zipCode: '01234-567',
      reference: 'Próximo à padaria'
    },
    totalPurchases: 1250.00,
    lastPurchase: new Date('2024-12-15'),
    isActive: true,
    customerType: 'residential',
    creditLimit: 500
  },
  {
    id: '2',
    name: 'Padaria Central',
    document: '12.345.678/0001-90',
    phone: '(11) 91234-5678',
    email: 'contato@padariacentral.com',
    address: {
      street: 'Rua do Comércio',
      number: '456',
      district: 'Centro',
      city: 'São Paulo',
      zipCode: '01234-568'
    },
    totalPurchases: 3200.00,
    lastPurchase: new Date('2024-12-20'),
    isActive: true,
    customerType: 'commercial',
    creditLimit: 1000
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { checkLowStock, notifyNewSale, notifyDeliveryUpdate } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<Company>(defaultCompany);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    averageTicket: 0,
    topProducts: []
  });

  useEffect(() => {
    // Load data from localStorage
    const loadData = (key: string, defaultValue: any) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    };

    setProducts(loadData('products', sampleProducts));
    setCustomers(loadData('customers', sampleCustomers));
    setTransactions(loadData('transactions', []));
    setSales(loadData('sales', []));
    setDeliveries(loadData('deliveries', []));
    setUsers(loadData('users', []));
    setCompany(loadData('company', defaultCompany));
    setSettings(loadData('settings', defaultSettings));
  }, []);

  useEffect(() => {
    // Check for low stock every 5 minutes
    const lowStockInterval = setInterval(() => {
      checkLowStock(products);
    }, 5 * 60 * 1000);

    return () => clearInterval(lowStockInterval);
  }, [products, checkLowStock]);

  useEffect(() => {
    // Calculate dashboard stats
    const lowStock = products.filter(p => p.stock <= p.minStock && p.isActive).length;
    const pending = transactions.filter(t => t.status === 'pending').length;
    const pendingDel = deliveries.filter(d => d.status === 'pending' || d.status === 'in_transit').length;
    const completedDel = deliveries.filter(d => d.status === 'delivered').length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= thisMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySales = sales.filter(s => new Date(s.date) >= thisMonth);
    const avgTicket = monthlySales.length > 0 
      ? monthlySales.reduce((sum, s) => sum + s.total, 0) / monthlySales.length 
      : 0;

    // Calculate top products
    const productSales = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0, name: item.productName };
        current.quantity += item.quantity;
        current.revenue += item.total;
        productSales.set(item.productId, current);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setDashboardStats({
      totalSales: sales.length,
      totalCustomers: customers.length,
      lowStockItems: lowStock,
      pendingPayments: pending,
      monthlyRevenue: monthlyIncome,
      monthlyExpenses: monthlyExpense,
      pendingDeliveries: pendingDel,
      completedDeliveries: completedDel,
      averageTicket: avgTicket,
      topProducts
    });
  }, [products, customers, transactions, sales, deliveries]);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Product methods
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveToStorage('products', updatedProducts);
  };

  // Customer methods
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: generateId() };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    saveToStorage('customers', updatedCustomers);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updatedCustomers = customers.map(c => c.id === id ? { ...c, ...updates } : c);
    setCustomers(updatedCustomers);
    saveToStorage('customers', updatedCustomers);
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    saveToStorage('customers', updatedCustomers);
  };

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: generateId() };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
  };

  // Sale methods
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: generateId() };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    saveToStorage('sales', updatedSales);

    // Notify new sale
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      notifyNewSale(newSale.id, customer.name, sale.total);
    }

    // Update product stock
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const updatedProducts = products.map(p => 
          p.id === item.productId 
            ? { ...p, stock: p.stock - item.quantity }
            : p
        );
        setProducts(updatedProducts);
        saveToStorage('products', updatedProducts);
      }
    });

    // Add transaction
    addTransaction({
      type: 'income',
      category: 'Venda',
      description: `Venda #${newSale.id}`,
      amount: sale.total,
      date: sale.date,
      status: sale.paymentMethod === 'cash' ? 'paid' : 'pending',
      customerId: sale.customerId,
      paymentMethod: sale.paymentMethod
    });

    // Update customer total purchases
    const updatedCustomers = customers.map(c => 
      c.id === sale.customerId 
        ? { ...c, totalPurchases: c.totalPurchases + sale.total, lastPurchase: sale.date }
        : c
    );
    setCustomers(updatedCustomers);
    saveToStorage('customers', updatedCustomers);
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    const updatedSales = sales.map(s => s.id === id ? { ...s, ...updates } : s);
    setSales(updatedSales);
    saveToStorage('sales', updatedSales);
  };

  const deleteSale = (id: string) => {
    const updatedSales = sales.filter(s => s.id !== id);
    setSales(updatedSales);
    saveToStorage('sales', updatedSales);
  };

  // Delivery methods
  const addDelivery = (delivery: Omit<Delivery, 'id'>) => {
    const newDelivery = { ...delivery, id: generateId() };
    const updatedDeliveries = [...deliveries, newDelivery];
    setDeliveries(updatedDeliveries);
    saveToStorage('deliveries', updatedDeliveries);
  };

  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    const delivery = deliveries.find(d => d.id === id);
    const customer = delivery ? customers.find(c => c.id === delivery.customerId) : null;
    
    const updatedDeliveries = deliveries.map(d => d.id === id ? { ...d, ...updates } : d);
    setDeliveries(updatedDeliveries);
    saveToStorage('deliveries', updatedDeliveries);

    // Notify delivery status change
    if (delivery && customer && updates.status) {
      notifyDeliveryUpdate(id, updates.status, customer.name);
    }
  };

  const deleteDelivery = (id: string) => {
    const updatedDeliveries = deliveries.filter(d => d.id !== id);
    setDeliveries(updatedDeliveries);
    saveToStorage('deliveries', updatedDeliveries);
  };

  // User methods
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: generateId() };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage('users', updatedUsers);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsers(updatedUsers);
    saveToStorage('users', updatedUsers);
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveToStorage('users', updatedUsers);
  };

  // Company methods
  const updateCompany = (updates: Partial<Company>) => {
    const updatedCompany = { ...company, ...updates };
    setCompany(updatedCompany);
    saveToStorage('company', updatedCompany);
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    saveToStorage('settings', updatedSettings);
  };

  return (
    <DataContext.Provider value={{
      products,
      customers,
      transactions,
      sales,
      deliveries,
      users,
      company,
      settings,
      dashboardStats,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSale,
      updateSale,
      deleteSale,
      addDelivery,
      updateDelivery,
      deleteDelivery,
      addUser,
      updateUser,
      deleteUser,
      updateCompany,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};