import { useEffect } from 'react';
import { NotificationManager } from '../utils/notifications';

export function useNotifications() {
  const notificationManager = NotificationManager.getInstance();

  useEffect(() => {
    // Request permission on mount
    notificationManager.requestPermission();
  }, []);

  return {
    showNotification: (title: string, options?: NotificationOptions) => {
      notificationManager.showNotification(title, options);
    },
    checkLowStock: (products: any[]) => {
      notificationManager.checkLowStock(products);
    },
    notifyNewSale: (saleId: string, customerName: string, total: number) => {
      notificationManager.notifyNewSale(saleId, customerName, total);
    },
    notifyDeliveryUpdate: (deliveryId: string, status: string, customerName: string) => {
      notificationManager.notifyDeliveryUpdate(deliveryId, status, customerName);
    }
  };
}