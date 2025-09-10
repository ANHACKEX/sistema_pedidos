import { useEffect, useState } from 'react';
import { logger } from '../lib/logger';

interface SystemInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
  onlineStatus: boolean;
}

interface SystemCheck {
  isSupported: boolean;
  systemInfo: SystemInfo;
  warnings: string[];
  errors: string[];
}

export function useSystemCheck(): SystemCheck {
  const [systemCheck, setSystemCheck] = useState<SystemCheck>({
    isSupported: true,
    systemInfo: {
      userAgent: '',
      platform: '',
      language: '',
      cookiesEnabled: false,
      localStorageEnabled: false,
      sessionStorageEnabled: false,
      onlineStatus: false,
    },
    warnings: [],
    errors: [],
  });

  useEffect(() => {
    const checkSystem = () => {
      const warnings: string[] = [];
      const errors: string[] = [];
      let isSupported = true;

      // Get system info
      const systemInfo: SystemInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        localStorageEnabled: checkLocalStorage(),
        sessionStorageEnabled: checkSessionStorage(),
        onlineStatus: navigator.onLine,
      };

      // Check browser compatibility
      if (!window.fetch) {
        errors.push('Fetch API não suportada');
        isSupported = false;
      }

      if (!window.localStorage) {
        errors.push('LocalStorage não suportado');
        isSupported = false;
      }

      if (!window.sessionStorage) {
        warnings.push('SessionStorage não suportado');
      }

      // Check for modern JavaScript features
      if (!window.Promise) {
        errors.push('Promises não suportadas');
        isSupported = false;
      }

      if (!Array.prototype.includes) {
        warnings.push('Alguns recursos modernos do JavaScript podem não funcionar');
      }

      // Check viewport
      if (window.innerWidth < 320) {
        warnings.push('Tela muito pequena - experiência pode ser limitada');
      }

      // Check connection
      if (!navigator.onLine) {
        warnings.push('Sem conexão com a internet');
      }

      // Log system info
      logger.info('System Check:', {
        isSupported,
        systemInfo,
        warnings,
        errors,
      });

      setSystemCheck({
        isSupported,
        systemInfo,
        warnings,
        errors,
      });
    };

    checkSystem();

    // Listen for online/offline events
    const handleOnline = () => {
      setSystemCheck(prev => ({
        ...prev,
        systemInfo: { ...prev.systemInfo, onlineStatus: true },
        warnings: prev.warnings.filter(w => !w.includes('conexão')),
      }));
    };

    const handleOffline = () => {
      setSystemCheck(prev => ({
        ...prev,
        systemInfo: { ...prev.systemInfo, onlineStatus: false },
        warnings: [...prev.warnings, 'Sem conexão com a internet'],
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return systemCheck;
}

function checkLocalStorage(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkSessionStorage(): boolean {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}