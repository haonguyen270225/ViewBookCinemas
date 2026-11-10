
import { BrowserRouter, Routes, Route } from "react-router-dom";

//=================== Import các trang ========================

import Home from "./pages/home/Home.jsx";
import Movies from "./pages/movies/Movies.jsx";
import Showtimes from "./pages/showtimes/Showtimes.jsx";
import Cinemas from "./pages/cinemas/Cinemas.jsx";
import Promotions from "./pages/promotions/Promotions.jsx";
import Register from "./pages/register/Register.jsx";
import Login from "./pages/login/Login.jsx";
import ForgotPassword from "./pages/forgot-password/ForgotPassword.jsx";
//=================== Cấu hình Router ========================

function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/cinemas" element={<Cinemas />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    );
}

export default App;
