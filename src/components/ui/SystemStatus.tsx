import React from 'react';
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useSystemCheck } from '../../hooks/useSystemCheck';

const SystemStatus: React.FC = () => {
  const { isSupported, systemInfo, warnings, errors } = useSystemCheck();

  if (isSupported && warnings.length === 0 && errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Connection Status */}
      <div className={`mb-2 p-3 rounded-lg shadow-lg ${
        systemInfo.onlineStatus 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          {systemInfo.onlineStatus ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            systemInfo.onlineStatus ? 'text-green-800' : 'text-red-800'
          }`}>
            {systemInfo.onlineStatus ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Erros do Sistema:</p>
              <ul className="text-xs text-red-700 mt-1 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Avisos:</p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {isSupported && warnings.length === 0 && errors.length === 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Sistema funcionando normalmente
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;