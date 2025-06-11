import toast, { Toast, ToastOptions } from 'react-hot-toast';

// Define a type for the toast functions we want to ensure exist
type ToastFunctions = {
  success: (message: string | React.ReactNode, options?: ToastOptions) => string;
  error: (message: string | React.ReactNode, options?: ToastOptions) => string;
  warning: (message: string | React.ReactNode, options?: ToastOptions) => string;
  info: (message: string | React.ReactNode, options?: ToastOptions) => string;
  loading: (message: string | React.ReactNode, options?: ToastOptions) => string;
  custom: (message: string | React.ReactNode, options?: ToastOptions) => string;
};

// Create our custom toast object with all the functions we need
const customToast: ToastFunctions = {
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  
  // Add warning function since it's not included in react-hot-toast by default
  warning: (message, options) => {
    return toast(message, {
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
      ...options,
    });
  },
  
  // Add info function
  info: (message, options) => {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#E0F2FE',
        color: '#0369A1',
        border: '1px solid #0EA5E9',
      },
      ...options,
    });
  },
  
  loading: (message, options) => toast.loading(message, options),
  custom: (message, options) => toast(message, options),
};

export default customToast;
