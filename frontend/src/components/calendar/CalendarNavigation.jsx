import React from 'react';

const CalendarNavigation = ({ displayMonth, onNavigateMonth, onGoToToday }) => {
  return (
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
        {displayMonth} 
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            onClick={() => onNavigateMonth("prev")}
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
            onClick={onGoToToday}
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
          >
            Aujourd'hui
          </button>

          <button
            type="button"
            onClick={() => onNavigateMonth("next")}
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
  );
};

export default CalendarNavigation;