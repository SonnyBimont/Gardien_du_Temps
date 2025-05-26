// src/components/forms/CreateUserForm.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Building, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import Input, { Select } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateUserForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'animator',
    structure_id: '',
    phone: '',
    is_active: true,
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const totalSteps = 2;

  const { createUser, updateUser, structures, fetchStructures, loading, error, clearError } = useAdminStore();

  const isEditing = !!initialData;

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  // Nettoyer les erreurs
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
      }
      if (formData.first_name.length < 2) {
        errors.first_name = 'Le prénom doit contenir au moins 2 caractères';
      }
      if (!formData.last_name.trim()) {
        errors.last_name = 'Le nom est obligatoire';
      }
      if (formData.last_name.length < 2) {
        errors.last_name = 'Le nom doit contenir au moins 2 caractères';
      }
      if (!formData.email.trim()) {
        errors.email = 'L\'email est obligatoire';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
        }
        if (formData.password.length < 8) {
          errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
        }
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Veuillez confirmer le mot de passe';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
      }
      if (!formData.structure_id) {
        errors.structure_id = 'Veuillez sélectionner une structure';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Valider tous les steps
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }

    try {
      const userData = { ...formData };
      
      // Ne pas envoyer confirmPassword
      delete userData.confirmPassword;
      
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2].map((stepNumber) => (
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
        <p className="text-gray-600">Saisissez les informations de base de l'utilisateur</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Prénom"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          placeholder="Jean"
          error={formErrors.first_name}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Nom"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
          placeholder="Dupont"
          error={formErrors.last_name}
        />
      </div>

      <Input
        label="Adresse email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="jean.dupont@example.com"
        error={formErrors.email}
        hint="Cette adresse servira pour la connexion"
        leftIcon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Téléphone"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="01 23 45 67 89"
        error={formErrors.phone}
        hint="Numéro de téléphone (optionnel)"
      />

      {isEditing && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
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
        <p className="text-gray-600">Définissez le rôle et les accès de l'utilisateur</p>
      </div>

      {!isEditing && (
        <>
          <Input
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            placeholder="••••••••"
            error={formErrors.password}
            hint="Minimum 8 caractères avec majuscule, minuscule et chiffre"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEditing}
            placeholder="••••••••"
            error={formErrors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </>
      )}

      <Select
        label="Rôle"
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        error={formErrors.role}
      >
        <option value="animator">Animateur</option>
        <option value="director">Directeur</option>
        <option value="admin">Administrateur</option>
      </Select>

      {/* Description du rôle */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-1">
          {getRoleDisplayName(formData.role)}
        </h4>
        <p className="text-sm text-blue-700">
          {getRoleDescription(formData.role)}
        </p>
      </div>

      <Select
        label="Structure"
        name="structure_id"
        value={formData.structure_id}
        onChange={handleChange}
        required
        error={formErrors.structure_id}
        placeholder="Sélectionner une structure"
        leftIcon={<Building className="w-4 h-4" />}
      >
        <option value="">Choisir une structure</option>
        {structures.map((structure) => (
          <option key={structure.id} value={structure.id}>
            {structure.name} - {structure.city}
          </option>
        ))}
      </Select>

      {/* Résumé */}
      <Card variant="info" className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Résumé de l'utilisateur</h4>
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
        </div>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      default: return renderStep1();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
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
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
            >
              Précédent
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || onSuccess}
          >
            Annuler
          </Button>
          
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              loadingText={isEditing ? 'Modification...' : 'Création...'}
            >
              {isEditing ? 'Modifier l\'utilisateur' : 'Créer l\'utilisateur'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateUserForm;