import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
//=================== Import Components ========================

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

//=================== Import CSS ========================

import "./Register.css";

//=================== Component Register ========================

function Register() {
  const navigate = useNavigate();

  const { register, showNotification } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  //=================== Cập nhật dữ liệu Form ========================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setNotice("");
  };

  //=================== Kiểm tra dữ liệu Form ========================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Họ và tên không được vượt quá 100 ký tự.";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
      newErrors.username =
        "Tên đăng nhập từ 3–50 ký tự, chỉ gồm chữ, số và dấu gạch dưới.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Địa chỉ email không hợp lệ.";
    } else if (formData.email.length > 150) {
      newErrors.email = "Email không được vượt quá 150 ký tự.";
    }

    if (
      formData.phoneNumber &&
      !/^[0-9+().\-\s]{8,15}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn cần đồng ý với điều khoản sử dụng.";
    }

    return newErrors;
  };

  //=================== Xử lý đăng ký ========================

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      // Tạo tài khoản demo
      register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      // Hiển thị thông báo thành công
      showNotification(
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
        "success",
      );

      // Chuyển sang trang đăng nhập
      navigate("/login");
    } catch (error) {
      const message = error.message;

      if (message.includes("Tên đăng nhập")) {
        setErrors((previous) => ({
          ...previous,
          username: message,
        }));
      } else if (message.includes("Email")) {
        setErrors((previous) => ({
          ...previous,
          email: message,
        }));
      } else {
        showNotification(message || "Đăng ký tài khoản thất bại.", "danger");
      }
    }
  };

  //=================== Giao diện Register ========================

  return (
    <>
      <Navbar />

      <main className="register-page">
        <div className="register-container">
          {/*=================== Register Introduction ========================*/}

          <div className="register-introduction">
            <div className="register-introduction-content">
              <span className="register-brand-label">
                <i className="bi bi-camera-reels-fill"></i>
                VIEWBOOKCINEMAS
              </span>

              <h1>
                BẮT ĐẦU
                <span> HÀNH TRÌNH ĐIỆN ẢNH</span>
              </h1>

              <p>
                Tạo tài khoản để khám phá những bộ phim hấp dẫn, đặt vé nhanh
                chóng và tận hưởng nhiều ưu đãi dành riêng cho thành viên.
              </p>

              <div className="register-benefits">
                <div>
                  <i className="bi bi-ticket-perforated"></i>
                  <span>Đặt vé xem phim dễ dàng</span>
                </div>

                <div>
                  <i className="bi bi-gift"></i>
                  <span>Nhận ưu đãi dành cho thành viên</span>
                </div>

                <div>
                  <i className="bi bi-clock-history"></i>
                  <span>Quản lý lịch sử đặt vé</span>
                </div>
              </div>
            </div>

            <div className="register-decoration">
              <i className="bi bi-film"></i>
            </div>
          </div>

          {/*=================== Register Form ========================*/}

          <div className="register-form-section">
            <div className="register-form-wrapper">
              <div className="register-heading">
                <span>CHÀO MỪNG BẠN ĐẾN VỚI VBC</span>
                <h2>Tạo tài khoản</h2>
                <p>Điền thông tin bên dưới để đăng ký thành viên.</p>
              </div>

              <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
              >
                {/*=================== Full Name ========================*/}

                <div className="register-form-group">
                  <label htmlFor="fullName">
                    Họ và tên <span>*</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-person"></i>

                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={handleChange}
                      maxLength={100}
                      className={errors.fullName ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.fullName && (
                    <small className="register-error">{errors.fullName}</small>
                  )}
                </div>

                {/*=================== Username ========================*/}

                <div className="register-form-group">
                  <label htmlFor="username">
                    Tên đăng nhập <span>*</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-at"></i>

                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleChange}
                      maxLength={50}
                      autoComplete="username"
                      className={errors.username ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.username && (
                    <small className="register-error">{errors.username}</small>
                  )}
                </div>

                {/*=================== Email ========================*/}

                <div className="register-form-group">
                  <label htmlFor="email">
                    Địa chỉ Email <span>*</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-envelope"></i>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={150}
                      autoComplete="email"
                      className={errors.email ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.email && (
                    <small className="register-error">{errors.email}</small>
                  )}
                </div>

                {/*=================== Phone Number ========================*/}

                <div className="register-form-group">
                  <label htmlFor="phoneNumber">
                    Số điện thoại
                    <span className="register-optional">(Không bắt buộc)</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-telephone"></i>

                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Nhập số điện thoại"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      maxLength={15}
                      autoComplete="tel"
                      className={errors.phoneNumber ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.phoneNumber && (
                    <small className="register-error">
                      {errors.phoneNumber}
                    </small>
                  )}
                </div>

                {/*=================== Password ========================*/}

                <div className="register-form-group">
                  <label htmlFor="password">
                    Mật khẩu <span>*</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-lock"></i>

                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Tối thiểu 8 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={errors.password ? "is-invalid" : ""}
                    />

                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <i
                        className={
                          showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                        }
                      ></i>
                    </button>
                  </div>

                  {errors.password && (
                    <small className="register-error">{errors.password}</small>
                  )}
                </div>

                {/*=================== Confirm Password ========================*/}

                <div className="register-form-group">
                  <label htmlFor="confirmPassword">
                    Xác nhận mật khẩu <span>*</span>
                  </label>

                  <div className="register-input-wrapper">
                    <i className="bi bi-shield-lock"></i>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={errors.confirmPassword ? "is-invalid" : ""}
                    />

                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      title="Hiện hoặc ẩn mật khẩu"
                    >
                      <i
                        className={
                          showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"
                        }
                      ></i>
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <small className="register-error">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>

                {/*=================== Terms and Conditions ========================*/}

                <div className="register-terms">
                  <label>
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />

                    <span>
                      Tôi đồng ý với <Link to="/terms">Điều khoản sử dụng</Link>{" "}
                      và <Link to="/privacy">Chính sách bảo mật</Link>.
                    </span>
                  </label>

                  {errors.agreeTerms && (
                    <small className="register-error">
                      {errors.agreeTerms}
                    </small>
                  )}
                </div>

                {/*=================== Notice ========================*/}

                {notice && (
                  <div className="register-notice">
                    <i className="bi bi-info-circle"></i>
                    {notice}
                  </div>
                )}

                {/*=================== Submit Button ========================*/}

                <button type="submit" className="register-submit-button">
                  Đăng ký tài khoản
                  <i className="bi bi-arrow-right"></i>
                </button>

                {/*=================== Login Link ========================*/}

                <div className="register-login-link">
                  Đã có tài khoản?
                  <Link to="/login"> Đăng nhập ngay</Link>
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

export default Register;
