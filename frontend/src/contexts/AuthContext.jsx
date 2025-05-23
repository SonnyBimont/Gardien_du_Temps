import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Vérifier l'authentification au chargement
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem("token");

			if (token) {
				try {
					// Vérifier que le token est valide
					const response = await api.get("/auth/me");

					if (response.data.success) {
						setUser(response.data.data);
					} else {
						// Token invalide
						logout();
					}
				} catch (error) {
					// Erreur d'API ou token expiré
					console.error("Erreur d'authentification:", error);
					logout();
				}
			}

			setLoading(false);
		};

		checkAuth();
	}, []);

	// Fonction de connexion
	const login = async (email, password) => {
		try {
			const response = await api.post("/auth/login", { email, password });

			if (response.data.success) {
				localStorage.setItem("token", response.data.token);
				setUser(response.data.user);
				return { success: true };
			}

			return { success: false, message: "Identifiants invalides" };
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Erreur de connexion",
			};
		}
	};

	// Fonction de déconnexion
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login");
	};

	// Valeurs exposées par le contexte
	const value = {
		user,
		loading,
		login,
		logout,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
