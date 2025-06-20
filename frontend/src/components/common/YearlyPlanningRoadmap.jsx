// ✅ CORRIGER : Tous les imports nécessaires
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { usePlanningStore } from '../../stores/planningStore';
import { useProjectStore } from '../../stores/projectStore';
import { useVacations } from '../../hooks/useVacations';
import api from '../../services/api';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import PlanningModal from './PlanningModal';
import YearTypeSelector from './YearTypeSelector';
import {useSchoolVacationStore} from '../../stores/schoolVacationStore';
import { 
  Calendar, 
  Target, 
  BarChart3, 
  Clock, 
  Plus, 
  Settings 
} from 'lucide-react';
import { 
  YEAR_TYPES, 
  getCurrentYear, 
  getYearBounds 
} from '../../utils/dateUtils';
import { exportPlannedHoursToCSV } from '../../utils/exportCSV';

const YearlyPlanningRoadmap = ({ onBack }) => {
  const { user } = useAuthStore();
  const { yearlyPlanning, fetchYearlyPlanning, loading, upsertPlanning } = usePlanningStore();
  const { projects } = useProjectStore();
  
  const yearType = user?.year_type || YEAR_TYPES.CIVIL;
  const [selectedYear, setSelectedYear] = useState(() => getCurrentYear(yearType));
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    
    if (yearType === YEAR_TYPES.SCHOOL) {
      const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
      if (selectedYear === currentSchoolYear) {
        return todayMonth;
      } else {
        return 8; // septembre = mois 8
      }
    }
    
    return todayMonth; // Mode civil : mois actuel
  });
  
  // États pour les modals
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingPlanning, setEditingPlanning] = useState(null);
  const [showYearTypeModal, setShowYearTypeModal] = useState(false);

  // ✅ CORRIGER : Hook useVacations appelé au bon endroit (niveau composant)
  const { startDate, endDate } = getYearBounds(selectedYear, yearType);
  const { isVacationDay, getVacationInfo, loading: vacationLoading, error: vacationError } = useVacations(startDate, endDate, 'B');

  const { fetchVacations: fetchVacationsFromStore } = useSchoolVacationStore();


// ✅ AJOUTER : États pour la synchronisation
const [syncLoading, setSyncLoading] = useState(false);
const [syncStatus, setSyncStatus] = useState(null);

