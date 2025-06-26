import React from 'react';
import { formatHours } from '../../utils/time/formatters';

const CalendarGrid = ({ calendarDays, getHoursColor }) => {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[
          "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
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
              maxHeight: "140px", 
              display: "flex",
              flexDirection: "column",
              border: dayData.isToday ? "2px solid #10B981" : "none",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
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
                  backgroundColor: dayData.isToday ? "#10B981" : "transparent",
                  color: dayData.isToday ? "white" : "inherit",
                  borderRadius: dayData.isToday ? "50%" : "0",
                  fontWeight: dayData.isToday ? "600" : "500",
                }}
              >
                {dayData.day}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              {/* ✅ DONNÉES RÉALISÉES (POINTAGE) */}
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
                      backgroundColor: getHoursColor(dayData.realized.workingHours),
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
                    ✅ {formatHours(dayData.realized.workingHours)}
                  </span>
                </div>
              )}

              {/* ✅ DONNÉES PLANIFIÉES */}
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
                    📅 {formatHours(dayData.planning.planned_hours)}
                  </span>
                </div>
              )}

              {/* ✅ DIFFÉRENCE RÉALISÉ vs PLANIFIÉ */}
              {dayData.realized?.workingHours > 0 && dayData.planning?.planned_hours > 0 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: dayData.realized.workingHours >= dayData.planning.planned_hours ? "#10B981" : "#F59E0B",
                    fontWeight: "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dayData.realized.workingHours >= dayData.planning.planned_hours ? "🎯" : "⚠️"}
                  {dayData.realized.workingHours >= dayData.planning.planned_hours
                    ? `+${formatHours(dayData.realized.workingHours - dayData.planning.planned_hours)}`
                    : `${formatHours(dayData.realized.workingHours - dayData.planning.planned_hours)}`}
                </div>
              )}

              {/* ✅ HORAIRES ARRIVÉE/DÉPART */}
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
                  🕐 {dayData.realized.arrival} → {dayData.realized.departure || "En cours"}
                </div>
              )}

              {/* ✅ PAUSE DÉJEUNER */}
              {dayData.realized?.breakStart && dayData.realized?.breakEnd && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "#9CA3AF",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  🍽️ {dayData.realized.breakStart}-{dayData.realized.breakEnd}
                </div>
              )}

              {/* ✅ PROJET PLANIFIÉ */}
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

              {/* ✅ STATUT DU JOUR */}
              {dayData.realized?.status && (
                <div
                  style={{
                    fontSize: "8px",
                    color: dayData.realized.status === 'complete' ? "#10B981" : "#F59E0B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dayData.realized.status === 'complete' ? '✅ Complet' : '⏳ Partiel'}
                </div>
              )}

              {/* JOUR VIDE */}
              {dayData.isCurrentMonth &&
                (!dayData.realized || dayData.realized.workingHours === 0) &&
                (!dayData.planning || dayData.planning.planned_hours === 0) && (
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
    </>
  );
};

export default CalendarGrid;