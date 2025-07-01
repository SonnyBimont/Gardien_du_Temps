// CORRIGER PlanningModal.jsx - Réparer l'erreur d'overrideMethod
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const PlanningModal = ({ isOpen, onClose, selectedDate, existingPlanning, projects, onSave }) => {
  const [formData, setFormData] = useState({
    planned_hours: '',
    project_id: '',
    description: '',
    color: '#3B82F6'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialiser les données quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        planned_hours: existingPlanning?.planned_hours || '',
        project_id: existingPlanning?.project_id || '',
        description: existingPlanning?.description || '',
        color: existingPlanning?.color || '#3B82F6'
      });
      setErrors({});
    }
  }, [isOpen, existingPlanning]);

  // Valider le formulaire avant la soumission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.planned_hours || formData.planned_hours <= 0) {
      newErrors.planned_hours = 'Veuillez saisir un nombre d\'heures valide';
    }
    
    if (parseFloat(formData.planned_hours) > 24) {
      newErrors.planned_hours = 'Le nombre d\'heures ne peut pas dépasser 24h';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simplifier la gestion d'erreur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('📝 Données du formulaire:', formData);
      
      const dataToSave = {
        planned_hours: parseFloat(formData.planned_hours),
        project_id: formData.project_id ? parseInt(formData.project_id, 10) : null,
        description: formData.description?.trim() || '',
        color: formData.color
      };
      
      console.log('📤 Données à sauvegarder:', dataToSave);
      
      const result = await onSave(dataToSave);
      
      console.log('✅ Résultat:', result);
      
      if (result?.success) {
        console.log('🎉 Sauvegarde réussie');
        
        // ✅ AJOUTER : Nettoyage forcé après succès
        setTimeout(() => {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.classList.remove('modal-open');
        }, 200);
        
        // La modal se ferme automatiquement via onSave
      } else {
        const errorMessage = result?.error || 'Erreur lors de la sauvegarde';
        console.error('❌ Erreur serveur:', errorMessage);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('💥 Erreur catch:', error);
      setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la suppression avec confirmation
  const handleDelete = async () => {
    if (!existingPlanning) return;
    
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette planification ?');
    if (!confirmDelete) return;
    
    setLoading(true);
    
    try {
      // Envoyer 0 heures pour déclencher la suppression
      const result = await onSave({
        planned_hours: 0,  // suppression côté serveur
        project_id: null,
        description: '',
        color: '#3B82F6'
      });
      
      if (result?.success) {
        console.log('🗑️ Suppression réussie');
        
        // Nettoyage forcé après suppression réussie
        setTimeout(() => {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.classList.remove('modal-open');
          
          // Supprimer tous les overlays orphelins
          const overlays = document.querySelectorAll('[class*="bg-gray-900"][class*="bg-opacity"]');
          overlays.forEach(overlay => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          });
        }, 100);
        
        // La modal se ferme automatiquement via onSave
      } else {
        setErrors({ general: result?.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      setErrors({ general: 'Erreur lors de la suppression' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction de fermeture propre
  const handleClose = () => {
    setFormData({
      planned_hours: '',
      project_id: '',
      description: '',
      color: '#3B82F6'
    });
    setErrors({});
    
    // Force le nettoyage du body
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('modal-open');
      
      // Supprimer tous les overlays orphelins
      const overlays = document.querySelectorAll('[class*="bg-gray-900"][class*="bg-opacity"]');
      overlays.forEach(overlay => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
    }, 50);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Planifier - ${selectedDate?.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      })}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreur générale */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* En-tête informatif */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Planification du jour
          </h4>
          <p className="text-sm text-blue-800">
            Combien d'heures prévoyez-vous de travailler le{' '}
            <strong>{selectedDate?.toLocaleDateString('fr-FR')}</strong> ?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Heures planifiées *"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.planned_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, planned_hours: e.target.value }))}
              required
              placeholder="ex: 7.5"
              error={errors.planned_hours}
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur d'affichage
            </label>
            <div className="flex space-x-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    formData.color === color 
                      ? 'border-gray-800 scale-110 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  title={`Sélectionner la couleur ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projet associé (optionnel)
          </label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Aucun projet spécifique</option>
            {projects?.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Note / Description (optionnelle)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="ex: Formation équipe, réunion client..."
            maxLength={255}
          />
        </div>

        {/* Prévisualisation améliorée */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Aperçu :</h5>
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded shadow-sm border" 
              style={{ backgroundColor: formData.color }}
            ></div>
            <span className="text-sm text-gray-600">
              {formData.planned_hours ? `${formData.planned_hours}h` : '0h'}
              {formData.description && ` - ${formData.description}`}
              {!formData.planned_hours && !formData.description && ' Aucune planification'}
            </span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            {existingPlanning && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
                disabled={loading}
              >
                🗑️ Supprimer
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.planned_hours}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </div>
              ) : (
                existingPlanning ? '✏️ Modifier' : '✅ Ajouter'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PlanningModal;