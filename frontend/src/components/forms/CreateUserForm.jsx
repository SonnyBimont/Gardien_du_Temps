import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Building, Shield, AlertCircle, Eye, EyeOff, Calendar, Clock, X } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';

const CreateUserForm = ({ 
  onSuccess, 
  onCancel, 
  initialData = null,
  defaultRole = null,     
  structureId = null,      
  isDirectorContext = false 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: defaultRole || 'animator', 
    structure_id: structureId || '',
    phone: '',
    contract_type: 'fixed_term', 
    weekly_hours: '35',       
    annual_hours: '1607',     
    contract_start_date: '',  
    contract_end_date: '',    
    active: true,
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3; 

  const { createUser, updateUser, structures, fetchStructures, loading, error, clearError } = useAdminStore();

  const isEditing = !!initialData;

  // Si contexte directeur, forcer les valeurs
  useEffect(() => {
    if (isDirectorContext) {
      setFormData(prev => ({
        ...prev,
        role: 'animator',              
        structure_id: structureId || '' 
      }));
    }
  }, [isDirectorContext, structureId]);

  useEffect(() => {
    if (structures.length === 0) {
      fetchStructures();
    }
  }, [fetchStructures, structures.length]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      if (!formData.first_name.trim()) {
        errors.first_name = 'Le prénom est obligatoire';
      } else if (formData.first_name.length < 2) {
        errors.first_name = 'Le prénom doit contenir au moins 2 caractères';
      }
      
      if (!formData.last_name.trim()) {
        errors.last_name = 'Le nom est obligatoire';
      } else if (formData.last_name.length < 2) {
        errors.last_name = 'Le nom doit contenir au moins 2 caractères';
      }
      
      if (!formData.email.trim()) {
        errors.email = 'L\'email est obligatoire';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'L\'email n\'est pas valide';
      }
      
      if (formData.phone && !/^[\d\s\.\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Le numéro de téléphone n\'est pas valide';
      }
    }

    if (stepNumber === 2) {
      if (!isEditing) {
        if (!formData.password) {
          errors.password = 'Le mot de passe est obligatoire';
        } else if (formData.password.length < 8) {
          errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
        }
        
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Veuillez confirmer le mot de passe';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
      }
      
      if (!formData.structure_id) {
        errors.structure_id = 'Veuillez sélectionner une structure';
      }
    }

    if (stepNumber === 3) {
      if (!formData.contract_type) {
        errors.contract_type = 'Le type de contrat est obligatoire';
      }
      
      if (!formData.weekly_hours || isNaN(formData.weekly_hours) || formData.weekly_hours <= 0) {
        errors.weekly_hours = 'Les heures hebdomadaires doivent être un nombre positif';
      }
      
      if (!formData.annual_hours || isNaN(formData.annual_hours) || formData.annual_hours <= 0) {
        errors.annual_hours = 'Les heures annuelles doivent être un nombre positif';
      }
      
      if (formData.contract_type === 'fixed_term') {
        if (!formData.contract_start_date) {
          errors.contract_start_date = 'La date de début est obligatoire pour un CDD';
        }
        if (!formData.contract_end_date) {
          errors.contract_end_date = 'La date de fin est obligatoire pour un CDD';
        }
        if (formData.contract_start_date && formData.contract_end_date) {
          if (new Date(formData.contract_start_date) >= new Date(formData.contract_end_date)) {
            errors.contract_end_date = 'La date de fin doit être après la date de début';
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    
    // Valider tous les steps
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setStep(i);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const userData = { ...formData };
      
      // Nettoyer les données
      delete userData.confirmPassword;
      
      // Convertir en nombres
      userData.weekly_hours = parseFloat(userData.weekly_hours);
      userData.annual_hours = parseFloat(userData.annual_hours);
      userData.structure_id = parseInt(userData.structure_id);
      
      // Si mode édition et pas de nouveau mot de passe, ne pas l'envoyer
      if (isEditing && !formData.password) {
        delete userData.password;
      }

      const result = isEditing 
        ? await updateUser(initialData.id, userData)
        : await createUser(userData);

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Nettoyer l'erreur spécifique au champ
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
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

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Accès complet au système, gestion des utilisateurs et structures',
      director: 'Gestion de sa structure, des projets et de son équipe',
      animator: 'Pointage, gestion de ses tâches et projets assignés'
    };
    return descriptions[role] || '';
  };

  const getContractTypeDisplayName = (type) => {
    const types = {
      permanent: 'CDI (Contrat à Durée Indéterminée)',
      fixed_term: 'CDD (Contrat à Durée Déterminée)',
      'etc.': 'Autre'
    };
    return types[type] || type;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${step >= stepNumber 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {stepNumber}
          </div>
          {stepNumber < totalSteps && (
            <div className={`
              w-16 h-1 mx-2
              ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
        <p className="text-gray-600">
          {isDirectorContext 
            ? "Saisissez les informations du nouvel animateur"
            : "Saisissez les informations de base de l'utilisateur"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Jean"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.first_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.first_name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Dupont"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.last_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.last_name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="jean.dupont@example.com"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">Cette adresse servira pour la connexion</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="01 23 45 67 89"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formErrors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">Numéro de téléphone (optionnel)</p>
      </div>

      {isEditing && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Compte actif
          </label>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Accès et permissions</h3>
        <p className="text-gray-600">
          {isDirectorContext 
            ? "L'animateur sera rattaché à votre structure"
            : "Définissez le rôle et les accès de l'utilisateur"
          }
        </p>
      </div>

      {!isEditing && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                placeholder="••••••••"
                className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      top: "50%",
      right: "0.75rem",
      transform: "translateY(-50%)",
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

              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Minimum 8 caractères avec majuscule, minuscule et chiffre</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isEditing}
                placeholder="••••••••"
                className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    style={{
      position: "absolute",
      top: "50%",
      right: "0.75rem",
      transform: "translateY(-50%)",
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
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rôle *
        </label>
        {isDirectorContext ? (
          // POUR LE DIRECTEUR : Select désactivé avec seulement "Animateur"
          <select
            name="role"
            value="animator"
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"
          >
            <option value="animator">Animateur</option>
          </select>
        ) : (
          // POUR L'ADMIN : Select normal avec tous les rôles
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.role ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="animator">Animateur</option>
            <option value="director">Directeur</option>
            <option value="admin">Administrateur</option>
          </select>
        )}
        {formErrors.role && (
          <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
        )}
      </div>

      {/* Description du rôle */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-1">
          {getRoleDisplayName(formData.role)}
        </h4>
        <p className="text-sm text-blue-700">
          {isDirectorContext 
            ? "Pointage, gestion de ses tâches et projets assignés"
            : getRoleDescription(formData.role)
          }
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Structure *
        </label>
        {isDirectorContext ? (
          // POUR LE DIRECTEUR : Input désactivé avec le nom de la structure
          <>
            <input
              type="text"
              disabled
              value={structures.find(s => s.id == structureId)?.name || 'Votre structure'}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              L'animateur sera automatiquement rattaché à votre structure
            </p>
          </>
        ) : (
          // POUR L'ADMIN : Select normal avec toutes les structures
          <select
            name="structure_id"
            value={formData.structure_id}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.structure_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Choisir une structure</option>
            {structures.map((structure) => (
              <option key={structure.id} value={structure.id}>
                {structure.name} - {structure.city}
              </option>
            ))}
          </select>
        )}
        {formErrors.structure_id && (
          <p className="mt-1 text-sm text-red-600">{formErrors.structure_id}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Informations contractuelles</h3>
        <p className="text-gray-600">Définissez les conditions de travail</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de contrat *
        </label>
        <select
          name="contract_type"
          value={formData.contract_type}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            formErrors.contract_type ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="permanent">CDI (Contrat à Durée Indéterminée)</option>
          <option value="fixed_term">CDD (Contrat à Durée Déterminée)</option>
          <option value="etc.">Autre</option>
        </select>
        {formErrors.contract_type && (
          <p className="mt-1 text-sm text-red-600">{formErrors.contract_type}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heures hebdomadaires *
          </label>
          <input
            type="number"
            step="0.5"
            min="1"
            max="48"
            name="weekly_hours"
            value={formData.weekly_hours}
            onChange={handleChange}
            required
            placeholder="35"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.weekly_hours ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.weekly_hours && (
            <p className="mt-1 text-sm text-red-600">{formErrors.weekly_hours}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Nombre d'heures par semaine</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heures annuelles *
          </label>
          <input
            type="number"
            step="1"
            min="1"
            name="annual_hours"
            value={formData.annual_hours}
            onChange={handleChange}
            required
            placeholder="1607"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.annual_hours ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.annual_hours && (
            <p className="mt-1 text-sm text-red-600">{formErrors.annual_hours}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Total d'heures par an</p>
        </div>
      </div>

      {formData.contract_type === 'fixed_term' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              name="contract_start_date"
              value={formData.contract_start_date}
              onChange={handleChange}
              required={formData.contract_type === 'fixed_term'}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.contract_start_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.contract_start_date && (
              <p className="mt-1 text-sm text-red-600">{formErrors.contract_start_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <input
              type="date"
              name="contract_end_date"
              value={formData.contract_end_date}
              onChange={handleChange}
              required={formData.contract_type === 'fixed_term'}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.contract_end_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.contract_end_date && (
              <p className="mt-1 text-sm text-red-600">{formErrors.contract_end_date}</p>
            )}
          </div>
        </div>
      )}

      {/* Résumé complet */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          {isDirectorContext ? 'Résumé de l\'animateur' : 'Résumé de l\'utilisateur'}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nom complet:</span>
            <span className="font-medium">{formData.first_name} {formData.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rôle:</span>
            <span className="font-medium">{getRoleDisplayName(formData.role)}</span>
          </div>
          {formData.structure_id && (
            <div className="flex justify-between">
              <span className="text-gray-600">Structure:</span>
              <span className="font-medium">
                {structures.find(s => s.id == formData.structure_id)?.name}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Contrat:</span>
            <span className="font-medium">{getContractTypeDisplayName(formData.contract_type)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Heures:</span>
            <span className="font-medium">{formData.weekly_hours}h/semaine ({formData.annual_hours}h/an)</span>
          </div>
          {formData.contract_type === 'fixed_term' && formData.contract_start_date && formData.contract_end_date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Période:</span>
              <span className="font-medium">
                {new Date(formData.contract_start_date).toLocaleDateString('fr-FR')} → {new Date(formData.contract_end_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header avec bouton X */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isDirectorContext 
              ? 'Créer un nouvel animateur'
              : isEditing 
                ? 'Modifier l\'utilisateur' 
                : 'Créer un nouvel utilisateur'
            }
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          {/* Indicateur d'étapes */}
          {renderStepIndicator()}

          {/* Erreur générale */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Contenu de l'étape */}
          <div className="min-h-96">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-end space-x-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Précédent
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  isDirectorContext 
                    ? 'Créer l\'animateur'
                    : isEditing 
                      ? 'Modifier l\'utilisateur' 
                      : 'Créer l\'utilisateur'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;