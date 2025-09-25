import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const FlashMessage: React.FC = () => {
  const { flashMessage, setFlashMessage } = useApp();

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (!flashMessage) return null;

  const getIcon = () => {
    switch (flashMessage.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (flashMessage.type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg border ${getStyles()} shadow-lg max-w-sm animate-in slide-in-from-right-full`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{flashMessage.message}</p>
        </div>
        <button
          onClick={() => setFlashMessage(null)}
          className="ml-4 flex-shrink-0 hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FlashMessage;