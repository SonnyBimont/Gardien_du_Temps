import React, { useState, useEffect, useMemo } from "react";
import { useTimeStore } from "../../stores/timeStore";
import { useAuthStore } from "../../stores/authStore";
import { usePlanningStore } from "../../stores/planningStore";
import { calculateTotalHours } from "../../utils/time/calculations";
import { formatHours } from "../../utils/time/formatters";
import api from "../../services/api";
import { 
  YEAR_TYPES, 
  getYearBounds, 
  getCurrentYear 
} from '../../utils/dateUtils';

// ✅ IMPORTS CORRIGÉS
import Card from '../common/Card';
import StatsCards from '../calendar/StatsCards';
import CalendarNavigation from '../calendar/CalendarNavigation';
import CalendarGrid from '../calendar/CalendarGrid';
import { getCalendarGrid, navigateMonth, goToToday } from '../../utils/calendar/calendarUtils';
import { getDisplayMonth } from '../../utils/calendar/yearUtils';
import { getMonthlyRealizedHours } from '../../utils/stats/monthlyCalculations';

const RealizedHoursRoadmap = ({ onBack }) => {
  // ===== HOOKS EXTERNES =====
  const { user } = useAuthStore();
  const { fetchTimeHistory, timeHistory, loading } = useTimeStore();
  const { yearlyPlanning, fetchYearlyPlanning } = usePlanningStore();
  
  // ===== ÉTAT LOCAL =====
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
        return 8;
      }
    }    
    return todayMonth;
  });

  const [realizedHours, setRealizedHours] = useState({});

  // ===== DONNÉES CALCULÉES =====
  const calendarDays = getCalendarGrid(selectedYear, currentMonth, realizedHours, yearlyPlanning, yearType);
  const monthlyHours = getMonthlyRealizedHours(realizedHours, currentMonth, selectedYear, yearType);
  
  const handleNavigateMonth = (direction) => {
    navigateMonth(direction, currentMonth, setCurrentMonth, selectedYear, yearType);
  };

  const handleGoToToday = () => {
    goToToday(yearType, selectedYear, setSelectedYear, setCurrentMonth);
  };

  const displayMonth = getDisplayMonth(currentMonth, selectedYear, yearType);

  // ===== CALCULS POUR STATISTIQUES ANNUELLES =====
  const annualObjective = user?.annual_hours || 1607;
  const totalRealizedDecimal = realizedHours.totalRealizedYear || 0;
  const totalRealized = formatHours(totalRealizedDecimal);
  const remainingDecimal = Math.max(0, annualObjective - totalRealizedDecimal);
  const remaining = formatHours(remainingDecimal);

  // ===== FONCTION DE COULEUR SELON LES HEURES =====
  const getHoursColor = (hours) => {
    if (!hours || hours === 0) return "#f3f4f6";
    if (hours >= 8) return "#10B981";
    if (hours >= 6) return "#F59E0B";
    if (hours >= 3) return "#EF4444";
    return "#8B5CF6";
  };

  // ===== EFFETS DE CHARGEMENT DES DONNÉES =====
  useEffect(() => {
    if (user?.id) {
      loadYearData();
    }
  }, [selectedYear, yearType, user?.id]);

  useEffect(() => {
    if (user?.id && selectedYear && yearType) {
      const { startDate, endDate } = getYearBounds(selectedYear, yearType);
      fetchYearlyPlanning(user.id, startDate, endDate);
    }
  }, [selectedYear, yearType, user?.id, fetchYearlyPlanning]);

const loadYearData = async () => {
  if (loading) return;

  try {
    const { startDate, endDate } = getYearBounds(selectedYear, yearType);
    const response = await api.get(`/time-tracking/range?startDate=${startDate}&endDate=${endDate}&userId=${user.id}`);
    
    if (response.data.success) {
      const entries = response.data.data || [];
      const processedData = calculateTotalHours(entries);
      
      // ✅ DEBUG - Vérifier les données
      console.log('📊 Données brutes reçues:', entries.length, 'entrées');
      console.log('📊 Données traitées:', processedData.length, 'jours');
      console.log('📊 Exemple de jour:', processedData[0]);
      
      const yearlyData = {};
      let totalRealizedYear = 0;

      processedData.forEach(day => {
        yearlyData[day.date] = {
          workingHours: day.workingHours,
          arrival: day.arrival,
          departure: day.departure,
          breakStart: day.breakStart,
          breakEnd: day.breakEnd,
          status: day.status
        };
        totalRealizedYear += day.workingHours;
      });
      
      console.log('📊 Données finales stockées:', Object.keys(yearlyData).length, 'jours');
      
      setRealizedHours({
        ...yearlyData,
        totalRealizedYear: Math.round(totalRealizedYear * 100) / 100
      });
    }
  } catch (error) {
    console.error('❌ Erreur chargement heures réalisées:', error);
  }
};

  // ===== ÉTAT DE CHARGEMENT =====
  if (loading && Object.keys(realizedHours).length === 0) {
    return (
      <Card title="Mes Heures Réalisées">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3">Chargement...</span>
        </div>
      </Card>
    );
  }

  // ===== RENDU PRINCIPAL =====
  return (
    <div className="space-y-6">
      <StatsCards 
        selectedYear={selectedYear}
        yearType={yearType}
        onBack={onBack}
        realizedHours={realizedHours}
        yearlyPlanning={yearlyPlanning}
        user={user}
        setSelectedYear={setSelectedYear}
        annualObjective={annualObjective}
        totalRealized={totalRealized}
        remaining={remaining}
        getMonthlyRealizedHours={() => monthlyHours}
      />
      
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}>
        <CalendarNavigation 
          displayMonth={displayMonth}
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
        />
        
        <CalendarGrid 
          calendarDays={calendarDays}
          getHoursColor={getHoursColor}
          yearlyPlanning={yearlyPlanning}
        />
      </div>
    </div>
  );
};

export default RealizedHoursRoadmap;