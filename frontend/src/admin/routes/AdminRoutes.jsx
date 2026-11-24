
import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import AdminComingSoon from "../pages/AdminComingSoon.jsx";
import AdminMovies from "../pages/movies/AdminMovies.jsx";
import AdminGenres from "../pages/genres/AdminGenres.jsx";

function AdminRoutes() {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="movies" element={<AdminMovies />} />
          <Route path="genres" element={<AdminGenres />} />

          <Route
            path="cinemas"
            element={<AdminComingSoon title="Quản lý rạp chiếu" />}
          />

          <Route
            path="rooms"
            element={<AdminComingSoon title="Quản lý phòng chiếu" />}
          />

          <Route
            path="seats"
            element={<AdminComingSoon title="Quản lý ghế ngồi" />}
          />

          <Route
            path="showtimes"
            element={<AdminComingSoon title="Quản lý lịch chiếu" />}
          />

          <Route
            path="bookings"
            element={<AdminComingSoon title="Quản lý đặt vé" />}
          />

          <Route
            path="tickets"
            element={<AdminComingSoon title="Quản lý vé" />}
          />

          <Route
            path="payments"
            element={<AdminComingSoon title="Quản lý thanh toán" />}
          />

          <Route
            path="customers"
            element={<AdminComingSoon title="Quản lý khách hàng" />}
          />

          <Route
            path="products"
            element={<AdminComingSoon title="Quản lý sản phẩm" />}
          />

          <Route
            path="categories"
            element={<AdminComingSoon title="Quản lý danh mục" />}
          />

          <Route
            path="combos"
            element={<AdminComingSoon title="Quản lý combo" />}
          />

          <Route
            path="promotions"
            element={<AdminComingSoon title="Quản lý khuyến mãi" />}
          />

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
