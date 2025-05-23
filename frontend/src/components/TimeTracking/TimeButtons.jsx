import React from "react";
import Button from "../UI/Button";

const TimeButtons = ({ onAction, disabledActions }) => {
	return (
		<div
			className="time-buttons"
			style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
		>
			<Button
				onClick={() => onAction("arrival")}
				disabled={disabledActions.arrival}
				className="time-button"
			>
				Pointer l'arrivée
			</Button>

			<Button
				onClick={() => onAction("break_start")}
				disabled={disabledActions.break_start}
				className="time-button"
			>
				Début pause
			</Button>

			<Button
				onClick={() => onAction("break_end")}
				disabled={disabledActions.break_end}
				className="time-button"
			>
				Fin de pause
			</Button>

			<Button
				onClick={() => onAction("departure")}
				disabled={disabledActions.departure}
				variant="outline"
				className="time-button"
				style={{ marginLeft: "auto" }}
			>
				Pointer départ
			</Button>
		</div>
	);
};

export default TimeButtons;
