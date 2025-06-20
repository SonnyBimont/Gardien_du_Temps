import React, { useState } from 'react';
import { useSchoolVacationStore } from '../../stores/schoolVacationStore';
import Button from './Button';
import Card from './Card';

const VacationTester = () => {
  const { 
    vacations, 
    fetchVacations, 
    isVacationDay, 
    getVacationInfo, 
    loading, 
    error 
  } = useSchoolVacationStore();
  
  const [testDate, setTestDate] = useState('2024-12-23'); // Date de test
  const [zone, setZone] = useState('B');

const handleTest = async () => {
  console.log('🏖️ Test chargement vacances...');
  // Chargez pour plusieurs années
  await fetchVacations('2024-09-01', '2026-08-31', zone);
};

  const handleSyncVacations = async () => {
    try {
      const response = await fetch('/api/school-vacations/sync-auto', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Synchronisation réussie');
        await handleTest(); // Recharger après sync
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  };

// ✅ AJOUTER : Bouton pour forcer la synchronisation complète
const handleForceSync = async () => {
  try {
    const response = await fetch('/api/school-vacations/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zones: ['A', 'B', 'C'],
        schoolYears: ['2023-2024', '2024-2025', '2025-2026']
      })
    });
    
    if (response.ok) {
      console.log('✅ Synchronisation complète réussie');
      await handleTest(); // Recharger après sync
    }
  } catch (error) {
    console.error('❌ Erreur synchronisation complète:', error);
  }
};

  return (
    <Card title="🏖️ Test des Vacances Scolaires">
      <div className="space-y-4">
<div className="flex gap-4 flex-wrap">
  <select 
    value={zone} 
    onChange={(e) => setZone(e.target.value)}
    className="border rounded px-3 py-2"
  >
    <option value="A">Zone A</option>
    <option value="B">Zone B</option>
    <option value="C">Zone C</option>
  </select>
  
  <Button onClick={handleTest} disabled={loading}>
    {loading ? 'Chargement...' : 'Charger Vacances'}
  </Button>
  
  <Button onClick={handleSyncVacations} variant="outline">
    Sync Auto (année courante)
  </Button>
  
  <Button onClick={handleForceSync} variant="primary">
    🔄 Sync Complète (toutes années)
  </Button>
</div>

{/* ✅ AJOUTER : Affichage détaillé des vacances */}
<div className="mt-6">
  <h4 className="font-medium mb-3">📋 Vacances chargées par période :</h4>
  {vacations.length > 0 ? (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {vacations.map((vacation, idx) => (
        <div key={idx} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
          <span className="font-medium">{vacation.period_name || vacation.title}</span>
          <span className="text-gray-600">
            {new Date(vacation.start).toLocaleDateString('fr-FR')} → {new Date(vacation.end).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-sm text-gray-500 italic">Aucune vacance chargée</div>
  )}
</div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur: {error}
          </div>
        )}

        <div>
          <p><strong>Vacances chargées :</strong> {vacations.length}</p>
          {vacations.slice(0, 3).map((vacation, idx) => (
            <div key={idx} className="text-sm">
              • {vacation.period_name} ({vacation.start_date} → {vacation.end_date})
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">
            Tester une date :
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="border rounded px-3 py-2 mr-4"
          />
          
          <div className="mt-2">
            <strong>Résultat :</strong>
            {isVacationDay(new Date(testDate)) ? (
              <span className="text-orange-600">
                ✅ En vacances - {getVacationInfo(new Date(testDate))?.period_name}
              </span>
            ) : (
              <span className="text-blue-600">❌ Jour d'école</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VacationTester;