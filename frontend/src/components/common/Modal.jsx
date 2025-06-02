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
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-full sm:m-4'
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
      
      // Focus sur le modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Bloquer le scroll du body
      document.body.style.overflow = 'hidden';
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
      <div 
        className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Overlay avec animation */}
        <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity duration-300"
      aria-hidden="true"
        />

        {/* Spacer pour centrer le modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal avec animations */}
        <div 
          ref={modalRef}
          className=""
          onClick={handleModalClick}
          tabIndex={-1}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
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