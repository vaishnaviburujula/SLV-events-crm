import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div
        className={`w-full ${sizeClasses[size]} bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl shadow-black/50 z-50 overflow-hidden transition-all duration-300 animate-slide-up flex flex-col max-h-[90vh]`}
      >
        <div className="px-6 py-5 border-b border-dark-800/60 bg-dark-950/40 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-850 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow text-dark-200 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
