import React, { useState, useEffect } from 'react';
import { Calendar, Target, BarChart3, Clock, Plus, Settings } from 'lucide-react';
import { usePlanningStore } from '../../stores/planningStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { exportPlannedHoursToCSV } from '../../utils/exportCSV';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import YearTypeSelector from '../common/YearTypeSelector';
import PlanningModal from '../common/PlanningModal';
import { 
  YEAR_TYPES, 
  getYearByType, 
  getYearBounds, 
  filterByYearType, 
  getCurrentYear 
} from '../../utils/dateUtils';

const YearlyPlanningRoadmap = ({ onBack }) => {
  const { user } = useAuthStore();
  const { yearlyPlanning, fetchYearlyPlanning, loading, upsertPlanning } = usePlanningStore();
  const { projects } = useProjectStore();
  
  // Récupérer d'abord le yearType, puis initialiser selectedYear
  const yearType = user?.year_type || YEAR_TYPES.CIVIL;
  const [selectedYear, setSelectedYear] = useState(() => getCurrentYear(yearType)); // Fonction callback
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    
    if (yearType === YEAR_TYPES.SCHOOL) {
      // En mode scolaire, vérifier si on est dans l'année scolaire sélectionnée
      const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
      if (selectedYear === currentSchoolYear) {
        // On est dans l'année scolaire actuelle, afficher le mois actuel
        return todayMonth;
      } else {
        // Année scolaire différente, commencer en septembre
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
      // En mode scolaire, si on est de septembre à décembre : année N
      // Si on est de janvier à août : année N+1
      return month >= 8 ? selectedYear : selectedYear + 1;
    } else {
      // Mode civil : toujours l'année sélectionnée
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
    const calendarYear = getCalendarYear(month); // la bonne année
    
    const firstDayOfMonth = new Date(calendarYear, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Lundi=0
    
    // Date du premier lundi affiché
    const gridStart = new Date(calendarYear, month, 1 - startDay);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === dateStr);
      
      return {
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === todayStr, 
        planning
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
            // Septembre → revenir à août de l'année suivante
            return bounds.endMonth;
          } else if (prev === 0) {
            // Janvier → Décembre année précédente
            return 11;
          } else {
            return prev - 1;
          }
        } else {
          if (prev === bounds.endMonth) {
            // Août → revenir à septembre
            return bounds.startMonth;
          } else if (prev === 11) {
            // Décembre → Janvier année suivante
            return 0;
          } else {
            return prev + 1;
          }
        }
      } else {
        // Mode civil : comportement normal
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
      // Déterminer l'année scolaire du jour actuel
      const currentSchoolYear = getCurrentYear(YEAR_TYPES.SCHOOL);
      
      // Mettre à jour l'année sélectionnée si nécessaire
      if (selectedYear !== currentSchoolYear) {
        setSelectedYear(currentSchoolYear);
      }
    } else {
      // Mode civil : mettre à jour l'année si nécessaire
      if (selectedYear !== todayYear) {
        setSelectedYear(todayYear);
      }
    }
    
    // Toujours aller au mois actuel
    setCurrentMonth(todayMonth);
  };

  // getMonthlyPlannedHours pour la bonne année
  const getMonthlyPlannedHours = () => {
    if (!yearlyPlanning.planning || !Array.isArray(yearlyPlanning.planning)) {
      return 0;
    }
    
    try {
      const calendarYear = getCalendarYear(currentMonth); // ✅ Année correcte
      
      const monthlyTotal = yearlyPlanning.planning
        .filter(p => {
          if (!p.plan_date) return false;
          
          const planDate = new Date(p.plan_date + 'T00:00:00');
          if (isNaN(planDate.getTime())) return false;
          
          // ✅ CORRIGER : Vérifier avec la bonne année du calendrier
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

  // Utiliser la nouvelle fonction getCalendarGrid
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
      plan_date: localDateStr // Format YYYY-MM-DD
    };
    
    console.log('📤 Données complètes envoyées:', dataWithDate); // Debug
    
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
      {yearType === YEAR_TYPES.SCHOOL ? 'Année scolaire :' : 'Année :'}
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

  // Effet pour mettre à jour selectedYear quand yearType change
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

  {/* ✅ REMPLACER ce select par renderYearSelector() ou le corriger */}
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
          </div>

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

      {/* CALENDRIER - Version Tailwind UI intégrée */}
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

        {/* En-têtes des jours - HORIZONTAL FORCÉ */}
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

        {/* GRILLE DES JOURS - CSS INLINE COMPLET */}
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
              </div>
              
              {/* Planifications */}
              <div style={{ flex: 1 }}>
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
      // ✅ COPIER la logique de PlanningModal qui fonctionne
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
      
      setShowYearTypeModal(false);
    }}
    title="Paramètres du calendrier"
    size="lg"
  >
    <YearTypeSelector 
      onClose={() => {
        // ✅ MÊME nettoyage ici
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