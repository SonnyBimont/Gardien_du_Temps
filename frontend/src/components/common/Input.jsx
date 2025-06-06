import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  error, 
  success,
  hint,
  className = '', 
  type = 'text',
  size = 'md',
  variant = 'default',
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  // Gestion des états
  const hasError = !!error;
  const hasSuccess = !!success;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || showPasswordToggle || hasError || hasSuccess;
  
  // Classes conditionnelles
  const stateClasses = hasError 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : hasSuccess 
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : variants[variant];
    
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '';
  const paddingClasses = `${hasLeftIcon ? 'pl-10' : ''} ${hasRightIcon ? 'pr-10' : ''}`;
  
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <div className={`${iconSizes[size]} text-gray-400`}>
          {leftIcon}
        </div>
      </div>
    );
  };

  const renderRightIcon = () => {
    if (!hasRightIcon) return null;
    
    let icon = null;
    let clickable = false;
    
    if (showPasswordToggle && type === 'password') {
      icon = showPassword ? <EyeOff /> : <Eye />;
      clickable = true;
    } else if (hasError) {
      icon = <AlertCircle className="text-red-400" />;
    } else if (hasSuccess) {
      icon = <CheckCircle className="text-green-400" />;
    } else if (rightIcon) {
      icon = rightIcon;
    }
    
    return (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <div 
          className={`
            ${iconSizes[size]} 
            ${clickable ? 'cursor-pointer text-gray-400 hover:text-gray-600' : 'text-gray-400'}
          `}
          onClick={clickable ? togglePasswordVisibility : undefined}
        >
          {icon}
        </div>
      </div>
    );
  };

  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  const renderHint = () => {
    if (!hint || hasError) return null;
    
    return (
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    );
  };

  const renderSuccess = () => {
    if (!success || hasError) return null;
    
    return (
      <p className="mt-1 text-sm text-green-600 flex items-center">
        <CheckCircle className="w-4 h-4 mr-1" />
        {success}
      </p>
    );
  };

  return (
    <div className={`mb-4 ${className}`}>
      {renderLabel()}
      
      <div className="relative">
        {renderLeftIcon()}
        
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${sizes[size]}
            ${paddingClasses}
            ${disabledClasses}
          `.trim().replace(/\s+/g, ' ')}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${props.id}-error` : 
            hint ? `${props.id}-hint` : undefined
          }
          {...props}
        />
        
        {renderRightIcon()}
      </div>
      
      {renderError()}
      {renderSuccess()}
      {renderHint()}
    </div>
  );
});

Input.displayName = 'Input';

// Composants spécialisés
export const TextArea = forwardRef(({ 
  label, 
  error, 
  success,
  hint,
  className = '', 
  rows = 3,
  resize = 'vertical',
  ...props 
}, ref) => {
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : success 
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          ${resizeClasses[resize]}
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
        `.trim().replace(/\s+/g, ' ')}
        aria-invalid={!!error}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          {success}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export const Select = forwardRef(({ 
  label, 
  error, 
  success,
  hint,
  className = '', 
  children,
  placeholder,
  ...props 
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-lg transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : success 
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
        `.trim().replace(/\s+/g, ' ')}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          {success}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;