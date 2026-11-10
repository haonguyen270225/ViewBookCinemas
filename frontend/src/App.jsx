
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";

// Các trang
import Home from "./pages/home/Home.jsx";
import Movies from "./pages/movies/Movies.jsx";
import Showtimes from "./pages/showtimes/Showtimes.jsx";
import Cinemas from "./pages/cinemas/Cinemas.jsx";
import Promotions from "./pages/promotions/Promotions.jsx";
import Register from "./pages/register/Register.jsx";
import Login from "./pages/login/Login.jsx";
import ForgotPassword from "./pages/forgot-password/ForgotPassword.jsx";
import MovieDetail from "./pages/movie-detail/MovieDetail.jsx";
import AuthNotification from "./components/common/AuthNotification.jsx";

function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
          <AuthNotification />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/showtimes" element={<Showtimes />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
}

export default App;
