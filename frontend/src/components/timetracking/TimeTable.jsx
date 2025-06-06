// src/components/timetracking/TimeTable.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useTimeStore } from '../../stores/timeStore';
import { useAuthStore } from '../../stores/authStore';
import { calculateTotalHours, formatDate, formatHours } from '../../utils/timeCalculations';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const TimeTable = ({ userId = null, showFilters = true, showExport = true, compact = false }) => {
  const { user } = useAuthStore();
  const { timeHistory, fetchTimeHistory, fetchUserEntries, loading } = useTimeStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('30'); // 30 derniers jours
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState('recent'); // recent, month, custom
  
  const itemsPerPage = compact ? 5 : 10;
  const targetUserId = userId || user?.id;

  useEffect(() => {
    const loadData = async () => {
      if (viewMode === 'recent') {
        if (userId) {
          await fetchUserEntries(userId, { days: parseInt(dateRange) });
        } else {
          await fetchTimeHistory(parseInt(dateRange));
        }
      } else if (viewMode === 'month') {
        const startDate = new Date(selectedMonth + '-01');
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        
        if (userId) {
          await fetchUserEntries(userId, { 
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          });
        } else {
          await fetchTimeHistory(null, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          });
        }
      }
    };

    loadData();
  }, [fetchTimeHistory, fetchUserEntries, dateRange, selectedMonth, viewMode, userId]);

  const processedData = calculateTotalHours(timeHistory);
  
  // Filtrage par recherche
  const filteredData = processedData.filter(day => 
    searchTerm === '' || day.formattedDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Statistiques
  const totalWorkingHours = filteredData.reduce((sum, day) => sum + day.workingHours, 0);
  const averageHours = filteredData.length > 0 ? totalWorkingHours / filteredData.length : 0;
  const workingDays = filteredData.filter(day => day.workingHours > 0).length;

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Arrivée', 'Début pause', 'Fin pause', 'Départ', 'Temps de pause', 'Total travaillé'].join(','),
      ...filteredData.map(day => [
        day.formattedDate,
        day.arrival || '',
        day.breakStart || '',
        day.breakEnd || '',
        day.departure || '',
        day.formattedBreakTime || '',
        day.formattedWorkingHours || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pointages_${selectedMonth || 'recent'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (day) => {
    if (!day.arrival) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Absent</span>;
    }
    if (!day.departure) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">En cours</span>;
    }
    if (day.workingHours < 7) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">Partiel</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Complet</span>;
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="mb-4 space-y-3">
        {/* Mode de vue */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'recent' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('recent')}
          >
            <Clock className="w-4 h-4 mr-1" />
            Récent
          </Button>
          <Button
            variant={viewMode === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Par mois
          </Button>
        </div>

        {/* Filtres selon le mode */}
        <div className="flex flex-wrap gap-3 items-center">
          {viewMode === 'recent' && (
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7">7 derniers jours</option>
              <option value="15">15 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
          )}

          {viewMode === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          )}

          <Input
            placeholder="Rechercher une date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-48"
            size="sm"
          />

          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredData.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (compact) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Total travaillé</p>
              <p className="text-lg font-semibold text-blue-900">{formatHours(totalWorkingHours)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Jours travaillés</p>
              <p className="text-lg font-semibold text-green-900">{workingDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">Moyenne/jour</p>
              <p className="text-lg font-semibold text-purple-900">{formatHours(averageHours)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-700">
          Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredData.length)} sur {filteredData.length} entrées
        </p>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="Historique des pointages">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Historique des pointages"
      className={compact ? 'h-80' : ''}
    >
      {renderFilters()}
      {renderStats()}
      
      <div className={`overflow-x-auto ${compact ? 'max-h-48 overflow-y-auto' : ''}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrivée
              </th>
              {!compact && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pause
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Départ
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((day, index) => (
              <tr 
                key={index} 
                className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div>
                    <div>{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.formattedDate}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {day.arrival || '-'}
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {day.breakStart && day.breakEnd 
                        ? `${day.breakStart} - ${day.breakEnd}` 
                        : day.breakStart 
                        ? `${day.breakStart} - En cours`
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {day.departure || '-'}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <span className={day.workingHours >= 7 ? 'text-green-600' : 'text-orange-600'}>
                    {day.formattedWorkingHours}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(day)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pointage trouvé</p>
            <p className="text-sm text-gray-400 mt-1">
              Essayez de modifier les filtres ou la période sélectionnée
            </p>
          </div>
        )}
      </div>

      {!compact && renderPagination()}
    </Card>
  );
};

export default TimeTable;