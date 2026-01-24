interface ToastProps {
  toast: { message: string; type: 'success' | 'error' } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className={`fo-toast fo-toast-${toast.type}`}>
      {toast.message}
    </div>
  );
};
