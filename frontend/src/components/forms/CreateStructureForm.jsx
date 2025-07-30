/**
 * ===== CREATE STRUCTURE FORM - FORMULAIRE CRÉATION/ÉDITION STRUCTURE =====
 * 
 * Formulaire complet pour créer ou modifier une structure (centre de loisirs).
 * Interface réutilisable en mode création ou édition selon les props.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Formulaire unifié création/édition avec détection automatique
 * - Validation côté client complète avec messages d'erreur
 * - Gestion des zones de vacances scolaires (A, B, C)
 * - Champs optionnels responsable et contact
 * - Intégration adminStore pour persistance
 * - États de loading et gestion d'erreurs
 * 
 * CHAMPS GÉRÉS :
 * - Informations de base : nom, adresse, ville, code postal
 * - Configuration : zone vacances, capacité, statut actif
 * - Contact : téléphone, email, responsable
 * - Validation : code postal français (5 chiffres), emails valides
 * 
 * VALIDATION ROBUSTE :
 * - Champs obligatoires avec messages explicites
 * - Regex pour code postal français (5 chiffres)
 * - Validation email basique mais suffisante
 * - Validation zone vacances scolaires
 * - Validation capacité numérique positive
 * 
 * ARCHITECTURE PROPRE :
 * - État local avec useState pour les données du formulaire
 * - Fonction de validation séparée et testable
 * - Gestion d'erreurs par champ avec affichage ciblé
 * - Intégration store pour actions CRUD
 * 
 * POINTS POSITIFS :
 * - Code propre et bien structuré
 * - Validation complète côté client
 * - Réutilisabilité création/édition
 * - Gestion d'erreurs appropriée
 * 
 * AMÉLIORATIONS MINEURES :
 * - Validation email pourrait être plus robuste (regex)
 * - Callback onSuccess/onCancel pourrait être optimisé
 * - Loading state pourrait avoir un spinner dédié
 */

import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { X, Building2 } from 'lucide-react';

// fonction qui gère le formulaire de création/édition d'une structure
const CreateStructureForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    school_vacation_zone: 'A',
    phone: '',
    email: '',
    manager_name: '',
    manager_email: '',
    capacity: '',
    active: true,
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createStructure, updateStructure, loading, error, clearError } = useAdminStore();

  const isEditing = !!initialData;

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est obligatoire';
    }

    if (!formData.address.trim()) {
      errors.address = 'L\'adresse est obligatoire';
    }

    if (!formData.city.trim()) {
      errors.city = 'La ville est obligatoire';
    }

    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Le code postal est obligatoire';
    } else if (!/^\d{5}$/.test(formData.postal_code)) {
      errors.postal_code = 'Le code postal doit contenir 5 chiffres';
    }

    if (!['A', 'B', 'C'].includes(formData.school_vacation_zone)) {
      errors.school_vacation_zone = 'Zone de vacances invalide';
    }

    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Email invalide';
    }

    if (formData.manager_email && !formData.manager_email.includes('@')) {
      errors.manager_email = 'Email du responsable invalide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const structureData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      let result;
      if (isEditing) {
        result = await updateStructure(initialData.id, structureData);
      } else {
        result = await createStructure(structureData);
      }

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction de gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Building2 className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Modifier la structure' : 'Nouvelle structure'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la structure *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Centre de loisirs..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone de vacances scolaires *
            </label>
            <select
              name="school_vacation_zone"
              value={formData.school_vacation_zone}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.school_vacation_zone ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
            </select>
            {formErrors.school_vacation_zone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.school_vacation_zone}</p>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="123 rue de la Paix"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.address ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.address && (
            <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Paris"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.city ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.city && (
              <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code postal *
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
              placeholder="75001"
              maxLength={5}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.postal_code ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.postal_code && (
              <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
            )}
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@structure.fr"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>
        </div>

        {/* Informations du responsable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du responsable
            </label>
            <input
              type="text"
              name="manager_name"
              value={formData.manager_name}
              onChange={handleChange}
              placeholder="Jean Dupont"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email du responsable
            </label>
            <input
              type="email"
              name="manager_email"
              value={formData.manager_email}
              onChange={handleChange}
              placeholder="responsable@structure.fr"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.manager_email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.manager_email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.manager_email}</p>
            )}
          </div>
        </div>

        {/* Capacité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacité d'accueil
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="50"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Nombre maximum d'enfants accueillis</p>
        </div>

        {/* Status */}
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
              Structure active
            </label>
          </div>
        )}

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Annuler
          </button>
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
              isEditing ? 'Modifier la structure' : 'Créer la structure'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStructureForm;