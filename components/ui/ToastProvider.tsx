'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastInput = Omit<Toast, 'id'>;

type ToastContextValue = {
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, {
  icon: typeof CheckCircle2;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  titleColor: string;
  descriptionColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconColor: '#16a34a',
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    titleColor: '#166534',
    descriptionColor: '#15803d',
  },
  error: {
    icon: AlertCircle,
    iconColor: '#dc2626',
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    titleColor: '#991b1b',
    descriptionColor: '#b91c1c',
  },
  info: {
    icon: Info,
    iconColor: '#2563EB',
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    titleColor: '#1e40af',
    descriptionColor: '#1d4ed8',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { ...input, id }].slice(-4));
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: 'min(380px, calc(100vw - 32px))',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(item => {
          const style = toastStyles[item.type];
          const Icon = style.icon;

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: style.backgroundColor,
                border: `1px solid ${style.borderColor}`,
                borderRadius: '16px',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
                color: style.titleColor,
                display: 'flex',
                gap: '12px',
                padding: '16px',
                pointerEvents: 'auto',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Icon size={22} color={style.iconColor} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800 }}>
                  {item.title}
                </p>
                {item.description && (
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: style.descriptionColor }}>
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismiss(item.id)}
                style={{
                  width: '28px',
                  height: '28px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={15} color={style.titleColor} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
