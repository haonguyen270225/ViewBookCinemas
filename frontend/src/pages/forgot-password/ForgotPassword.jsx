
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    ArrowLeft,
    Send,
    CheckCircle,
    AlertCircle
} from "lucide-react";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import "./ForgotPassword.css";

function ForgotPassword() {

    //=================== Khởi tạo State ========================

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    //=================== Xử lý gửi yêu cầu ========================

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");
        setNotice("");

        const trimmedEmail = email.trim();

        //=================== Kiểm tra dữ liệu ========================

        if (!trimmedEmail) {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            setError("Địa chỉ email không hợp lệ.");
            return;
        }

        //=================== Xử lý yêu cầu ========================

        // Chưa kết nối Backend nên chỉ hiển thị thông báo.
        setIsSubmitted(true);

        setNotice(
            "Yêu cầu đã được ghi nhận. Chức năng gửi email đặt lại mật khẩu sẽ hoạt động sau khi kết nối Backend."
        );
    };

    //=================== Quay lại nhập email ========================

    const handleReset = () => {
        setEmail("");
        setError("");
        setNotice("");
        setIsSubmitted(false);
    };

    //=================== Giao diện ========================

    return (
        <>
            <Navbar />

            <main className="forgot-page">

                <div className="forgot-container">

                    {/*=================== Phần giới thiệu ========================*/}

                    <section className="forgot-intro">

                        <div className="forgot-intro-content">

                            <span className="forgot-brand-label">
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>
                                ĐỪNG BỎ LỠ
                                <br />
                                NHỮNG BỘ PHIM
                                <br />
                                <span>YÊU THÍCH</span>
                            </h1>

                            <p>
                                Khôi phục tài khoản của bạn để tiếp tục
                                khám phá những bộ phim hấp dẫn và đặt vé
                                xem phim tại ViewBookCinemas.
                            </p>

                            <div className="forgot-intro-decoration">
                                <i className="bi bi-camera-reels-fill"></i>
                            </div>

                        </div>

                    </section>

                    {/*=================== Phần biểu mẫu ========================*/}

                    <section className="forgot-form-section">

                        <div className="forgot-form-wrapper">

                            {!isSubmitted ? (

                                <>
                                    <div className="forgot-icon">
                                        <Mail size={28} />
                                    </div>

                                    <div className="forgot-heading">

                                        <span className="forgot-subtitle">
                                            KHÔI PHỤC TÀI KHOẢN
                                        </span>

                                        <h2>Quên mật khẩu?</h2>

                                        <p>
                                            Đừng lo lắng! Hãy nhập email
                                            bạn đã sử dụng để đăng ký tài khoản.
                                            Chúng tôi sẽ hỗ trợ bạn khôi phục
                                            mật khẩu.
                                        </p>

                                    </div>

                                    <form
                                        className="forgot-form"
                                        onSubmit={handleSubmit}
                                    >

                                        {/*=================== Email ========================*/}

                                        <div className="forgot-form-group">

                                            <label htmlFor="forgotEmail">
                                                Địa chỉ Email
                                            </label>

                                            <div className="forgot-input-wrapper">

                                                <Mail size={19} />

                                                <input
                                                    type="email"
                                                    id="forgotEmail"
                                                    placeholder="example@email.com"
                                                    value={email}
                                                    onChange={(event) => {
                                                        setEmail(event.target.value);
                                                        setError("");
                                                    }}
                                                    autoComplete="email"
                                                    maxLength={150}
                                                />

                                            </div>

                                            {error && (
                                                <div className="forgot-error">
                                                    <AlertCircle size={16} />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                        </div>

                                        {/*=================== Nút gửi ========================*/}

                                        <button
                                            type="submit"
                                            className="forgot-submit-button"
                                        >
                                            <span>Gửi yêu cầu</span>
                                            <Send size={18} />
                                        </button>

                                    </form>

                                    <Link
                                        to="/login"
                                        className="forgot-back-link"
                                    >
                                        <ArrowLeft size={17} />
                                        Quay lại đăng nhập
                                    </Link>
                                </>

                            ) : (

                                /*=================== Thông báo gửi yêu cầu ========================*/

                                <div className="forgot-success">

                                    <div className="forgot-success-icon">
                                        <CheckCircle size={34} />
                                    </div>

                                    <span className="forgot-subtitle">
                                        YÊU CẦU KHÔI PHỤC
                                    </span>

                                    <h2>Đã tiếp nhận yêu cầu!</h2>

                                    <p>
                                        Địa chỉ email được cung cấp:
                                    </p>

                                    <strong className="forgot-email-display">
                                        {email.trim()}
                                    </strong>

                                    <div className="forgot-notice">
                                        <CheckCircle size={18} />
                                        <span>{notice}</span>
                                    </div>

                                    <p className="forgot-success-description">
                                        Khi kết nối Backend, hệ thống sẽ gửi
                                        hướng dẫn đặt lại mật khẩu đến email
                                        của bạn.
                                    </p>

                                    <button
                                        type="button"
                                        className="forgot-submit-button"
                                        onClick={handleReset}
                                    >
                                        Gửi yêu cầu khác
                                    </button>

                                    <Link
                                        to="/login"
                                        className="forgot-back-link"
                                    >
                                        <ArrowLeft size={17} />
                                        Quay lại đăng nhập
                                    </Link>

                                </div>

                            )}

                        </div>

                    </section>

                </div>

            </main>

            <Footer />
        </>
    );
}

export default ForgotPassword;
