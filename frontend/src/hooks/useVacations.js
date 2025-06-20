import { useState, useEffect } from 'react';
import { useSchoolVacationStore } from '../stores/schoolVacationStore';

export const useVacations = (startDate, endDate, zone = null) => { // ✅ null = toutes les zones
  const { fetchVacations, isVacationDay, getVacationInfo, loading, error } = useSchoolVacationStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadVacations = async () => {
      if (startDate && endDate) {
        console.log('🏖️ Hook useVacations: Chargement...', { startDate, endDate, zone });
        await fetchVacations(startDate, endDate, zone); // ✅ zone peut être null
        setInitialized(true);
      }
    };

    loadVacations();
  }, [startDate, endDate, zone, fetchVacations]);

  return {
    isVacationDay,
    getVacationInfo,
    loading: loading || !initialized,
    error,
    fetchVacations 
  };
};