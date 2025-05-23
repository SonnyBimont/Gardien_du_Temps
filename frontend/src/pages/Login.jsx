import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/login.css";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth(); // Utiliser le contexte d'authentification

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await login(email, password); // Utiliser la fonction login du contexte

			if (result.success) {
				navigate("/");
			} else {
				setError(result.message || "Identifiants invalides");
			}
		} catch (err) {
			setError("Une erreur est survenue lors de la connexion");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<h1>Gardien du Temps</h1>
					<p>Connectez-vous pour accéder à votre espace</p>
				</div>

				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="votre@email.com"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Mot de passe</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="Votre mot de passe"
						/>
					</div>

					<button type="submit" className="login-button" disabled={isLoading}>
						{isLoading ? "Connexion en cours..." : "Se connecter"}
					</button>
				</form>

				<div className="login-footer">
					<p>&copy; {new Date().getFullYear()} Gardien du Temps</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
