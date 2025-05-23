import React from "react";
import Card from "../UI/Card";
import TimeTrackingStatus from "./TimeTrackingStatus";
import TimeButtons from "./TimeButtons";
import HistoryTable from "./HistoryTable";

const TimeTrackingCard = ({
	user,
	currentTime,
	todayEntries,
	timeEntries,
	onTimeAction,
	onLogout,
}) => {
	// Déboguer pour voir si les données arrivent correctement
	console.log("TodayEntries:", todayEntries);
	console.log("TimeEntries:", timeEntries);

	const disabledActions = {
		arrival: !!todayEntries.arrival,
		break_start:
			!todayEntries.arrival ||
			!!todayEntries.breakStart ||
			!!todayEntries.departure,
		break_end:
			!todayEntries.breakStart ||
			!!todayEntries.breakEnd ||
			!!todayEntries.departure,
		departure:
			!todayEntries.arrival ||
			!!todayEntries.departure ||
			(!!todayEntries.breakStart && !todayEntries.breakEnd),
	};

	return (
		<Card>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div style={{ display: "flex", alignItems: "center" }}></div>
				<span
					role="img"
					aria-label="wave"
					style={{ fontSize: "24px", marginRight: "-450px" }}
				>
					👋
				</span>
				<h1 style={{ margin: 0 }}>Bonjour {user.firstName}</h1>
			</div>
			<button
				onClick={onLogout}
				style={{
					background: "transparent",
					border: "none",
					color: "var(--primary-color)",
					cursor: "pointer",
					fontSize: "0.9rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-evenly",
				}}
			>
				<span style={{ marginRight: "5px" }}>Déconnexion</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
					<polyline points="16 17 21 12 16 7"></polyline>
					<line x1="21" y1="12" x2="9" y2="12"></line>
				</svg>
			</button>
			<div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
				<span
					role="img"
					aria-label="location"
					style={{ fontSize: "24px", marginRight: "8px" }}
				>
					📍
				</span>
				<h3 style={{ margin: 0 }}>Structure: {user.structureName}</h3>
			</div>

			<div className="divider"></div>

			<h2>
				Heure actuelle:{" "}
				{currentTime.toLocaleTimeString("fr-FR", {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</h2>

			<TimeTrackingStatus entries={todayEntries} />

			<TimeButtons onAction={onTimeAction} disabledActions={disabledActions} />

			<div className="divider"></div>

			<HistoryTable entries={timeEntries} />
		</Card>
	);
};

export default TimeTrackingCard;
