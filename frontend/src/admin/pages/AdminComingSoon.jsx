function AdminComingSoon({ title = "Chức năng quản lý" }) {
    return (
        <div className="admin-coming-soon">
            <div className="admin-coming-soon-icon">
                <i className="bi bi-cone-striped"></i>
            </div>

            <h3>{title}</h3>

            <p>
                Chức năng này đang trong quá trình phát triển.
                Vui lòng quay lại sau.
            </p>
        </div>
    );
}

export default AdminComingSoon;
