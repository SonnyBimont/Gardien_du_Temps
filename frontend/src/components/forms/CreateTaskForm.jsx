import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAdminStore } from '../../stores/adminStore';
import Input, { TextArea, Select } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateTaskForm = ({ onSuccess, onCancel, initialData = null, projectId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    estimated_hours: '',
    project_id: projectId || '',
    assigned_to: '',
    ...initialData
  });

  const [formErrors, setFormErrors] = useState({});
  
  const { 
    createTask, 
    updateTask, 
    projects, 
    fetchProjects, 
    loading, 
    error, 
    clearError 
  } = useProjectStore();
  
  const { 
    users, 
    fetchUsers 
  } = useAdminStore();

  const isEditing = !!initialData;

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Fonction de validation manquante
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Le titre est obligatoire';
    }
    if (formData.title.length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères';
    }
    if (!formData.project_id && !projectId) {
      errors.project_id = 'Veuillez sélectionner un projet';
    }
    if (formData.estimated_hours && (isNaN(formData.estimated_hours) || formData.estimated_hours < 0)) {
      errors.estimated_hours = 'Les heures doivent être un nombre positif';
    }
    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      errors.due_date = 'La date d\'échéance ne peut pas être dans le passé';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;

    try {
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        project_id: formData.project_id || projectId
      };

      const result = isEditing 
        ? await updateTask(initialData.id, taskData)
        : await createTask(taskData);

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

    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <Card 
        title={isEditing ? "Modifier la tâche" : "Nouvelle tâche"}
        className="space-y-4"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <Input
          label="Titre de la tâche"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Ex: Préparer l'activité peinture"
          error={formErrors.title}
          leftIcon={<CheckSquare className="w-4 h-4" />}
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Détaillez la tâche à accomplir..."
          hint="Description optionnelle"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Select
            label="Statut"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">En révision</option>
            <option value="done">Terminé</option>
          </Select>
        </div>

        {!projectId && (
          <Select
            label="Projet"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            error={formErrors.project_id}
            placeholder="Sélectionner un projet"
          >
            <option value="">Choisir un projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date d'échéance"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            error={formErrors.due_date}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Heures estimées"
            name="estimated_hours"
            type="number"
            step="0.5"
            min="0"
            value={formData.estimated_hours}
            onChange={handleChange}
            placeholder="Ex: 2.5"
            error={formErrors.estimated_hours}
            hint="Estimation en heures"
            leftIcon={<Clock className="w-4 h-4" />}
          />
        </div>

        <Select
          label="Assigné à"
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
          placeholder="Choisir un utilisateur"
          leftIcon={<User className="w-4 h-4" />}
        >
          <option value="">Non assigné</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </Select>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || onSuccess}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingText={isEditing ? 'Modification...' : 'Création...'}
          >
            {isEditing ? 'Modifier la tâche' : 'Créer la tâche'}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default CreateTaskForm;