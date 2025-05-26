// src/components/forms/CreateStructureForm.jsx
import React, { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import Input, { TextArea, Select } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateStructureForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'centre_loisirs',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    description: '',
    capacity: '',
    website: '',
    contact_person: '',
    opening_hours: '',
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const { createStructure, updateStructure, loading, error, clearError } = useAdminStore();

  const isEditing = !!initialData;

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
      if (!formData.name.trim()) {
        errors.name = 'Le nom de la structure est obligatoire';
      }
      if (formData.name.length < 3) {
        errors.name = 'Le nom doit contenir au moins 3 caractères';
      }
      if (!formData.address.trim()) {
        errors.address = 'L\'adresse est obligatoire';
      }
      if (!formData.city.trim()) {
        errors.city = 'La ville est obligatoire';
      }
      if (!formData.postal_code.trim()) {
        errors.postal_code = 'Le code postal est obligatoire';
      }
      if (!/^\d{5}$/.test(formData.postal_code)) {
        errors.postal_code = 'Le code postal doit contenir 5 chiffres';
      }
    }

    if (stepNumber === 2) {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'L\'email n\'est pas valide';
      }
      if (formData.phone && !/^[\d\s\.\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Le numéro de téléphone n\'est pas valide';
      }
      if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
        errors.website = 'L\'URL du site web doit commencer par http:// ou https://';
      }
      if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 1)) {
        errors.capacity = 'La capacité doit être un nombre positif';
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
      const structureData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      const result = isEditing 
        ? await updateStructure(initialData.id, structureData)
        : await createStructure(structureData);

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
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
        <Building className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
        <p className="text-gray-600">Définissez les informations de base de la structure</p>
      </div>

      <Input
        label="Nom de la structure"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Ex: Centre de loisirs Municipal"
        error={formErrors.name}
        hint="Nom officiel de la structure"
        leftIcon={<Building className="w-4 h-4" />}
      />

      <Select
        label="Type de structure"
        name="type"
        value={formData.type}
        onChange={handleChange}
        required
      >
        <option value="centre_loisirs">Centre de loisirs</option>
        <option value="ecole">École</option>
        <option value="creche">Crèche</option>
        <option value="association">Association</option>
        <option value="mairie">Mairie</option>
        <option value="autre">Autre</option>
      </Select>

      <Input
        label="Adresse"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        placeholder="123 rue de la République"
        error={formErrors.address}
        leftIcon={<MapPin className="w-4 h-4" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ville"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Paris"
          error={formErrors.city}
        />

        <Input
          label="Code postal"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          required
          placeholder="75001"
          error={formErrors.postal_code}
          hint="5 chiffres"
        />
      </div>

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
        placeholder="Décrivez brièvement la structure, ses activités..."
        hint="Optionnel"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Phone className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Contact et détails</h3>
        <p className="text-gray-600">Ajoutez les informations de contact et détails pratiques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Téléphone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="01 23 45 67 89"
          error={formErrors.phone}
          hint="Numéro principal de la structure"
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contact@structure.fr"
          error={formErrors.email}
          hint="Email de contact principal"
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <Input
        label="Site web"
        name="website"
        type="url"
        value={formData.website}
        onChange={handleChange}
        placeholder="https://www.structure.fr"
        error={formErrors.website}
        hint="Site web de la structure (optionnel)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Personne de contact"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
          placeholder="Jean Dupont"
          hint="Responsable principal (optionnel)"
        />

        <Input
          label="Capacité d'accueil"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="50"
          error={formErrors.capacity}
          hint="Nombre maximum de personnes"
        />
      </div>

      <Input
        label="Horaires d'ouverture"
        name="opening_hours"
        value={formData.opening_hours}
        onChange={handleChange}
        placeholder="Lun-Ven: 8h-18h"
        hint="Horaires habituels (optionnel)"
      />

      {/* Résumé */}
      <Card variant="info" className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Résumé de la structure</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nom:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">
              {formData.type === 'centre_loisirs' && 'Centre de loisirs'}
              {formData.type === 'ecole' && 'École'}
              {formData.type === 'creche' && 'Crèche'}
              {formData.type === 'association' && 'Association'}
              {formData.type === 'mairie' && 'Mairie'}
              {formData.type === 'autre' && 'Autre'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Adresse:</span>
            <span className="font-medium text-right">
              {formData.address}<br />
              {formData.postal_code} {formData.city}
            </span>
          </div>
          {formData.phone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
          )}
          {formData.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{formData.email}</span>
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
              {isEditing ? 'Modifier la structure' : 'Créer la structure'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateStructureForm;