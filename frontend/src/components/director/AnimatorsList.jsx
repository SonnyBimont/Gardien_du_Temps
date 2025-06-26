import React, { useState} from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { Search, Users } from 'lucide-react';
import { logger } from '../../utils/logger';
import { useAdminStore } from '../../stores/adminStore';

// Liste des animateurs
 export const AnimatorsList = ({
  animators,
  searchTerm,
  setSearchTerm,
  showAllAnimators,
  setShowAllAnimators,
  onAnimatorSelect,
  onEditAnimator,
  onReloadData,
}) => {
   const { toggleUserStatus } = useAdminStore();

  const filteredAnimators = animators.filter(animator => {
    const matchesSearch = 
      (animator.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animator.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleToggleStatus = async (animatorId, newStatus) => {
    try {
      await toggleUserStatus(animatorId, newStatus);
      logger.log(`✅ Statut animateur ${animatorId} modifié`);
      if (onReloadData) await onReloadData();
    } catch (error) {
      logger.error('❌ Erreur toggle status:', error);
    }
  };

  return (
    <Card title="Mes Animateurs" className="h-full">
      <div className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un animateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des animateurs */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredAnimators.length > 0 ? (
            filteredAnimators.slice(0, showAllAnimators ? filteredAnimators.length : 5).map((animator) => (
              <div 
                key={animator.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onAnimatorSelect?.(animator.id)}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${animator.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {animator.first_name} {animator.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{animator.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAnimator?.(animator);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(animator.id, !animator.active);
                    }}
                    variant={animator.active ? "success" : "danger"}
                    size="sm"
                    className="min-w-[70px]"
                  >
                    {animator.active ? 'Actif' : 'Inactif'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun animateur trouvé</p>
            </div>
          )}
        </div>

        {/* Bouton voir plus */}
        {filteredAnimators.length > 5 && (
          <Button
            variant="outline"
            onClick={() => setShowAllAnimators(!showAllAnimators)}
            className="w-full"
          >
            {showAllAnimators ? 'Voir moins' : `Voir tous (${filteredAnimators.length})`}
          </Button>
        )}
      </div>
    </Card>
  );
};