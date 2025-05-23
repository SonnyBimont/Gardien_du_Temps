import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
	const { isAuthenticated, loading } = useAuth();

	// Afficher un indicateur de chargement pendant la vérification de l'authentification
	if (loading) {
		return (
			<div className="loading-screen">
				<div className="spinner"></div>
				<p>Chargement...</p>
			</div>
		);
	}

	// Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
