import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  type = 'button',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:transform active:scale-95';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md',
    info: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm hover:shadow-md',
    link: 'bg-transparent hover:underline text-blue-600 hover:text-blue-700 focus:ring-blue-500 p-0'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };
  
  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed hover:transform-none active:transform-none' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const handleClick = (e) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    const iconClass = `${iconSizes[size]} ${position === 'left' ? 'mr-2' : 'ml-2'}`;
    
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { className: iconClass });
    }
    
    return <span className={iconClass}>{icon}</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
          {loadingText || 'Chargement...'}
        </>
      );
    }

    return (
      <>
        {renderIcon(leftIcon, 'left')}
        {children}
        {renderIcon(rightIcon, 'right')}
      </>
    );
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabledClasses} 
        ${widthClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// Composants de boutons spécialisés
export const IconButton = forwardRef(({ 
  children, 
  size = 'md', 
  variant = 'ghost',
  className = '',
  ...props 
}, ref) => {
  const iconSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${iconSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`inline-flex rounded-lg shadow-sm ${className}`}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        let roundedClasses = '';
        if (isFirst && isLast) {
          roundedClasses = 'rounded-lg';
        } else if (isFirst) {
          roundedClasses = 'rounded-l-lg rounded-r-none';
        } else if (isLast) {
          roundedClasses = 'rounded-r-lg rounded-l-none';
        } else {
          roundedClasses = 'rounded-none';
        }
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${roundedClasses} ${!isFirst ? '-ml-px' : ''}`.trim()
        });
      })}
    </div>
  );
};

export default Button;