import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import "./styles/global.css";

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					{/* Route publique */}
					<Route path="/login" element={<Login />} />

					{/* Routes protégées */}
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Dashboard />} />
					</Route>

					{/* Redirection des routes non reconnues */}
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
