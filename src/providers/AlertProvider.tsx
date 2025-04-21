
import { createContext, useState, useContext, ReactNode } from 'react';
import AlertBanner, { AlertType } from '@/components/ui/AlertBanner';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (type: AlertType, title: string, message: string, duration?: number) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (type: AlertType, title: string, message: string, duration = 5000) => {
    const id = Date.now().toString();
    setAlerts([...alerts, { id, type, title, message, duration }]);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      <div className="fixed top-0 left-0 right-0 z-50 p-4 space-y-2">
        {alerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
      {children}
    </AlertContext.Provider>
  );
};
