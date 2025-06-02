import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  variant = 'default',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className = '',
  ...props 
}) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg lg:max-w-2xl',
  lg: 'sm:max-w-2xl lg:max-w-4xl',
  xl: 'sm:max-w-4xl lg:max-w-6xl',
  full: 'sm:max-w-full'
};

  const variants = {
    default: 'bg-white',
    success: 'bg-green-50 border-t-4 border-green-400',
    warning: 'bg-yellow-50 border-t-4 border-yellow-400',
    danger: 'bg-red-50 border-t-4 border-red-400',
    info: 'bg-blue-50 border-t-4 border-blue-400'
  };

  // Gestion du focus et de l'échappement
useEffect(() => {
  if (isOpen) {
    // Sauvegarder le focus précédent
    previousFocus.current = document.activeElement;
    document.body.classList.add('modal-open');
    
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
    
    // Focus sur le premier champ de saisie après un court délai
    const timer = setTimeout(() => {
      if (modalRef.current) {
        // Chercher le premier input, select ou textarea
        const firstInput = modalRef.current.querySelector(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        
        if (firstInput) {
          firstInput.focus();
        } else {
          // Fallback: focus sur le modal lui-même
          modalRef.current.focus();
        }
      }
    }, 150); // Délai pour laisser le modal s'ouvrir complètement
    
    return () => clearTimeout(timer);
  } else {
    // Restaurer le focus
    if (previousFocus.current) {
      previousFocus.current.focus();
      document.body.classList.remove('modal-open');
    }
    
    // Restaurer le scroll
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
    document.body.classList.remove('modal-open');
  };
}, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

return (
  <div 
    className="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    {/* Overlay */}
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity duration-300"
      onClick={closeOnOverlay ? onClose : undefined}
      aria-hidden="true"
    />

    {/* Container centré avec responsive */}
    <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl 
          w-full max-w-[95vw] max-h-[95vh] overflow-y-auto
          ${sizes[size]}
          ${variants[variant]}
          ${className}
        `}
        onClick={handleModalClick}
        role="document"
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            {title && (
              <h3 
                id="modal-title"
                className="text-lg font-semibold text-gray-900 pr-4"
              >
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 flex-shrink-0"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

// Composant Modal de confirmation
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer l'action",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  loading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
      {...props}
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

// Composant Modal d'alerte
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  buttonText = "OK",
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      footer={
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      }
      {...props}
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

// Hook personnalisé pour gérer les modals
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default Modal;