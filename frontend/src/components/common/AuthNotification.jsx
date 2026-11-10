
import { useAuth } from "../../contexts/AuthContext";
import "./AuthNotification.css";

//=================== Component AuthNotification ========================

function AuthNotification() {
    const {
        notification,
        clearNotification
    } = useAuth();

    if (!notification) {
        return null;
    }

    //=================== Xác định loại thông báo ========================

    const isSuccess = notification.type === "success";

    const iconClass = isSuccess
        ? "bi-check-circle-fill"
        : notification.type === "danger"
            ? "bi-exclamation-circle-fill"
            : "bi-info-circle-fill";

    const notificationClass = isSuccess
        ? "success"
        : notification.type === "danger"
            ? "danger"
            : "info";

    const title = isSuccess
        ? "Thành công"
        : notification.type === "danger"
            ? "Có lỗi xảy ra"
            : "Thông báo";

    //=================== Giao diện thông báo ========================

    return (
        <div className="vbc-notification-container">
            <div
                className={`vbc-notification vbc-notification--${notificationClass}`}
                role="alert"
                aria-live="polite"
            >
                <div className="vbc-notification__icon">
                    <i className={`bi ${iconClass}`}></i>
                </div>

                <div className="vbc-notification__content">
                    <h5>{title}</h5>
                    <p>{notification.message}</p>
                </div>

                <button
                    type="button"
                    className="vbc-notification__close"
                    onClick={clearNotification}
                    aria-label="Đóng thông báo"
                    title="Đóng thông báo"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    );
}

export default AuthNotification;
