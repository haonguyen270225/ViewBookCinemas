
import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import AdminComingSoon from "../pages/AdminComingSoon.jsx";
import AdminMovies from "../pages/movies/AdminMovies.jsx";
import AdminGenres from "../pages/genres/AdminGenres.jsx";
import AdminCinemas from "../pages/cinemas/AdminCinemas.jsx";
import AdminRooms from "../pages/rooms/AdminRooms.jsx";
import AdminSeats from "../pages/seats/AdminSeats.jsx";
import AdminShowtimes from "../pages/showtimes/AdminShowtimes.jsx";
import AdminBookings from "../pages/bookings/AdminBookings.jsx";
import AdminTickets from "../pages/tickets/AdminTickets.jsx";
import AdminPayments from "../pages/payments/AdminPayments.jsx";
import AdminProducts from "../pages/products/AdminProducts.jsx";
import AdminCombos from "../pages/combos/AdminCombos.jsx";
import AdminCustomers from "../pages/customers/AdminCustomers.jsx";
import AdminPromotions from "../pages/promotions/AdminPromotions.jsx";
import AdminCategories from "../pages/categories/AdminCategories.jsx";


function AdminRoutes() {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="movies" element={<AdminMovies />} />
          <Route path="genres" element={<AdminGenres />} />
          <Route path="cinemas" element={<AdminCinemas />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="seats" element={<AdminSeats />} />
          <Route path="showtimes" element={<AdminShowtimes />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="combos" element={<AdminCombos />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route
            path="reports"
            element={<AdminComingSoon title="Báo cáo thống kê" />}
          />
          <Route
            path="settings"
            element={<AdminComingSoon title="Cài đặt hệ thống" />}
          />
          <Route
            path="*"
            element={<AdminComingSoon title="Không tìm thấy trang" />}
          />
        </Route>
      </Routes>
    );
}

export default AdminRoutes;
