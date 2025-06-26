import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Composant de formulaire de connexion
 * 
 * Fonctionnalités :
 * - Validation des champs email/mot de passe
 * - Affichage/masquage du mot de passe
 * - Mémorisation de l'email ("Se souvenir de moi")
 * - Redirection automatique selon le rôle utilisateur
 * - Gestion des erreurs de connexion
 * - Interface responsive avec design moderne
 */
const LoginForm = () => {
  // ===== ÉTAT LOCAL =====
  
  // Données du formulaire (email et mot de passe)
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // Contrôle l'affichage du mot de passe (texte/masqué)
  const [showPassword, setShowPassword] = useState(false);
  
  // Option "Se souvenir de moi" pour sauvegarder l'email
  const [rememberMe, setRememberMe] = useState(false);
  
  // Erreurs de validation côté client (email invalide, mot de passe trop court, etc.)
  const [formErrors, setFormErrors] = useState({});
  
  // ===== HOOKS EXTERNES =====
  
  // Store d'authentification : login, loading, erreurs, statut connexion
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
  
  // Navigation React Router pour les redirections
  const navigate = useNavigate();

  // ===== EFFETS =====
  
  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Chargement de l'email sauvegardé au démarrage
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Auto-nettoyage des erreurs après 5 secondes
  useEffect(() => {
    if (error || Object.keys(formErrors).length > 0) {
      const timer = setTimeout(() => {
        clearError();
        setFormErrors({});
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, formErrors, clearError]);

  // ===== FONCTIONS UTILITAIRES =====
  
  /**
   * Validation côté client du formulaire
   * Vérifie le format email et la longueur du mot de passe
   * @returns {boolean} true si formulaire valide, false sinon
   */
  const validateForm = () => {
    const errors = {};
    
    // Validation email : obligatoire + format valide
    if (!credentials.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation mot de passe : obligatoire + minimum 6 caractères
    if (!credentials.password) {
      errors.password = 'Le mot de passe est obligatoire';
    } else if (credentials.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
  
  /**
   * Soumission du formulaire de connexion
   * 1. Validation côté client
   * 2. Appel à l'API de connexion
   * 3. Gestion du "Se souvenir de moi"
   * 4. Redirection selon le rôle utilisateur
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});
    
    // Validation côté client avant envoi
    if (!validateForm()) {
      return;
    }
    
    try {
      // Tentative de connexion via le store
      const result = await login(credentials);
      
      if (result.success) {
        // Sauvegarde ou suppression de l'email selon le choix utilisateur
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', credentials.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirection basée sur le rôle utilisateur
        const user = result.user;
        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard');      // Tableau de bord administrateur
            break;
          case 'director':
            navigate('/director/dashboard');   // Tableau de bord directeur
            break;
          case 'animator':
            navigate('/animator/dashboard');   // Tableau de bord animateur
            break;
          default:
            navigate('/dashboard');            // Tableau de bord par défaut
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  /**
   * Gestion des changements dans les champs du formulaire
   * Nettoie automatiquement les erreurs quand l'utilisateur tape
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mise à jour de la valeur du champ
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyage de l'erreur spécifique au champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Basculer l'affichage du mot de passe (texte/masqué)
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Soumission du formulaire via la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // ===== RENDU DU COMPOSANT =====
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* En-tête avec logo et titre */}
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
        
        {/* Formulaire principal dans une carte */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Affichage des erreurs générales de connexion */}
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
            
            {/* Champ email avec validation */}
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
            
            {/* Champ mot de passe avec bouton afficher/masquer */}
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
                  className={formErrors.password ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
                />
                {/* Bouton œil pour afficher/masquer le mot de passe */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "0.75rem",
                    transform: "translateY(-8%)",
                    background: "none",
                    border: 0,
                    padding: 0,
                    margin: 0,
                    color: "#9ca3af",
                    cursor: "pointer",
                    height: "2rem",
                    width: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Options : Se souvenir de moi + Mot de passe oublié */}
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
            
            {/* Bouton de connexion avec état de chargement */}
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
          
          {/* Mentions légales */}
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
        
        {/* Comptes de démonstration (affiché uniquement en développement) */}
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