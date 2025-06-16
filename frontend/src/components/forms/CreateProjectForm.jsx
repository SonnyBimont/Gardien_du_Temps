import React, { useState, useEffect } from 'react';
import { Calendar, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAdminStore } from '../../stores/adminStore';
import { useAuthStore } from '../../stores/authStore';
import Input, { TextArea, Select } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateProjectForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    priority: 'medium',
    assigned_to: '',
    budget: '',
    location: '',
    tags: '',
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const { createProject, updateProject, loading, error, clearError } = useProjectStore();
  const { users, fetchUsers } = useAdminStore();

  const isEditing = !!initialData;

  useEffect(() => {
    fetchUsers();
  }, []);

  // Nettoyer les erreurs quand l'utilisateur tape
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
        errors.name = 'Le nom du projet est obligatoire';
      }
      if (!formData.description.trim()) {
        errors.description = 'La description est obligatoire';
      }
      if (formData.description.length < 10) {
        errors.description = 'La description doit contenir au moins 10 caractères';
      }
    }

    if (stepNumber === 2) {
      if (!formData.start_date) {
        errors.start_date = 'La date de début est obligatoire';
      }
      if (!formData.end_date) {
        errors.end_date = 'La date de fin est obligatoire';
      }
      if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
        errors.end_date = 'La date de fin doit être postérieure à la date de début';
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
      const projectData = {
        ...formData,
        created_by: user?.id,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const result = isEditing 
        ? await updateProject(initialData.id, projectData)
        : await createProject(projectData);

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
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
        <p className="text-gray-600">Définissez les bases de votre projet</p>
      </div>

      <Input
        label="Nom du projet"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Ex: Animation été 2024"
        error={formErrors.name}
        hint="Choisissez un nom clair et descriptif"
      />

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        rows={4}
        placeholder="Décrivez les objectifs et le contenu du projet..."
        error={formErrors.description}
        hint="Minimum 10 caractères"
      />

      <Input
        label="Lieu"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Ex: Centre de loisirs, Parc municipal..."
        hint="Optionnel"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Planning et priorité</h3>
        <p className="text-gray-600">Définissez les dates et l'importance du projet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date de début"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          required
          error={formErrors.start_date}
        />

        <Input
          label="Date de fin"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          required
          error={formErrors.end_date}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Statut"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="planned">Planifié</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </Select>

        <Select
          label="Priorité"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
        >
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </Select>
      </div>

      <Input
        label="Budget (optionnel)"
        name="budget"
        type="number"
        value={formData.budget}
        onChange={handleChange}
        placeholder="0"
        hint="Budget alloué au projet en euros"
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Attribution et finalisation</h3>
        <p className="text-gray-600">Assignez le projet et ajoutez les détails finaux</p>
      </div>

      <Select
        label="Assigné à"
        name="assigned_to"
        value={formData.assigned_to}
        onChange={handleChange}
        placeholder="Sélectionner un responsable"
        hint="Optionnel - peut être assigné plus tard"
      >
        <option value="">Aucun responsable pour le moment</option>
        {users
          .filter(u => u.role !== 'admin')
          .map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} ({user.role === 'director' ? 'Directeur' : 'Animateur'})
            </option>
          ))}
      </Select>

      <Input
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="sport, enfants, été..."
        hint="Séparez les tags par des virgules"
      />

      {/* Résumé */}
      <Card variant="info" className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Résumé du projet</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nom:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Période:</span>
            <span className="font-medium">
              {formData.start_date} → {formData.end_date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Priorité:</span>
            <span className={`font-medium ${
              formData.priority === 'urgent' ? 'text-red-600' :
              formData.priority === 'high' ? 'text-orange-600' :
              formData.priority === 'medium' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {formData.priority === 'low' && 'Basse'}
              {formData.priority === 'medium' && 'Moyenne'}
              {formData.priority === 'high' && 'Haute'}
              {formData.priority === 'urgent' && 'Urgente'}
            </span>
          </div>
          {formData.assigned_to && (
            <div className="flex justify-between">
              <span className="text-gray-600">Responsable:</span>
              <span className="font-medium">
                {users.find(u => u.id == formData.assigned_to)?.first_name}{' '}
                {users.find(u => u.id == formData.assigned_to)?.last_name}
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
      case 3: return renderStep3();
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
              {isEditing ? 'Modifier le projet' : 'Créer le projet'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateProjectForm;