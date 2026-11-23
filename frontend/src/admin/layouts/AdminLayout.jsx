
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";

import "../styles/admin.css";

function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="admin-layout">
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
                />

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
