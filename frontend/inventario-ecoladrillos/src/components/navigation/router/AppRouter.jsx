import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
// contexts
import { useAuth } from "@contexts/AuthContext";
// components
import { Header } from "../Header";
import { BasePage } from "@components/layout/BasePage";
import { Login } from "@components/auth/Login";
// import { Signin } from "@components/auth/Signin";
import { AuthPage } from "@components/auth/AuthPage";
// import { Home } from "@components/layout/Home";UserProfile";
import HomePage from "@components/home/HomePage";
import Dashboard from "@components/dashboard/Dashboard";
import ConsultaInventario from "@components/consultaInventario/ConsultaInventario";
import RegistroEcoladrillos from "@components/registros/RegistroEcoladrillos";
import RetiroEcoladrillos from "@components/registros/RetiroEcoladrillos";
import RegistroMaterial from "@components/registros/RegistroMaterial";
import Reports from "@components/reports/Reports";
// styles
import "@styles/main.scss";

export function AppRouter() {
  const { isAuthenticated, userData } = useAuth();

  return (
    <Router>
      <Header
        userName={userData.userName}
        userAvatar={userData.userAvatar}
        isAuthenticated={isAuthenticated}
      />
      <Routes>
        <Route path="/login" element={<AuthPage AuthElement={Login} />} />

        <Route path="/" element={<BasePage />}>
          <Route index element={<Navigate to="/home" replace />} />
          {isAuthenticated && <Route path="/home" element={<HomePage />} />}
          {userData.userRole === "admin" && (
            <Route path="/dashboard" element={<Dashboard />} />
          )}
          {isAuthenticated && (
            <Route path="/inventory" element={<ConsultaInventario />} />
          )}

          {userData.userRole === "operario" && (
            <Route path="/register">
              <Route index element={<Navigate to="ecobricks" replace />} />
              <Route path="ecobricks" element={<RegistroEcoladrillos />} />
              <Route path="material" element={<RegistroMaterial />} />
              <Route path="withdraw" element={<RetiroEcoladrillos />} />
            </Route>
          )}

          {userData.userRole === "admin" && (
            <Route path="/reports" element={<Reports />} />
          )}
        </Route>
        <Route
          path="*"
          element={
            <div className="not-found flex flex-column align-center">
              <h1>404 - Pagina no Encontrada</h1>
              <p>Lo sentimos, la página que buscas no existe.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
