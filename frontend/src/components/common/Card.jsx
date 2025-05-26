import React, { forwardRef } from 'react';

const Card = forwardRef(({ 
  children, 
  className = '', 
  title = null,
  subtitle = null,
  variant = 'default',
  size = 'md',
  padding = true,
  shadow = true,
  border = false,
  hoverable = false,
  clickable = false,
  onClick,
  header,
  footer,
  ...props 
}, ref) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  
  const variants = {
    default: 'border border-gray-200',
    elevated: 'border-0',
    outlined: 'border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
    success: 'border border-green-200 bg-green-50',
    warning: 'border border-yellow-200 bg-yellow-50',
    danger: 'border border-red-200 bg-red-50',
    info: 'border border-blue-200 bg-blue-50'
  };
  
  const sizes = {
    sm: padding ? 'p-4' : '',
    md: padding ? 'p-6' : '',
    lg: padding ? 'p-8' : '',
    xl: padding ? 'p-10' : ''
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const shadowClass = shadow ? (typeof shadow === 'string' ? shadows[shadow] : shadows.md) : shadows.none;
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const clickableClass = clickable || onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 active:transform active:scale-95' : '';
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const renderHeader = () => {
    if (header) {
      return (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      );
    }
    
    if (title || subtitle) {
      return (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 leading-6">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderFooter = () => {
    if (footer) {
      return (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      );
    }
    
    return null;
  };

  const renderContent = () => {
    const hasHeaderOrFooter = header || title || subtitle || footer;
    const contentPadding = hasHeaderOrFooter ? 'px-6 py-4' : sizes[size];
    
    return (
      <div className={contentPadding}>
        {children}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${shadowClass}
        ${hoverClass}
        ${clickableClass}
        ${!padding && !header && !title && !subtitle && !footer ? sizes[size] : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
});

Card.displayName = 'Card';

// Composants spécialisés
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', padding = true, ...props }) => (
  <div className={`${padding ? 'px-6 py-4' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`} {...props}>
    {children}
  </div>
);

// Card avec statistiques
export const StatsCard = ({ title, value, change, icon, trend = 'neutral', ...props }) => {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card variant="elevated" shadow="md" hoverable {...props}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;