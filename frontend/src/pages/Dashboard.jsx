import React, { useState, useEffect } from "react";
import TimeTrackingCard from "../components/TimeTracking/TimeTrackingCard";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
	const { user: authUser, logout } = useAuth();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [timeEntries, setTimeEntries] = useState([]);
	const [todayEntries, setTodayEntries] = useState({
		arrival: null,
		breakStart: null,
		breakEnd: null,
		departure: null,
	});

	// Ajouter un état pour suivre les erreurs et le chargement
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	// Formater les données d'utilisateur pour l'affichage
	const user = {
		firstName: authUser?.first_name || "Utilisateur",
		structureName: "Centre Enfance", // Vous pourriez récupérer le nom de la structure depuis l'API
	};

	// Mettre à jour l'heure actuelle
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Charger les pointages du jour
	useEffect(() => {
		const fetchTodayEntries = async () => {
			if (!authUser) return;

			try {
				const today = new Date().toISOString().split("T")[0];
				const response = await api.get(
					`/time-trackings/range?startDate=${today}&endDate=${today}&userId=${authUser.id}`,
				);

				if (response.data.success) {
					const entries = response.data.data || [];

					// Organiser les entrées par type
					const todayData = {
						arrival: entries.find((e) => e.tracking_type === "arrival"),
						breakStart: entries.find((e) => e.tracking_type === "break_start"),
						breakEnd: entries.find((e) => e.tracking_type === "break_end"),
						departure: entries.find((e) => e.tracking_type === "departure"),
					};

					setTodayEntries(todayData);
				}
			} catch (error) {
				console.error("Error fetching today entries:", error);
				if (error.response?.status === 401) {
					logout(); // Déconnexion si token expiré
				}
			}
		};

		fetchTodayEntries();
	}, [authUser, logout]);

	// Charger l'historique des pointages
	useEffect(() => {
		const fetchTimeEntries = async () => {
			if (!authUser) return;

			try {
				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const startDate = sevenDaysAgo.toISOString().split("T")[0];
				const endDate = new Date().toISOString().split("T")[0];

				const response = await api.get(
					`/time-trackings/range?startDate=${startDate}&endDate=${endDate}&userId=${authUser.id}`,
				);

				if (response.data.success) {
					// Organiser les entrées par jour
					const entriesByDate = {};

					response.data.data.forEach((entry) => {
						const date = entry.date_time.split("T")[0];
						if (!entriesByDate[date]) {
							entriesByDate[date] = [];
						}
						entriesByDate[date].push(entry);
					});

					// Transformer en format pour le tableau d'historique
					const formattedEntries = Object.keys(entriesByDate).map((date) => {
						const dayEntries = entriesByDate[date];
						const arrival = dayEntries.find(
							(e) => e.tracking_type === "arrival",
						);
						const breakStart = dayEntries.find(
							(e) => e.tracking_type === "break_start",
						);
						const breakEnd = dayEntries.find(
							(e) => e.tracking_type === "break_end",
						);
						const departure = dayEntries.find(
							(e) => e.tracking_type === "departure",
						);

						// Calculer les heures totales
						let totalHours = 0;
						if (arrival && departure) {
							let totalMinutes =
								(new Date(departure.date_time) - new Date(arrival.date_time)) /
								(1000 * 60);

							// Soustraire le temps de pause si disponible
							if (breakStart && breakEnd) {
								const breakMinutes =
									(new Date(breakEnd.date_time) -
										new Date(breakStart.date_time)) /
									(1000 * 60);
								totalMinutes -= breakMinutes;
							}

							totalHours = Math.round((totalMinutes / 60) * 100) / 100; // Arrondir à 2 décimales
						}

						// Formater la date pour l'affichage
						const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
							day: "2-digit",
							month: "2-digit",
							year: "2-digit",
						});

						return {
							date: formattedDate,
							arrival: arrival
								? new Date(arrival.date_time).toLocaleTimeString("fr-FR", {
										hour: "2-digit",
										minute: "2-digit",
									})
								: "",
							breakStart: breakStart
								? new Date(breakStart.date_time).toLocaleTimeString("fr-FR", {
										hour: "2-digit",
										minute: "2-digit",
									})
								: "",
							breakEnd: breakEnd
								? new Date(breakEnd.date_time).toLocaleTimeString("fr-FR", {
										hour: "2-digit",
										minute: "2-digit",
									})
								: "",
							departure: departure
								? new Date(departure.date_time).toLocaleTimeString("fr-FR", {
										hour: "2-digit",
										minute: "2-digit",
									})
								: "",
							total: totalHours ? `${totalHours}h` : "",
						};
					});

					setTimeEntries(formattedEntries);
				}
			} catch (error) {
				console.error("Error fetching time entries history:", error);
			}
		};

		fetchTimeEntries();
	}, [authUser, logout]);

	const handleTimeAction = async (actionType) => {
		if (!authUser) return;

		try {
			const payload = {
				date_time: new Date().toISOString(),
				tracking_type: actionType,
				validated: false,
				user_id: authUser.id,
				comment: "",
			};

			const response = await api.post("/time-trackings", payload);

			if (response.data.success) {
				// Rafraîchir les données sans recharger la page
				window.location.reload();
			}
		} catch (error) {
			console.error("Error tracking time:", error);
			alert("Erreur lors du pointage. Veuillez réessayer.");
		}
	};

	return (
		<div className="container">
			<TimeTrackingCard
				user={user}
				currentTime={currentTime}
				todayEntries={todayEntries}
				timeEntries={timeEntries}
				onTimeAction={handleTimeAction}
				onLogout={logout}
			/>
		</div>
	);
};

export default Dashboard;
