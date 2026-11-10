
import { useState } from "react";
import { Link } from "react-router-dom";

//=================== Import Components ========================

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

//=================== Import CSS ========================

import "./Login.css";

//=================== Component Login ========================

function Login() {
    const [formData, setFormData] = useState({
        account: "",
        password: "",
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");

    //=================== Cập nhật dữ liệu Form ========================

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));

        setNotice("");
    };

    //=================== Kiểm tra dữ liệu Form ========================

    const validateForm = () => {
        const newErrors = {};

        if (!formData.account.trim()) {
            newErrors.account =
                "Vui lòng nhập tên đăng nhập hoặc địa chỉ Email.";
        }

        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu.";
        }

        return newErrors;
    };

    //=================== Xử lý đăng nhập ========================

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        //=================== Chưa kết nối Backend ========================

        setNotice(
            "Thông tin hợp lệ. Chức năng đăng nhập sẽ hoạt động sau khi kết nối Backend."
        );

        console.log("Login form:", {
            account: formData.account,
            rememberMe: formData.rememberMe
        });
    };

    //=================== Giao diện Login ========================

    return (
        <>
            <Navbar />

            <main className="login-page">
                <div className="login-container">

                    {/*=================== Login Introduction ========================*/}

                    <div className="login-introduction">
                        <div className="login-introduction-content">
                            <span className="login-brand-label">
                                <i className="bi bi-camera-reels-fill"></i>
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>
                                CHÀO MỪNG
                                <span> TRỞ LẠI RẠP PHIM</span>
                            </h1>

                            <p>
                                Đăng nhập để tiếp tục hành trình điện ảnh,
                                khám phá những bộ phim mới và quản lý
                                các vé xem phim của bạn.
                            </p>

                            <div className="login-benefits">
                                <div>
                                    <i className="bi bi-ticket-perforated"></i>
                                    <span>Đặt vé nhanh chóng và thuận tiện</span>
                                </div>

                                <div>
                                    <i className="bi bi-person-check"></i>
                                    <span>Quản lý tài khoản cá nhân</span>
                                </div>

                                <div>
                                    <i className="bi bi-gift"></i>
                                    <span>Không bỏ lỡ các ưu đãi hấp dẫn</span>
                                </div>
                            </div>
                        </div>

                        <div className="login-decoration">
                            <i className="bi bi-film"></i>
                        </div>
                    </div>

                    {/*=================== Login Form ========================*/}

                    <div className="login-form-section">
                        <div className="login-form-wrapper">

                            <div className="login-heading">
                                <span>THÀNH VIÊN VIEWBOOKCINEMAS</span>
                                <h2>Đăng nhập</h2>
                                <p>
                                    Nhập thông tin tài khoản để tiếp tục.
                                </p>
                            </div>

                            <form
                                className="login-form"
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                {/*=================== Account ========================*/}

                                <div className="login-form-group">
                                    <label htmlFor="account">
                                        Tên đăng nhập hoặc Email
                                        <span>*</span>
                                    </label>

                                    <div className="login-input-wrapper">
                                        <i className="bi bi-person"></i>

                                        <input
                                            type="text"
                                            id="account"
                                            name="account"
                                            placeholder="Nhập tên đăng nhập hoặc Email"
                                            value={formData.account}
                                            onChange={handleChange}
                                            autoComplete="username"
                                            className={
                                                errors.account ? "is-invalid" : ""
                                            }
                                        />
                                    </div>

                                    {errors.account && (
                                        <small className="login-error">
                                            {errors.account}
                                        </small>
                                    )}
                                </div>

                                {/*=================== Password ========================*/}

                                <div className="login-form-group">
                                    <label htmlFor="password">
                                        Mật khẩu
                                        <span>*</span>
                                    </label>

                                    <div className="login-input-wrapper">
                                        <i className="bi bi-lock"></i>

                                        <input
                                            type={
                                                showPassword ? "text" : "password"
                                            }
                                            id="password"
                                            name="password"
                                            placeholder="Nhập mật khẩu"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                            className={
                                                errors.password ? "is-invalid" : ""
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="login-password-toggle"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            title={
                                                showPassword
                                                    ? "Ẩn mật khẩu"
                                                    : "Hiện mật khẩu"
                                            }
                                        >
                                            <i
                                                className={
                                                    showPassword
                                                        ? "bi bi-eye-slash"
                                                        : "bi bi-eye"
                                                }
                                            ></i>
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <small className="login-error">
                                            {errors.password}
                                        </small>
                                    )}
                                </div>

                                {/*=================== Remember Me ========================*/}

                                <div className="login-options">
                                    <label className="login-remember">
                                        <input
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                        />

                                        <span>Ghi nhớ đăng nhập</span>
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="login-forgot-link"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                {/*=================== Notice ========================*/}

                                {notice && (
                                    <div className="login-notice">
                                        <i className="bi bi-info-circle"></i>
                                        {notice}
                                    </div>
                                )}

                                {/*=================== Submit Button ========================*/}

                                <button
                                    type="submit"
                                    className="login-submit-button"
                                >
                                    Đăng nhập
                                    <i className="bi bi-arrow-right"></i>
                                </button>

                                {/*=================== Register Link ========================*/}

                                <div className="login-register-link">
                                    Bạn chưa có tài khoản?
                                    <Link to="/register"> Đăng ký ngay</Link>
                                </div>

                                {/*=================== Security Information ========================*/}

                                <div className="login-security">
                                    <i className="bi bi-shield-lock"></i>
                                    Thông tin tài khoản của bạn được bảo vệ.
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Login;
