export type ToastVariant = 'success' | 'info' | 'error';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  timeoutMs: number;
};

const createId = () => `toast:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export function useToasts() {
  const toasts = useState<Toast[]>('toasts', () => []);

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const pushToast = (message: string, variant: ToastVariant = 'info', timeoutMs = 2200) => {
    const toast: Toast = { id: createId(), message, variant, timeoutMs };
    toasts.value = [...toasts.value, toast];

    if (import.meta.client && timeoutMs > 0) {
      window.setTimeout(() => removeToast(toast.id), timeoutMs);
    }

    return toast.id;
  };

  const clearToasts = () => {
    toasts.value = [];
  };

  return { toasts, pushToast, removeToast, clearToasts };
}

