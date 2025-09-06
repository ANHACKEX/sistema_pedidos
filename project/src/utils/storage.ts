// Utility functions for data persistence and management
export class StorageManager {
  private static instance: StorageManager;
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Backup and restore functionality
  exportData(): string {
    const data = {
      products: JSON.parse(localStorage.getItem('products') || '[]'),
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      sales: JSON.parse(localStorage.getItem('sales') || '[]'),
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      deliveries: JSON.parse(localStorage.getItem('deliveries') || '[]'),
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      company: JSON.parse(localStorage.getItem('company') || '{}'),
      settings: JSON.parse(localStorage.getItem('settings') || '{}'),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      const requiredKeys = ['products', 'customers', 'sales', 'transactions', 'deliveries', 'users'];
      for (const key of requiredKeys) {
        if (!Array.isArray(data[key])) {
          throw new Error(`Invalid data structure: ${key} must be an array`);
        }
      }

      // Import data
      Object.keys(data).forEach(key => {
        if (key !== 'exportDate') {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllData(): void {
    const keys = ['products', 'customers', 'sales', 'transactions', 'deliveries', 'users', 'company', 'settings'];
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Data validation
  validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');

      // Validate products
      products.forEach((product: any, index: number) => {
        if (!product.id || !product.name || typeof product.price !== 'number') {
          errors.push(`Product at index ${index} is invalid`);
        }
      });

      // Validate customers
      customers.forEach((customer: any, index: number) => {
        if (!customer.id || !customer.name || !customer.document) {
          errors.push(`Customer at index ${index} is invalid`);
        }
      });

      // Validate sales references
      sales.forEach((sale: any, index: number) => {
        const customerExists = customers.some((c: any) => c.id === sale.customerId);
        if (!customerExists) {
          errors.push(`Sale at index ${index} references non-existent customer`);
        }
      });

    } catch (error) {
      errors.push('Data corruption detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}