import React from 'react';
import { Calendar, Target, BarChart3, Clock, CheckCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { YEAR_TYPES } from '../../utils/dateUtils';
import { exportRHReport } from '../../utils/exportCSV';

const StatsCards = ({ 
  selectedYear, 
  yearType, 
  onBack, 
  realizedHours, 
  yearlyPlanning, 
  user, 
  setSelectedYear,
  annualObjective,
  totalRealized,
  remaining,
  getMonthlyRealizedHours 
}) => {
  return (
    <Card className="border-t-4 border-t-green-500">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              Mes Heures Réalisées
            </h2>
            <p className="text-gray-600 mt-1">
              Vos heures de travail pointées pour {selectedYear}
              {yearType === YEAR_TYPES.SCHOOL && ` (année scolaire ${selectedYear}-${selectedYear + 1})`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="mr-3">
                ← Retour
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={() => exportRHReport(realizedHours, yearlyPlanning, selectedYear, user)}
              className="ml-2"
            >
              📊 Exporter CSV
            </Button>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-600 font-medium">Objectif</p>
            <p className="text-xl font-bold text-blue-900">
              {annualObjective}h
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium">Réalisées</p>
            <p className="text-xl font-bold text-green-900">
              {totalRealized}
            </p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-orange-600 font-medium">Restant</p>
            <p className="text-xl font-bold text-orange-900">{remaining}</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-purple-600 font-medium">Ce mois</p>
            <p className="text-xl font-bold text-purple-900">
              {getMonthlyRealizedHours()}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Légende :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-gray-600 mb-2">
                Heures réalisées :
              </p>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: "#10B981" }}
                  ></div>
                  <span>≥8h - Journée complète</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: "#F59E0B" }}
                  ></div>
                  <span>6-7h - Journée partielle</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: "#EF4444" }}
                  ></div>
                  <span>3-5h - Demi-journée</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="font-medium text-gray-600 mb-2">Comparaison :</p>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>Heures planifiées</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎯</span>
                  <span className="text-green-600">Objectif atteint</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span className="text-orange-600">
                    En retard sur l'objectif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCards;