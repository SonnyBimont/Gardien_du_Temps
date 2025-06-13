import React, { useState, useEffect } from 'react';
import { Calendar, Target, BarChart3, Clock, Plus } from 'lucide-react';
import { usePlanningStore } from '../../stores/planningStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import Card from '../common/Card';
import Button from '../common/Button';
import PlanningModal from '../common/PlanningModal';

const YearlyPlanningRoadmap = ({ onBack }) => {
  const { user } = useAuthStore();
  const {
    yearlyPlanning,
    selectedYear,
    loading,
    fetchYearlyPlanning,
    setSelectedYear,
    upsertPlanning
  } = usePlanningStore();

  const { projects, fetchProjects } = useProjectStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [editingPlanning, setEditingPlanning] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetchYearlyPlanning();
    if (fetchProjects) fetchProjects();
    // eslint-disable-next-line
  }, [selectedYear]);

  // Génère une grille plate de 42 jours (6 semaines × 7 jours)
  const getCalendarGrid = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Lundi=0
    
    // Date du premier lundi affiché
    const gridStart = new Date(year, month, 1 - startDay);

    // ✅ CORRECTION : Calculer la date d'aujourd'hui correctement
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      
      // ✅ CORRECTION : Format cohérent pour la comparaison
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const planning = yearlyPlanning.planning?.find(p => p.plan_date === dateStr);
      
      return {
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === todayStr, // ✅ CORRECTION : Comparaison correcte
        planning
      };
    });
  };

  const calendarDays = getCalendarGrid(selectedYear, currentMonth);

  const handleDateClick = (dayData) => {
    if (!dayData.isCurrentMonth) return;
    setSelectedDate(dayData.date);
    setEditingPlanning(dayData.planning);
    setShowPlanningModal(true);
  };

  const handleSavePlanning = async (planningData) => {
    const result = await upsertPlanning({
      ...planningData,
      plan_date: selectedDate.toISOString().split('T')[0]
    });
    if (result.success) {
      setShowPlanningModal(false);
      setEditingPlanning(null);
      setSelectedDate(null);
    }
    return result;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      if (direction === 'prev') return prev === 0 ? 11 : prev - 1;
      else return prev === 11 ? 0 : prev + 1;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
  };

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
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
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
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mx-auto mb-2">
                %
              </div>
              <p className="text-sm text-purple-600 font-medium">Progression</p>
              <p className="text-xl font-bold text-purple-900">
                {yearlyPlanning.completion_rate || 0}%
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Avancement annuel</span>
              <span className="text-sm text-gray-500">{yearlyPlanning.completion_rate || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  (yearlyPlanning.completion_rate || 0) >= 100 ? 'bg-green-500' : 
                  (yearlyPlanning.completion_rate || 0) >= 75 ? 'bg-blue-500' : 
                  (yearlyPlanning.completion_rate || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(yearlyPlanning.completion_rate || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* CALENDRIER - Version Tailwind UI intégrée */}
// ...existing code...
      {/* CALENDRIER COMPLET - CSS INLINE GARANTI */}
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
            {monthNames[currentMonth]} {selectedYear}
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
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => handleDateClick(dayData)}
              onMouseEnter={(e) => {
                if (dayData.isCurrentMonth) {
                  e.target.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = dayData.isCurrentMonth ? 'white' : '#f9fafb';
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
    </div>
  );
};

export default YearlyPlanningRoadmap;