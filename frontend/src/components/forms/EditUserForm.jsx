import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { Eye, EyeOff, User, Save, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const EditUserForm = ({ 
    user, 
    onClose, 
    onUserUpdated,  
    isDirectorContext = false,
    fixedRole = null,
    fixedStructureId = null }) => {
  const { structures, updateUser, loading } = useAdminStore();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '', // Optionnel pour modification
    role: '',
    structure_id: '',
    phone: '',
    contract_type: '',
    weekly_hours: '',
    annual_hours: '',
    contract_start_date: '',
    contract_end_date: '',
    active: true
  });
    
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Pré-remplir le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: fixedRole || user.role || '',
        structure_id: fixedStructureId || user.structure_id || '',
        weekly_hours: user.weekly_hours || '',
        annual_hours: user.annual_hours || '',
        contract_type: user.contract_type || '',
        contract_start_date: user.contract_start_date ? user.contract_start_date.split('T')[0] : '',
      contract_end_date: user.contract_end_date ? user.contract_end_date.split('T')[0] : '',
        active: user.active !== undefined ? user.active : true
      });
    }
  }, [user, fixedRole, fixedStructureId]);
    
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Nettoyer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name?.trim()) {
      errors.first_name = 'Le prénom est obligatoire';
    }

    if (!formData.last_name?.trim()) {
      errors.last_name = 'Le nom est obligatoire';
    }

    if (!formData.email?.trim()) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Mot de passe optionnel en modification
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.role) {
      errors.role = 'Le rôle est obligatoire';
    }

    if (!formData.structure_id) {
      errors.structure_id = 'La structure est obligatoire';
    }

    if (!formData.contract_type) {
      errors.contract_type = 'Le type de contrat est obligatoire';
    }

    if (!formData.weekly_hours || formData.weekly_hours <= 0) {
      errors.weekly_hours = 'Les heures hebdomadaires sont obligatoires';
    }

    if (!formData.annual_hours || formData.annual_hours <= 0) {
      errors.annual_hours = 'Les heures annuelles sont obligatoires';
    }

  if (formData.contract_start_date && formData.contract_end_date) {
    const startDate = new Date(formData.contract_start_date);
    const endDate = new Date(formData.contract_end_date);
    
    if (endDate <= startDate) {
      errors.contract_end_date = 'La date de fin doit être postérieure à la date de début';
    }
  }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  try {
    console.log('🔧 Données avant modification:', formData);
    console.log('👤 User ID:', user.id);

    // Préparer les données à envoyer
    const updateData = { ...formData };
    
    // Si contexte directeur, appliquer les contraintes
    if (isDirectorContext) {
      if (fixedRole) {
        updateData.role = fixedRole;
      }
      if (fixedStructureId) {
        updateData.structure_id = fixedStructureId;
      }
    }

    // Ne pas envoyer le mot de passe s'il est vide
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }

    // Convertir les types et nettoyer les données
    updateData.structure_id = parseInt(updateData.structure_id);
    updateData.weekly_hours = parseFloat(updateData.weekly_hours);
    updateData.annual_hours = parseFloat(updateData.annual_hours);

    // Nettoyer les dates vides
    if (!updateData.contract_start_date) {
      delete updateData.contract_start_date;
    }
    if (!updateData.contract_end_date) {
      delete updateData.contract_end_date;
    }

    console.log('📤 Données envoyées:', updateData);

    const result = await updateUser(user.id, updateData);
    
    console.log('✅ Résultat:', result);
    
    if (result && result.success === true) {
      onUserUpdated?.();
      onClose?.();
    } else {
      console.error('❌ Erreur dans la réponse:', result);
      // ✅ AMÉLIORATION: Message d'erreur plus détaillé
      setFormErrors({ 
        general: `Impossible de modifier l'utilisateur. ${result?.error || result?.message || 'Erreur serveur 500 - Contactez l\'administrateur.'}`
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la modification:', error);
    console.error('❌ Détails de l\'erreur:', error.response?.data);
    
    // Messages d'erreur plus clairs
    let errorMessage = 'Erreur serveur lors de la modification.';
    
    if (error.response?.status === 500) {
      errorMessage = 'Erreur interne du serveur (500). Veuillez contacter l\'administrateur technique.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Utilisateur non trouvé.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions pour modifier cet utilisateur.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    setFormErrors({ 
      general: errorMessage
    });
  }
};

  return (
  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
    {/* En-tête simple */}
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Informations de l'utilisateur
      </h2>
      <p className="text-gray-600">
        Modifiez les informations ci-dessous
      </p>
    </div>

  {/* Affichage des erreurs générales */}
  {formErrors.general && (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-600">{formErrors.general}</p>
        </div>
      </div>
    </div>
  )}
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={formErrors.first_name}
              disabled={loading}
            />

            <Input
              label="Nom"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={formErrors.last_name}
              disabled={loading}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={formErrors.email}
            disabled={loading}
          />

          {/* Mot de passe - MÊME STYLE que CreateUserForm */}
          <div className="relative">
            <Input
              label="Nouveau mot de passe (optionnel)"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.password}
              disabled={loading}
              className={formErrors.password ? 'border-red-300 focus:border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "50%",
                right: "0.75rem",
                transform: "translateY(-5%)",
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

  {/* Rôle */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Rôle <span className="text-red-500">*</span>
    </label>
    {isDirectorContext && fixedRole ? (
      // Affichage en lecture seule pour les directeurs
      <div className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500">
        Animateur (non modifiable)
      </div>
    ) : (
      // Sélection normale pour les admins
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        disabled={loading}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          formErrors.role ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">Sélectionner un rôle</option>
        <option value="admin">Administrateur</option>
        <option value="director">Directeur</option>
        <option value="animator">Animateur</option>
      </select>
    )}
  </div>

  {/* Structure */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Structure <span className="text-red-500">*</span>
    </label>
    {isDirectorContext && fixedStructureId ? (
      // Affichage en lecture seule pour les directeurs
      <div className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500">
        {structures.find(s => s.id === fixedStructureId)?.name || 'Structure non trouvée'}
      </div>
    ) : (
      // Sélection normale pour les admins
      <select
        name="structure_id"
        value={formData.structure_id}
        onChange={handleChange}
        required
        disabled={loading}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          formErrors.structure_id ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">Sélectionner une structure</option>
        {structures.map(structure => (
          <option key={structure.id} value={structure.id}>
            {structure.name}
          </option>
        ))}
      </select>
    )}
  </div>

          {/* Téléphone */}
          <Input
            label="Téléphone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={formErrors.phone}
            disabled={loading}
          />

          {/* Contrat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                required
                disabled={loading}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.contract_type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner</option>
                <option value="permanent">CDI (Contrat à Durée Indéterminée)</option>
                <option value="fixed_term">CDD (Contrat à Durée Déterminée)</option>
                <option value="etc.">Autre (Stage, Freelance, etc.)</option>
              </select>
              {formErrors.contract_type && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contract_type}</p>
              )}
            </div>

            <Input
              label="Heures hebdomadaires"
              name="weekly_hours"
              type="number"
              min="1"
              max="60"
              step="0.5"
              value={formData.weekly_hours}
              onChange={handleChange}
              required
              error={formErrors.weekly_hours}
              disabled={loading}
            />

            <Input
              label="Heures annuelles"
              name="annual_hours"
              type="number"
              min="1"
              max="3000"
              value={formData.annual_hours}
              onChange={handleChange}
              required
              error={formErrors.annual_hours}
              disabled={loading}
            />
          </div>

          {/* Dates de contrat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date de début de contrat"
              name="contract_start_date"
              type="date"
              value={formData.contract_start_date}
              onChange={handleChange}
              error={formErrors.contract_start_date}
              disabled={loading}
            />

            <Input
              label="Date de fin de contrat"
              name="contract_end_date"
              type="date"
              value={formData.contract_end_date}
              onChange={handleChange}
              error={formErrors.contract_end_date}
              disabled={loading}
            />
          </div>

          {/* Statut actif */}
          <div className="flex items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Utilisateur actif
            </label>
          </div>

    {/* Boutons d'action */}
    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        Annuler
      </Button>

      <Button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center w-full sm:w-auto"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Modification...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Modifier l'utilisateur
          </>
        )}
      </Button>
    </div>
  </form>
);
}
export default EditUserForm;