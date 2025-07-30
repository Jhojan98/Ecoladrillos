import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
// contexts
import { useAuth } from "@contexts/AuthContext";
// components
import { Header } from "../Header";
import { Login } from "@components/auth/Login";
// import { Signin } from "@components/auth/Signin";
import { AuthPage } from "@components/auth/AuthPage";
// import { Home } from "@components/layout/Home";UserProfile";
import Dashboard from "@components/Dashboard/Dashboard";
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage AuthElement={Login} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/signin" element={<AuthPage AuthElement={Signin} />} />
        <Route path="/home" element={<Home />} /> */}
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
