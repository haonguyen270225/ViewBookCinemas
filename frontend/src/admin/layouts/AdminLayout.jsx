
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";

import "../styles/admin.css";

function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Đọc giao diện đã lưu, mặc định là Light Mode
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("admin-theme") || "light";
    });

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleToggleTheme = () => {
        setTheme((currentTheme) => {
            const newTheme =
                currentTheme === "light" ? "dark" : "light";

            localStorage.setItem("admin-theme", newTheme);

            return newTheme;
        });
    };

    return (
        <div className="admin-layout" data-theme={theme}>
            <AdminSidebar
                isOpen={isSidebarOpen}
                onNavigate={handleCloseSidebar}
            />

            {isSidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={handleCloseSidebar}
                />
            )}

            <div className="admin-main">
                <AdminHeader
                    onMenuClick={() =>
                        setIsSidebarOpen(!isSidebarOpen)
                    }
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                />

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
