import React from "react";

const StatusIcon = ({ type }) => {
	const getIconByType = () => {
		switch (type) {
			case "arrival":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
					</svg>
				);
			case "break_start":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M8 5v14l11-7z" />
					</svg>
				);
			case "break_end":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M8 5v14l11-7z" />
					</svg>
				);
			case "departure":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
					</svg>
				);
			default:
				return null;
		}
	};

	const getBackgroundColor = () => {
		switch (type) {
			case "arrival":
				return "var(--success-color)";
			case "break_start":
				return "var(--warning-color)";
			case "break_end":
				return "var(--info-color)";
			case "departure":
				return "var(--danger-color)";
			default:
				return "#ccc";
		}
	};

	return (
		<div
			className="status-icon"
			style={{ backgroundColor: getBackgroundColor(), color: "white" }}
		>
			{getIconByType()}
		</div>
	);
};

export default StatusIcon;
