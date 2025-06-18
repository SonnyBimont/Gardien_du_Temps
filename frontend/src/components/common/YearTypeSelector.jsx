import React, { useState, useEffect } from 'react';
import { Calendar, GraduationCap, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from './Button';
import { 
  YEAR_TYPES, 
  formatYearDisplay, 
  getYearBounds 
} from '../../utils/dateUtils';

const YearTypeSelector = ({ className = '', onClose }) => {
  const { user, updateYearType } = useAuthStore();
  
  // Initialiser avec le type utilisateur OU school par défaut
  const userYearType = user?.year_type || YEAR_TYPES.SCHOOL;
  const [selectedType, setSelectedType] = useState(userYearType);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mettre à jour selectedType quand user change
  useEffect(() => {
    if (user?.year_type) {
      setSelectedType(user.year_type);
    } else {
      // Si pas de year_type dans user, utiliser school par défaut
      setSelectedType(YEAR_TYPES.SCHOOL);
    }
  }, [user?.year_type]);

  const yearTypes = [
    {
      value: YEAR_TYPES.CIVIL,
      label: 'Année civile',
      description: 'Janvier à Décembre',
      icon: Calendar,
      example: 'Exemple : 2025 (Jan → Déc)'
    },
    {
      value: YEAR_TYPES.SCHOOL,
      label: 'Année scolaire',
      description: 'Septembre à Août',
      icon: GraduationCap,
      example: 'Exemple : 2024-2025 (Sep → Août)'
    }
  ];

  // Simplifier la logique de changement
  const handleTypeSelect = (newType) => {
    console.log('🔄 Sélection type:', newType);
    setSelectedType(newType);
  };

  const handleSave = async () => {
    if (selectedType === user?.year_type) {
      console.log('✅ Aucun changement nécessaire');
      if (onClose) onClose();
      return;
    }
    
    console.log('💾 Sauvegarde du type:', selectedType);
    setIsUpdating(true);
    
    const result = await updateYearType(selectedType);
    
    if (result.success) {
      console.log('✅ Type d\'année mis à jour');
      if (onClose) {
        onClose();
        // Recharger après un délai pour que l'utilisateur voie le succès
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } else {
      console.error('❌ Erreur:', result.error);
      // Remettre l'ancienne valeur en cas d'erreur
      setSelectedType(user?.year_type || YEAR_TYPES.SCHOOL);
    }
    
    setIsUpdating(false);
  };

  const getCurrentYearExample = (type) => {
    const currentYear = new Date().getFullYear();
    const bounds = getYearBounds(currentYear, type);
    return bounds.label || `${currentYear}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Type d'année pour les calculs d'objectifs
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Choisissez comment vous souhaitez calculer vos objectifs annuels
        </p>
      </div>

      <div className="space-y-3">
        {yearTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          const isCurrent = (user?.year_type || YEAR_TYPES.SCHOOL) === type.value;
          
          return (
            <div
              key={type.value}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !isUpdating && handleTypeSelect(type.value)}
            >
              {/* Radio button visuel */}
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>

              <div className="flex items-start space-x-4 pr-8">
                <div className={`
                  p-3 rounded-lg 
                  ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  <Icon className={`
                    w-6 h-6 
                    ${isSelected ? 'text-blue-600' : 'text-gray-600'}
                  `} />
                </div>

                <div className="flex-1">
                  <h5 className={`
                    text-lg font-semibold mb-1
                    ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {type.label}
                  </h5>
                  
                  <p className={`
                    text-sm mb-2
                    ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                  `}>
                    {type.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {getCurrentYearExample(type.value)}
                  </div>

                  {/* Badge "Actuellement utilisé" */}
                  {isCurrent && (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <Check className="w-3 h-3 mr-1" />
      Actuellement utilisé
    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informations complémentaires */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h6 className="text-sm font-medium text-gray-700 mb-2">
          ℹ️ À savoir :
        </h6>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Cette préférence affecte le calcul de vos objectifs annuels</li>
          <li>• Les calendriers et statistiques s'adapteront automatiquement</li>
          <li>• Vous pouvez changer ce paramètre à tout moment</li>
          <li>• L'historique existant reste inchangé</li>
        </ul>
      </div>

      {isUpdating && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-gray-600">Mise à jour en cours...</span>
        </div>
      )}

      {/* ✅ CORRECTION : Boutons séparés */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isUpdating}
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isUpdating || selectedType === user?.year_type}
        >
          {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};

export default YearTypeSelector;