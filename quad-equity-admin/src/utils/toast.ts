import { toast } from 'react-toastify';

const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warn',
) => {
  toast[type](message);
};

export default showToast;
