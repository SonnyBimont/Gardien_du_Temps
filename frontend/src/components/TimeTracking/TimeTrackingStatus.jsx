import React from "react";
import StatusIcon from "../UI/StatusIcon";

const TimeTrackingStatus = ({ entries }) => {
	const formatTime = (dateTimeString) => {
		if (!dateTimeString) return "";
		return new Date(dateTimeString).toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="time-tracking-status">
			<h3>Pointages du jour:</h3>

			<div
				className="status-item"
				style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
			>
				<StatusIcon type="arrival" />
				<div>
					<strong>Arrivée : </strong>
					{entries?.arrival ? formatTime(entries.arrival.date_time) : ""}
				</div>
			</div>

			<div
				className="status-item"
				style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
			>
				<StatusIcon type="break_start" />
				<div>
					<strong>Pause début : </strong>
					{entries?.breakStart ? formatTime(entries.breakStart.date_time) : ""}
				</div>
			</div>

			<div
				className="status-item"
				style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
			>
				<StatusIcon type="break_end" />
				<div>
					<strong>Pause fin : </strong>
					{entries?.breakEnd ? formatTime(entries.breakEnd.date_time) : ""}
				</div>
			</div>

			<div
				className="status-item"
				style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
			>
				<StatusIcon type="departure" />
				<div>
					<strong>Départ : </strong>
					{entries?.departure ? formatTime(entries.departure.date_time) : ""}
				</div>
			</div>
		</div>
	);
};

export default TimeTrackingStatus;