// ✅ AJOUTER : Fonction de synchronisation des vacances
const syncVacationsFromAPI = async () => {
  setSyncLoading(true);
  setSyncStatus(null);
  
  try {
    console.log('🔄 Synchronisation des vacances depuis l\'API educ.gouv...');
    
    const currentSchoolYear = selectedYear;
    const schoolYears = [
      `${currentSchoolYear - 1}-${currentSchoolYear}`, // 2023-2024
      `${currentSchoolYear}-${currentSchoolYear + 1}`,   // 2024-2025
      `${currentSchoolYear + 1}-${currentSchoolYear + 2}` // 2025-2026
    ];
    
    console.log('📅 Années à synchroniser:', schoolYears);
    
    const response = await api.post('/school-vacations/sync', {
      zones: ['A', 'B', 'C'],
      schoolYears: schoolYears
    });
    
    console.log('📡 Réponse API complète:', response.data);
    console.log('📊 Type de response.data.results:', typeof response.data.results);
    console.log('📊 Contenu results:', response.data.results);
    
    if (response.data.success) {
      console.log('✅ Synchronisation réussie');
      
      // ✅ CORRIGER : Gestion defensive des résultats
      let results = [];
      let count = 0;
      
      // Essayer différents formats de réponse
      if (response.data.results) {
        if (Array.isArray(response.data.results)) {
          results = response.data.results;
          count = results.length;
        } else if (typeof response.data.results === 'object') {
          // Si results est un objet avec created/updated
          count = (response.data.results.created || 0) + (response.data.results.updated || 0);
          results = []; // Pas de détails disponibles
        }
      } else if (response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
        count = results.length;
      } else if (response.data.count) {
        count = response.data.count;
        results = [];
      }
      
      console.log(`📊 Résultats traités: ${count} périodes, ${results.length} détails`);
      
      setSyncStatus({
        type: 'success',
        message: `${count} périodes synchronisées depuis l'API gouvernementale`,
        details: Array.isArray(results) ? results : []
      });
      
      // ✅ FORCER : Rechargement après synchronisation
      console.log('🔄 Rechargement des vacances...');
      await fetchVacationsFromStore(startDate, endDate, 'B');
      
      // Auto-masquer après 8 secondes au lieu de 5
      setTimeout(() => setSyncStatus(null), 8000);
      
    } else {
      throw new Error(response.data.message || 'Erreur de synchronisation');
    }
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    console.error('❌ Détails erreur:', error.response?.data);
    
    setSyncStatus({
      type: 'error',
      message: error.response?.data?.message || error.message || 'Erreur lors de la synchronisation'
    });
    
    setTimeout(() => setSyncStatus(null), 10000);
  } finally {
    setSyncLoading(false);
  }
};


  // ✅ CORRIGER : useEffect pour synchroniser les vacances (niveau composant)
  useEffect(() => {
    const syncVacationsIfNeeded = async () => {
      try {
        // Vérifier s'il y a des vacances dans la base
        const response = await api.get('/school-vacations/calendar?zone=B&schoolYear=2024-2025');
        
        if (!response.data.success || response.data.count === 0) {
          console.log('🔄 Aucune vacance trouvée, synchronisation...');
          
          // Synchroniser automatiquement
          await api.post('/school-vacations/sync-auto');
          
          // Le hook se rechargera automatiquement
        }
      } catch (error) {
        console.log('ℹ️ Synchronisation automatique non disponible:', error.message);
      }
    };

    syncVacationsIfNeeded();
  }, []); // Exécution unique au montage

  // ✅ CORRIGER : useEffect pour debug (niveau composant)
  useEffect(() => {
    if (vacationError) {
      console.warn('⚠️ Erreur vacances:', vacationError);
    }
    if (!vacationLoading) {
      console.log('🏖️ Vacances chargées, test avec une date...');
      const testDate = new Date('2024-12-23'); // Vacances de Noël
      console.log('Test date 23/12/2024:', {
        isVacation: isVacationDay(testDate),
        info: getVacationInfo(testDate)
      });
    }
  }, [vacationLoading, vacationError, isVacationDay, getVacationInfo]);

  // Fonction pour obtenir les bornes de mois selon le type d'année
  const getMonthBounds = (year, yearType) => {
    if (yearType === YEAR_TYPES.SCHOOL) {
      return {
        startMonth: 8, // septembre
        endMonth: 7,   // août de l'année suivante
        startYear: year,
        endYear: year + 1
      };
    } else {
      return {
        startMonth: 0, // janvier
        endMonth: 11,  // décembre
        startYear: year,
        endYear: year
      };
    }
  };

  // Fonction pour obtenir l'année d'affichage du calendrier
  const getCalendarYear = (month) => {
    if (yearType === YEAR_TYPES.SCHOOL) {
      return month >= 8 ? selectedYear : selectedYear + 1;
    } else {
      return selectedYear;
    }
  };

  // Mettre à jour l'affichage du mois dans le header
  const getDisplayMonth = () => {
    const year = getCalendarYear(currentMonth);
    return `${monthNames[currentMonth]} ${year}`;
  };

  // Génère une grille plate de 42 jours (6 semaines × 7 jours)
  const getCalendarGrid = (selectedYear, month) => {
    const calendarYear = getCalendarYear(month);
    
    const firstDayOfMonth = new Date(calendarYear, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Lundi=0
    const gridStart = new Date(calendarYear, month, 1 - startDay);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === dateStr);
      
      // ✅ CORRIGER : Utiliser les hooks correctement définis
      const isVacation = isVacationDay(date);
      const vacationInfo = isVacation ? getVacationInfo(date) : null;
      
      return {
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === todayStr, 
        planning,
        isVacation,
        vacationInfo
      };
    });
  };

  // Navigation des mois selon le type d'année
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const bounds = getMonthBounds(selectedYear, yearType);
      
      if (yearType === YEAR_TYPES.SCHOOL) {
        if (direction === 'prev') {
          if (prev === bounds.startMonth) {
            return bounds.endMonth;
          } else if (prev === 0) {
            return 11;
          } else {
            return prev - 1;
          }
        } else {
          if (prev === bounds.endMonth) {
            return bounds.startMonth;
          } else if (prev === 11) {
            return 0;
          } else {
            return prev + 1;
          }
        }
      } else {
        if (direction === 'prev') {
          return prev === 0 ? 11 : prev - 1;
        } else {
          return prev === 11 ? 0 : prev + 1;
        }
      }
    });
  };

  // Fonction "Aller à aujourd'hui" selon le type d'année
  const goToToday = () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    if (yearType === YEAR_TYPES.SCHOOL) {
      const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
      if (selectedYear !== currentSchoolYear) {
        setSelectedYear(currentSchoolYear);
      }
    } else {
      if (selectedYear !== todayYear) {
        setSelectedYear(todayYear);
      }
    }
    
    setCurrentMonth(todayMonth);
  };

  // getMonthlyPlannedHours pour la bonne année
  const getMonthlyPlannedHours = () => {
    if (!yearlyPlanning.planning || !Array.isArray(yearlyPlanning.planning)) {
      return 0;
    }
    
    try {
      const calendarYear = getCalendarYear(currentMonth);
      
      const monthlyTotal = yearlyPlanning.planning
        .filter(p => {
          if (!p.plan_date) return false;
          
          const planDate = new Date(p.plan_date + 'T00:00:00');
          if (isNaN(planDate.getTime())) return false;
          
          return planDate.getFullYear() === calendarYear && planDate.getMonth() === currentMonth;
        })
        .reduce((total, planning) => {
          const hours = parseFloat(planning.planned_hours) || 0;
          return total + hours;
        }, 0);
      
      return isNaN(monthlyTotal) ? 0 : Math.round(monthlyTotal * 100) / 100;
      
    } catch (error) {
      console.error('Erreur calcul heures mensuelles planifiées:', error);
      return 0;
    }
  };

  const calendarDays = getCalendarGrid(selectedYear, currentMonth);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleDateClick = (dayData) => {
    if (!dayData.isCurrentMonth) return;
    setSelectedDate(dayData.date);
    setEditingPlanning(dayData.planning);
    setShowPlanningModal(true);
  };

  const handleSavePlanning = async (planningData) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    const dataWithDate = {
      ...planningData,
      plan_date: localDateStr
    };
    
    console.log('📤 Données complètes envoyées:', dataWithDate);
    
    const result = await upsertPlanning(dataWithDate);
    if (result.success) {
      setShowPlanningModal(false);
      setEditingPlanning(null);
      setSelectedDate(null);
    }
    return result;
  };

  const renderYearSelector = () => (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">
        {yearType === YEAR_TYPES.SCHOOL ? 'Année scolaire :' : 'Année civile :'}
      </label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
      >
        {[...Array(5)].map((_, i) => {
          const year = getCurrentYear(yearType) - 2 + i;
          return (
            <option key={year} value={year}>
              {yearType === YEAR_TYPES.SCHOOL ? `${year}-${year + 1}` : year}
              {year === getCurrentYear(yearType) ? ' (actuel)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );

  useEffect(() => {
    const loadPlanningData = async () => {
      if (user?.id && selectedYear && yearType) {
        const { startDate, endDate } = getYearBounds(selectedYear, yearType);
        await fetchYearlyPlanning(user.id, startDate, endDate);
      }
    };
    
    loadPlanningData();
  }, [selectedYear, yearType, user?.id, fetchYearlyPlanning]);

  if (loading && !yearlyPlanning.planning) {
    return (
      <Card title="Planification Annuelle">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Chargement...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <Card className="border-t-4 border-t-blue-500">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                Planification Annuelle
              </h2>
              <p className="text-gray-600 mt-1">Organisez votre temps pour {selectedYear}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="mr-3">
                  ← Retour
                </Button>
              )}
  <Button 
    variant="outline"
    onClick={syncVacationsFromAPI}
    size="sm"
    disabled={syncLoading}
    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
  >
    {syncLoading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
        Synchronisation...
      </>
    ) : (
      <>
        🏖️ Sync Vacances
      </>
    )}
  </Button>
  {/* ✅ NOUVEAU : Bouton de debug pour 2024-2025 */}
  <Button 
    variant="outline"
    onClick={async () => {
      console.log('🔍 DEBUG: Vérification vacances 2024-2025...');
      
      try {
        // Test 1: Vérifier ce qu'on a en base pour 2024-2025
        const response1 = await api.get('/school-vacations/calendar?zone=B&schoolYear=2024-2025');
        console.log('📊 Vacances 2024-2025 en base:', response1.data);
        
        // Test 2: Vérifier l'API gouvernementale directement
        const response2 = await api.get('/school-vacations/raw-data?zone=B&schoolYear=2024-2025');
        console.log('📊 API gouv 2024-2025:', response2.data);
        
        // Test 3: Forcer sync uniquement 2024-2025
        const response3 = await api.post('/school-vacations/sync', {
          zones: ['B'],
          schoolYears: ['2024-2025']
        });
        console.log('📊 Sync forcée 2024-2025:', response3.data);
        
        alert('Vérifications terminées, regardez la console pour les détails');
        
      } catch (error) {
        console.error('❌ Erreur debug:', error);
        alert('Erreur debug: ' + error.message);
      }
    }}
    size="sm"
    className="bg-yellow-50 border-yellow-200 text-yellow-700"
  >
    🔍 Debug 2024-2025
  </Button>
              <Button 
                variant="outline" 
                onClick={() => exportPlannedHoursToCSV(yearlyPlanning, selectedYear, yearType)}
                className="ml-2"
              >
                📊 Exporter Planning
              </Button>

              <Button 
                variant="outline"
                onClick={() => setShowYearTypeModal(true)}
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Type d'année
              </Button>

              {renderYearSelector()}
            </div>
          </div>

{/* ✅ AJOUTER : Message de statut de synchronisation */}
{syncStatus && (
  <div className={`mb-4 p-4 rounded-lg border ${
    syncStatus.type === 'success' 
      ? 'bg-green-50 border-green-200 text-green-800' 
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    <div className="flex items-center">
      <span className="mr-2">
        {syncStatus.type === 'success' ? '✅' : '❌'}
      </span>
      <span className="font-medium">{syncStatus.message}</span>
    </div>
    
    {/* ✅ CORRIGER : Vérifications multiples pour éviter l'erreur */}
    {syncStatus.details && 
     syncStatus.type === 'success' && 
     Array.isArray(syncStatus.details) && 
     syncStatus.details.length > 0 && (
      <div className="mt-2 text-sm">
        <details>
          <summary className="cursor-pointer hover:underline">
            Voir le détail ({syncStatus.details.length} périodes)
          </summary>
          <div className="mt-2 space-y-1">
            {syncStatus.details.slice(0, 10).map((result, idx) => (
              <div key={idx} className="text-xs bg-white p-2 rounded border">
                {/* ✅ CORRIGER : Gestion défensive des propriétés */}
                {(result?.status === 'created' || result?.action === 'created') ? '🆕' : '🔄'} 
                {result?.data?.period_name || result?.period_name || result?.title || 'Période inconnue'} - 
                Zone {result?.data?.zone || result?.zone || '?'}
                <span className="text-gray-500 ml-2">
                  ({result?.data?.start_date ? new Date(result.data.start_date).toLocaleDateString('fr-FR') : '?'} → 
                   {result?.data?.end_date ? new Date(result.data.end_date).toLocaleDateString('fr-FR') : '?'})
                </span>
              </div>
            ))}
            {syncStatus.details.length > 10 && (
              <div className="text-xs text-gray-500">
                ... et {syncStatus.details.length - 10} autres périodes
              </div>
            )}
          </div>
        </details>
      </div>
    )}
    
    {/* ✅ AJOUTER : Message si pas de détails ou détails vides */}
    {syncStatus.type === 'success' && 
     (!syncStatus.details || !Array.isArray(syncStatus.details) || syncStatus.details.length === 0) && (
      <div className="mt-2 text-sm text-green-600">
        Synchronisation terminée. Rechargez la page pour voir les nouvelles vacances.
      </div>
    )}
  </div>
)}


          {/* Statistiques en ligne */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">Objectif</p>
              <p className="text-xl font-bold text-blue-900">
                {yearlyPlanning.annual_objective || user?.annual_hours || 1600}h
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">Planifiées</p>
              <p className="text-xl font-bold text-green-900">
                {yearlyPlanning.total_planned || 0}h
              </p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-600 font-medium">Restant</p>
              <p className="text-xl font-bold text-orange-900">
                {yearlyPlanning.remaining_hours || (user?.annual_hours || 1600)}h
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Ce mois</p>
              <p className="text-xl font-bold text-purple-900">
                {getMonthlyPlannedHours()}h
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CALENDRIER */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {getDisplayMonth()}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <button 
                type="button" 
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                type="button" 
                onClick={goToToday}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderLeft: '1px solid #d1d5db',
                  borderRight: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Aujourd'hui
              </button>
              
              <button 
                type="button" 
                onClick={() => navigateMonth('next')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Bouton Planifier */}
            <button 
              type="button" 
              onClick={() => {
                setSelectedDate(new Date());
                setEditingPlanning(null);
                setShowPlanningModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <Plus size={16} />
              Planifier
            </button>
          </div>
        </div>

        {/* En-têtes des jours */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
            <div 
              key={day} 
              style={{
                padding: '12px',
                textAlign: 'center',
                backgroundColor: 'white',
                margin: '1px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* GRILLE DES JOURS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#f3f4f6'
        }}>
          {calendarDays.map((dayData, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: dayData.isCurrentMonth ? 'white' : '#f9fafb',
                color: dayData.isCurrentMonth ? '#111827' : '#9ca3af',
                padding: '12px',
                cursor: dayData.isCurrentMonth ? 'pointer' : 'default',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                border: dayData.isToday ? '2px solid #3b82f6' : 'none',
                boxShadow: dayData.isVacation ? 'inset 0 0 0 2px #fbbf24' : 'none',
                transition: 'background-color 0.2s ease',
                overflow: 'hidden',
                maxHeight: '120px',
              }}
              onClick={() => handleDateClick(dayData)}
              onMouseEnter={e => {
                if (dayData.isCurrentMonth) e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={e => {
                if (dayData.isCurrentMonth) e.currentTarget.style.backgroundColor = 'white';
                else e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
            >
              {/* Numéro du jour */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: dayData.isToday ? 'flex' : 'block',
                  alignItems: dayData.isToday ? 'center' : 'unset',
                  justifyContent: dayData.isToday ? 'center' : 'unset',
                  width: dayData.isToday ? '24px' : 'auto',
                  height: dayData.isToday ? '24px' : 'auto',
                  backgroundColor: dayData.isToday ? '#3b82f6' : 'transparent',
                  color: dayData.isToday ? 'white' : 'inherit',
                  borderRadius: dayData.isToday ? '50%' : '0',
                  fontWeight: dayData.isToday ? '600' : '500'
                }}>
                  {dayData.day}
                </span>
         
                {/* Indicateur vacances */}
                {dayData.isVacation && (
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: '#fbbf24',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    🏖️
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                {/* Info vacances (en premier) */}
                {dayData.isVacation && (
                  <div style={{
                    fontSize: '10px',
                    color: '#f59e0b',
                    marginBottom: '4px',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {dayData.vacationInfo?.title?.replace(' - Zone B', '') || 'Vacances scolaires'}
                  </div>
                )}

                {/* Planifications */}
                {dayData.planning?.planned_hours > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: dayData.planning.color,
                          flexShrink: 0
                        }}
                      ></div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {dayData.planning.planned_hours}h
                      </span>
                    </div>
                    
                    {dayData.planning.project && (
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginLeft: '20px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {dayData.planning.project.name}
                      </div>
                    )}
                    
                    {dayData.planning.description && (
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginLeft: '20px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {dayData.planning.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de planification */}
      {showPlanningModal && (
        <PlanningModal
          isOpen={showPlanningModal}
          onClose={() => {
            setShowPlanningModal(false);
            setEditingPlanning(null);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          existingPlanning={editingPlanning}
          projects={projects}
          onSave={handleSavePlanning}
        />
      )}

      {/* Modal pour les paramètres */}
      {showYearTypeModal && (
        <Modal
          isOpen={showYearTypeModal}
          onClose={() => {
            setTimeout(() => {
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
              document.body.classList.remove('modal-open');
              
              const overlays = document.querySelectorAll('[class*="bg-gray-900"][class*="bg-opacity"]');
              overlays.forEach(overlay => {
                if (overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              });
            }, 50);
            
            setShowYearTypeModal(false);
          }}
          title="Paramètres du calendrier"
          size="lg"
        >
          <YearTypeSelector 
            onClose={() => {
              setTimeout(() => {
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                document.body.classList.remove('modal-open');
                
                const overlays = document.querySelectorAll('[class*="bg-gray-900"][class*="bg-opacity"]');
                overlays.forEach(overlay => {
                  if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                  }
                });
              }, 50);
              
              setShowYearTypeModal(false);
            }} 
          />
        </Modal>
      )}
    </div>
  );
};

export default YearlyPlanningRoadmap;