import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Target, BarChart3, Clock, CheckCircle } from "lucide-react";
import { useTimeStore } from "../../stores/timeStore";
import { useAuthStore } from "../../stores/authStore";
import { usePlanningStore } from "../../stores/planningStore";
import { calculateTotalHours, formatHours } from "../../utils/timeCalculations";
import { exportRealizedHoursToCSV,exportRHReport } from "../../utils/exportCSV";
import Card from "../common/Card";
import Button from "../common/Button";
import api from "../../services/api";

const RealizedHoursRoadmap = ({ onBack }) => {
  const { user } = useAuthStore();
  const { fetchTimeHistory, timeHistory, loading } = useTimeStore();

  const { yearlyPlanning, fetchYearlyPlanning } = usePlanningStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [realizedHours, setRealizedHours] = useState({});

  useEffect(() => {
    loadYearData();
    fetchYearlyPlanning(); // Charger aussi les planifications
  }, [selectedYear]);

  const loadYearData = async () => {
    if (loading) return;

    try {
      // Calculer la plage de dates pour l'année
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // UN SEUL appel au lieu de fetchTimeHistory
      const response = await api.get(
        `/time-tracking/range?startDate=${startDate}&endDate=${endDate}&userId=${user.id}`
      );

      if (response.data.success) {
        const entries = response.data.data || [];
        const processedData = calculateTotalHours(entries);

        // Calculer directement les heures réalisées
        const yearlyData = {};
        let totalRealizedYear = 0;

        processedData.forEach((day) => {
          const dayDate = new Date(day.date);
          if (dayDate.getFullYear() === selectedYear) {
            yearlyData[day.date] = {
              workingHours: day.workingHours,
              arrival: day.arrival,
              departure: day.departure,
              breakStart: day.breakStart,
              breakEnd: day.breakEnd,
              status: day.status,
            };
            totalRealizedYear += day.workingHours;
          }
        });

        setRealizedHours({
          ...yearlyData,
          totalRealizedYear: Math.round(totalRealizedYear * 100) / 100,
        });
      }
    } catch (error) {
      console.error("Erreur chargement heures réalisées:", error);
    }
  };

  // Fonction pour convertir les heures décimales en heures:minutes
  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours || decimalHours === 0) return "0h00";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  const monthlyStats = useMemo(() => {
    const monthData = Object.entries(realizedHours)
      .filter(([date]) => {
        const d = new Date(date);
        return (
          d.getFullYear() === selectedYear && d.getMonth() === currentMonth
        );
      })
      .reduce((acc, [, data]) => acc + (data.workingHours || 0), 0);

    return Math.round(monthData * 100) / 100;
  }, [realizedHours, selectedYear, currentMonth]);

  const getMonthlyRealizedHours = () => {
    if (!realizedHours || Object.keys(realizedHours).length === 0) {
      return "0h00";
    }

    try {
      const monthlyTotal = Object.entries(realizedHours)
        .filter(([date, data]) => {
          if (!date || !data) return false;

          const workDate = new Date(date + "T00:00:00");

          if (isNaN(workDate.getTime())) return false;

          return (
            workDate.getFullYear() === selectedYear &&
            workDate.getMonth() === currentMonth
          );
        })
        .reduce((total, [, data]) => {
          const hours = parseFloat(data.workingHours) || 0;
          return total + hours;
        }, 0);

      return formatDecimalHours(monthlyTotal);
    } catch (error) {
      console.error("Erreur calcul heures mensuelles réalisées:", error);
      return "0h00";
    }
  };

  // Génère une grille plate de 42 jours (6 semaines × 7 jours)
  const getCalendarGrid = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Lundi=0

    const gridStart = new Date(year, month, 1 - startDay);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);

      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const dayData = realizedHours[dateStr];

      // Trouver la planification pour ce jour
      const planning = yearlyPlanning.planning?.find(
        (p) => p.plan_date === dateStr
      );

      return {
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === todayStr,
        realized: dayData,
        planning: planning,
      };
    });
  };

  const calendarDays = getCalendarGrid(selectedYear, currentMonth);

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      if (direction === "prev") return prev === 0 ? 11 : prev - 1;
      else return prev === 11 ? 0 : prev + 1;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
  };

  // Calculer les statistiques
  const annualObjective = user?.annual_hours || 1607;
  const totalRealizedDecimal = realizedHours.totalRealizedYear || 0;
  const totalRealized = formatDecimalHours(totalRealizedDecimal);
  const remainingDecimal = Math.max(0, annualObjective - totalRealizedDecimal);
  const remaining = formatDecimalHours(remainingDecimal);
  const completionRate =
    annualObjective > 0
      ? Math.round((totalRealized / annualObjective) * 100 * 100) / 100
      : 0;

  // Obtenir la couleur selon les heures travaillées
  const getHoursColor = (hours) => {
    if (!hours || hours === 0) return "#f3f4f6"; // Gris clair
    if (hours >= 8) return "#10B981"; // Vert - journée complète
    if (hours >= 6) return "#F59E0B"; // Orange - journée partielle
    if (hours >= 3) return "#EF4444"; // Rouge - peu d'heures
    return "#8B5CF6"; // Violet - très peu d'heures
  };

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

  return (
    <div className="space-y-6">
      {/* Statistiques */}
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

          {/* Statistiques en ligne */}
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
                {totalRealized}h
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-600 font-medium">Restant</p>
              <p className="text-xl font-bold text-orange-900">{remaining}h</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Ce mois</p>
              <p className="text-xl font-bold text-purple-900">
                {getMonthlyRealizedHours()}h
              </p>
            </div>
          </div>

          {/* Légende des couleurs */}
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

      {/* CALENDRIER */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px",
          }}
        >
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {monthNames[currentMonth]} {selectedYear}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToToday}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderLeft: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                Aujourd'hui
              </button>

              <button
                type="button"
                onClick={() => navigateMonth("next")}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* En-têtes des jours */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {[
            "Lundi",
            "Mardi",
            "Mercredi",
            "Jeudi",
            "Vendredi",
            "Samedi",
            "Dimanche",
          ].map((day) => (
            <div
              key={day}
              style={{
                padding: "12px",
                textAlign: "center",
                backgroundColor: "white",
                margin: "1px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* GRILLE DES JOURS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "1px",
            backgroundColor: "#f3f4f6",
          }}
        >
          {calendarDays.map((dayData, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: dayData.isCurrentMonth ? "white" : "#f9fafb",
                color: dayData.isCurrentMonth ? "#111827" : "#9ca3af",
                padding: "12px",
                minHeight: "100px",
                maxHeight: "140px", // ✅ AUGMENTER légèrement pour plus de contenu
                display: "flex",
                flexDirection: "column",
                border: dayData.isToday ? "2px solid #10B981" : "none",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Numéro du jour */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    display: dayData.isToday ? "flex" : "block",
                    alignItems: dayData.isToday ? "center" : "unset",
                    justifyContent: dayData.isToday ? "center" : "unset",
                    width: dayData.isToday ? "24px" : "auto",
                    height: dayData.isToday ? "24px" : "auto",
                    backgroundColor: dayData.isToday
                      ? "#10B981"
                      : "transparent",
                    color: dayData.isToday ? "white" : "inherit",
                    borderRadius: dayData.isToday ? "50%" : "0",
                    fontWeight: dayData.isToday ? "600" : "500",
                  }}
                >
                  {dayData.day}
                </span>
              </div>

              {/* Contenu principal */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                {/* HEURES RÉALISÉES */}
                {dayData.realized?.workingHours > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: getHoursColor(
                          dayData.realized.workingHours
                        ),
                        flexShrink: 0,
                      }}
                    ></div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatHours(dayData.realized.workingHours)}
                    </span>
                  </div>
                )}

                {/* HEURES PLANIFIÉES */}
                {dayData.planning?.planned_hours > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: dayData.planning.color || "#3B82F6",
                        flexShrink: 0,
                      }}
                    ></div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "500",
                        color: "#6B7280",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📅 {dayData.planning.planned_hours}h
                    </span>
                  </div>
                )}

                {/* COMPARAISON (si les deux existent) */}
                {dayData.realized?.workingHours > 0 &&
                  dayData.planning?.planned_hours > 0 && (
                    <div
                      style={{
                        fontSize: "9px",
                        color:
                          dayData.realized.workingHours >=
                            dayData.planning.planned_hours
                            ? "#10B981"
                            : "#F59E0B",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dayData.realized.workingHours >=
                        dayData.planning.planned_hours
                        ? "🎯"
                        : "⚠️"}
                      {dayData.realized.workingHours >=
                        dayData.planning.planned_hours
                        ? `+${formatDecimalHours(dayData.realized.workingHours - dayData.planning.planned_hours)}`
                        : `${formatDecimalHours(dayData.realized.workingHours - dayData.planning.planned_hours)}`}
                    </div>
                  )}

                {/* Horaires de début/fin (si présents) */}
                {dayData.realized?.arrival && (
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#9CA3AF",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dayData.realized.arrival} →{" "}
                    {dayData.realized.departure || "En cours"}
                  </div>
                )}

                {/* Projet planifié (si présent) */}
                {dayData.planning?.project && (
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#9CA3AF",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📋 {dayData.planning.project.name}
                  </div>
                )}

                {/* Si pas de données */}
                {dayData.isCurrentMonth &&
                  (!dayData.realized || dayData.realized.workingHours === 0) &&
                  (!dayData.planning ||
                    dayData.planning.planned_hours === 0) && (
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#D1D5DB",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      Aucune donnée
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealizedHoursRoadmap;
