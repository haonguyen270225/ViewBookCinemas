
import { useAuth } from "../../contexts/AuthContext";

function AuthNotification() {
    const {
        notification,
        clearNotification
    } = useAuth();

    if (!notification) {
        return null;
    }

    const alertClass =
        notification.type === "success"
            ? "alert-success"
            : notification.type === "danger"
                ? "alert-danger"
                : "alert-info";

    return (
        <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: 9999, maxWidth: "420px", width: "100%" }}
        >
            <div
                className={`alert ${alertClass} alert-dismissible fade show shadow`}
                role="alert"
            >
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{notification.message}</span>
                </div>

                <button
                    type="button"
                    className="btn-close"
                    aria-label="Đóng thông báo"
                    onClick={clearNotification}
                ></button>
            </div>
        </div>
    );
}

export default AuthNotification;
