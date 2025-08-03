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
import Dashboard from "@components/Dashboard/Dashboard";
import ConsultaInventario from "@components/ConsultaInventario/ConsultaInventario";
import RegistroEcoladrillos from "@components/RegistroEcoladrillos/RegistroEcoladrillos";
import RegistroSalidaEcoladrillos from "@components/RegistroEcoladrillos/RegistroSalidaEcoladrillos";
import HomePage from "@components/home/HomePage";
import RegistroMaterial from "@components/RegistroMaterial/RegistroMaterial";
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<ConsultaInventario />} />

          <Route path="/register">
            <Route index element={<Navigate to="ecobricks" replace />} />
            <Route path="ecobricks" element={<RegistroEcoladrillos />} />
            <Route path="material" element={<RegistroMaterial />} />
            <Route path="output" element={<RegistroSalidaEcoladrillos />} />
          </Route>
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
