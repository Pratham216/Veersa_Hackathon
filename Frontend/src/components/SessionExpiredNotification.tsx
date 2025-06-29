import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SessionExpiredNotificationProps {
  show: boolean;
  onClose: () => void;
}

const SessionExpiredNotification: React.FC<SessionExpiredNotificationProps> = ({ show, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (show) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/auth';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Session Expired</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Your session has expired for security reasons. You will be redirected to the login page.
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} seconds...
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Login Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredNotification;
