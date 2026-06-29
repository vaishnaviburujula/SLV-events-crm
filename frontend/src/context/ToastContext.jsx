import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    showToast,
    removeToast,
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-dark-900/90 border-emerald-500/30 text-emerald-50';
      case 'error':
        return 'bg-dark-900/90 border-rose-500/30 text-rose-50';
      case 'warning':
        return 'bg-dark-900/90 border-amber-500/30 text-amber-50';
      default:
        return 'bg-dark-900/90 border-blue-500/30 text-blue-50';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-up ${getStyles(
              toast.type
            )}`}
          >
            <div className="flex items-center gap-3">
              {getIcon(toast.type)}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-dark-400 hover:text-dark-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
