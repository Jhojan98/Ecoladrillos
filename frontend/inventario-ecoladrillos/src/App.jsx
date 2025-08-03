import { AppRouter } from "@components/Navigation/Router/AppRouter";
// prime react
import { PrimeReactProvider } from "primereact/api";
import { ConfirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/saga-blue/theme.css";
import 'primeicons/primeicons.css';
// contexts
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@contexts/AuthContext";
import { HeaderBarsProvider } from "@contexts/HeaderBarsContext";
// styles
import "@styles/main.scss";

function App() {
  return (
    <>
      <AuthProvider>
        <HeaderBarsProvider>
          <PrimeReactProvider>
            <AppRouter />
            <ToastContainer position="bottom-right" autoClose={3000} limit={3} />
            <ConfirmDialog />
          </PrimeReactProvider>
        </HeaderBarsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
