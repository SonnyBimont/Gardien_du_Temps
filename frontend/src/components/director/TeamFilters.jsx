import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Plus } from 'lucide-react';
import { PERIOD_OPTIONS } from '../../constants/timeTracking';

// Filtres d'équipe
 export const renderTeamFilters = (teamDateRange, setTeamDateRange, selectedAnimator, handleAnimatorSelection, setShowCreateAnimatorModal, myStructureAnimators) => (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            value={teamDateRange}
            onChange={(e) => setTeamDateRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {PERIOD_OPTIONS.filter(p => p.value !== 'custom').map((option) => (
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animateur
          </label>
          <select
            value={selectedAnimator}
            onChange={(e) => handleAnimatorSelection(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les animateurs</option>
            {myStructureAnimators.map(animator => (
              <option key={animator.id} value={animator.id}>
                {animator.first_name} {animator.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button 
            onClick={() => setShowCreateAnimatorModal(true)} 
            className="w-full"
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer Animateur
          </Button>
        </div>
      </div>
    </Card>
  );
