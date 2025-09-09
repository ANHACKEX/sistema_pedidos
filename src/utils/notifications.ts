// Notification system
export class NotificationManager {
  private static instance: NotificationManager;
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/manifest-icon-192.png',
        badge: '/manifest-icon-192.png',
        ...options
      });
    }
  }

  // Check low stock and notify
  checkLowStock(products: any[]): void {
    const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.isActive);
    
    if (lowStockProducts.length > 0) {
      this.showNotification(
        `Estoque Baixo - ${lowStockProducts.length} produto(s)`,
        {
          body: `${lowStockProducts.map(p => p.name).join(', ')} precisam de reposição`,
          tag: 'low-stock'
        }
      );
    }
  }

  // Notify new sale
  notifyNewSale(saleId: string, customerName: string, total: number): void {
    this.showNotification(
      'Nova Venda Realizada',
      {
        body: `Cliente: ${customerName} - Total: R$ ${total.toFixed(2)}`,
        tag: 'new-sale'
      }
    );
  }

  // Notify delivery status
  notifyDeliveryUpdate(deliveryId: string, status: string, customerName: string): void {
    const statusText = {
      'pending': 'Pendente',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
      'failed': 'Falhou'
    }[status] || status;

    this.showNotification(
      `Entrega ${statusText}`,
      {
        body: `Cliente: ${customerName} - Entrega #${deliveryId.slice(-6)}`,
        tag: 'delivery-update'
      }
    );
  }
}