import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Charger les données sauvegardées
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Nettoyer les erreurs quand l'utilisateur tape
  useEffect(() => {
    if (error || Object.keys(formErrors).length > 0) {
      const timer = setTimeout(() => {
        clearError();
        setFormErrors({});
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, formErrors, clearError]);

  const validateForm = () => {
    const errors = {};
    
    // Validation email
    if (!credentials.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation mot de passe
    if (!credentials.password) {
      errors.password = 'Le mot de passe est obligatoire';
    } else if (credentials.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});
    
    // Validation côté client
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Gérer le "Se souvenir de moi"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', credentials.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirection basée sur le rôle
        const user = result.user;
        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'director':
            navigate('/director/dashboard');
            break;
          case 'animator':
            navigate('/animator/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer l'erreur spécifique au champ
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Gardien du Temps
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre espace de travail
          </p>
        </div>
        
        {/* Formulaire de connexion */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Erreur générale */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Champ Email */}
            <div>
              <Input
                label="Adresse email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
                placeholder="votre@email.com"
                error={formErrors.email}
                disabled={loading}
                autoComplete="email"
                className={formErrors.email ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            
            {/* Champ Mot de passe */}
            <div>
              <div className="relative">
                <Input
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  required
                  placeholder="Votre mot de passe"
                  error={formErrors.password}
                  disabled={loading}
                  autoComplete="current-password"
                  className={formErrors.password ? 'border-red-300 focus:border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-6"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
                  disabled={loading}
                  onClick={() => {
                    // TODO: Implémenter la récupération de mot de passe
                    alert('Fonctionnalité à venir');
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
            
            {/* Bouton de connexion */}
            <Button
              type="submit"
              disabled={loading || !credentials.email || !credentials.password}
              className="w-full flex justify-center items-center"
              variant="primary"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          {/* Informations supplémentaires */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                En vous connectant, vous acceptez nos{' '}
                <button className="text-blue-600 hover:text-blue-500 underline">
                  conditions d'utilisation
                </button>
                {' '}et notre{' '}
                <button className="text-blue-600 hover:text-blue-500 underline">
                  politique de confidentialité
                </button>
              </p>
            </div>
          </div>
        </Card>
        
        {/* Informations de démonstration */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Comptes de démonstration
            </h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Admin:</strong> admin@gardien-temps.com / password123</p>
              <p><strong>Directeur:</strong> directeur@gardien-temps.com / password123</p>
              <p><strong>Animateur:</strong> animateur1@gardien-temps.com / password123</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoginForm;