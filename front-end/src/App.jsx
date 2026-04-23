import Header from "./components/Header";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Register from "./pages/Register";
import { Account } from "./pages/Account";
import { UserContextProvider } from "./contexts/UserContext";
import Place from "./pages/Place";
import { ThemeProvider } from "./contexts/ThemeContext";
import PlaceBookingsManager from "./components/PlaceBookingsManager";
import UserManager from "./components/UserManager";
import AuditPanel from "./components/AuditPanel";

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  return (
    <ThemeProvider>
      <UserContextProvider>
        <BrowserRouter>
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/account/:subpage/:action?/:id?"
              element={<Account />}
            />
            <Route path="/place/:id" element={<Place />} />
            <Route
              path="/account/places/:placeId/bookings"
              element={<PlaceBookingsManager />}
            />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </ThemeProvider>
  );
}
export default App;
