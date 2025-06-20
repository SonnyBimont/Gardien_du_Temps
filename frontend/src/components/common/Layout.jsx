import React, { useState, useEffect } from 'react';
import { LogOut, User, Clock, Menu, X, Bell, Settings, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Button from './Button';
import Card from './Card';
import QuickTimeTrackingIcons from './QuickTimeTrackingIcons';


const Layout = ({ children, title, sidebar, breadcrumbs, actions }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrateur',
      director: 'Directeur',
      animator: 'Animateur'
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      director: 'bg-blue-100 text-blue-800',
      animator: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href)}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderUserMenu = () => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setUserMenuOpen(!userMenuOpen);
        }}
        className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="font-medium">{user?.first_name} {user?.last_name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </div>
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 mt-2 min-w-[1000px] max-w-[98vw] w-full sm:w-800 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
              {getRoleDisplayName(user?.role)}
            </span>
          </div>
          
          <button
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/profile');
            }}
            className="block w-full text-left px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 border-0 rounded-none flex items-center justify-start"
          >
            <User className="w-5 h-5 mr-5 flex-shrink-0" />
            Mon profil
          </button>
          
          <button
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/settings');
            }}
            className="block w-full text-left px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 border-0 rounded-none flex items-center justify-start"
          >
            <Settings className="w-5 h-5 mr-5 flex-shrink-0" />
            Paramètres
          </button>
          
            <button
              onClick={() => {
                setUserMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-5 py-2 text-sm text-red-700 hover:bg-red-50 border-0 rounded-none flex items-center justify-start"
            >
              <LogOut className="w-5 h-5 mr-5 flex-shrink-0" />
              <span className="truncate">
              Déconnexion
              </span>
            </button>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
      <Bell className="w-5 h-5" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </button>
  );

  const renderMobileMenu = () => (
    <div className="md:hidden">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              {renderMobileMenu()}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gardien du Temps
                </h1>
              </button>
                            {user && (
                <div className="ml-8">
                  <QuickTimeTrackingIcons />
                </div>
              )}
            </div>
            
            {/* Actions du header */}
            <div className="flex items-center space-x-2">
              {actions && (
                <div className="hidden md:flex items-center space-x-2 mr-4">
                  {actions}
                </div>
              )}
              
              {renderNotifications()}
              {renderUserMenu()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Overlay mobile */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar content */}
            <aside className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              md:relative md:translate-x-0 md:inset-auto md:z-auto
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <div className="h-full overflow-y-auto pt-16 md:pt-0">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Titre et breadcrumbs */}
            {(title || breadcrumbs) && (
              <div className="mb-6">
                {renderBreadcrumbs()}
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
              </div>
            )}
            
            {/* Contenu principal */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Composant pour le contenu de la sidebar
export const SidebarContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// Composant pour les éléments de navigation
export const NavItem = ({ 
  icon, 
  label, 
  href, 
  active = false, 
  onClick, 
  children,
  badge
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
          {badge}
        </span>
      )}
      {children}
    </button>
  );
};

export default Layout;