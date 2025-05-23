import React from "react";

const HistoryTable = ({ entries }) => {
	return (
		<div className="history-table">
			<h3>Historique</h3>
			<table className="table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Arrivée</th>
						<th>Pause</th>
						<th>Reprise</th>
						<th>Départ</th>
						<th>Total</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((entry, index) => (
						<tr key={index}>
							<td>{entry.date}</td>
							<td>{entry.arrival}</td>
							<td>{entry.breakStart}</td>
							<td>{entry.breakEnd}</td>
							<td>{entry.departure}</td>
							<td>{entry.total}</td>
						</tr>
					))}
					{entries.length === 0 && (
						<tr>
							<td colSpan="6" style={{ textAlign: "center" }}>
								Aucun historique disponible
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default HistoryTable;
