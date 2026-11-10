import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import logo from "../../assets/images/ViewBookCinemas_Logo.svg";
import "./Navbar.css";

//=================== Khóa lưu trữ giao diện ========================

const THEME_KEY = "vbc_theme";
const LOGIN_HINT_KEY = "vbc_login_hint_dismissed";

//=================== Component Navbar ========================

function Navbar() {
    const navigate = useNavigate();

    //=================== Khởi tạo trạng thái ========================

    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [theme, setTheme] = useState(() =>
      localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light",
    );
    const [isHintDismissed, setIsHintDismissed] = useState(
        () => localStorage.getItem(LOGIN_HINT_KEY) === "true"
    );
    const [showLoginHint, setShowLoginHint] = useState(false);

    const searchWrapperRef = useRef(null);
    const searchInputRef = useRef(null);

    //=================== Đồng bộ giao diện toàn website ========================

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    //=================== Focus ô tìm kiếm khi mở ========================

    useEffect(() => {
        if (isSearchOpen) searchInputRef.current?.focus();
    }, [isSearchOpen]);

    //=================== Đóng tìm kiếm khi nhấn ngoài hoặc Escape ========================

    useEffect(() => {
        if (!isSearchOpen) return;

        const handleOutsideClick = (event) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") setIsSearchOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isSearchOpen]);

    //=================== Chuyển đổi giao diện ========================

    const handleToggleTheme = () => {
        setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
    };

    //=================== Xử lý tìm kiếm ========================

    const handleSearch = (event) => {
        event.preventDefault();
        const keyword = searchTerm.trim();

        if (!keyword) {
            searchInputRef.current?.focus();
            return;
        }

        navigate(`/movies?search=${encodeURIComponent(keyword)}`);
        setSearchTerm("");
        setIsSearchOpen(false);
    };

    //=================== Đóng tìm kiếm ========================

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        setSearchTerm("");
    };

    //=================== Hiển thị thông báo đăng nhập ========================

    const handleShowLoginHint = () => {
        if (!isHintDismissed) setShowLoginHint(true);
    };

    //=================== Đóng thông báo đăng nhập ========================

    const handleDismissHint = () => {
        localStorage.setItem(LOGIN_HINT_KEY, "true");
        setIsHintDismissed(true);
        setShowLoginHint(false);
    };

    //=================== Giao diện Navbar ========================

    return (
        <nav className="navbar navbar-expand-lg vbc-navbar sticky-top">
            <div className="container">

                {/*=================== Logo và thương hiệu ========================*/}

                <Link to="/" className="navbar-brand vbc-brand">
                    <img src={logo} alt="ViewBookCinemas Logo" className="vbc-navbar-logo" />
                    <span className="vbc-brand-name">ViewBookCinemas</span>
                </Link>

                {/*=================== Nút menu điện thoại ========================*/}

                <button
                    className="navbar-toggler vbc-navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#vbcNavbar"
                    aria-controls="vbcNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="vbcNavbar">

                    {/*=================== Menu ========================*/}

                    <ul className="navbar-nav mx-auto vbc-nav-links">
                        <li className="nav-item">
                            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                                Trang chủ
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                                Phim
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/showtimes" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                                Lịch chiếu
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/cinemas" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                                Rạp chiếu
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/promotions" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                                Khuyến mãi
                            </NavLink>
                        </li>
                    </ul>

                    {/*=================== Tìm kiếm và tài khoản ========================*/}

                    <div className="vbc-navbar-actions">

                        {/*=================== Tìm kiếm dạng icon ========================*/}

                        <div
                            className={`vbc-search-box ${isSearchOpen ? "is-open" : ""}`}
                            ref={searchWrapperRef}
                        >
                            <form className="vbc-search" onSubmit={handleSearch} role="search">
                                <button
                                    type={isSearchOpen ? "submit" : "button"}
                                    className="vbc-search-toggle"
                                    onClick={!isSearchOpen ? () => setIsSearchOpen(true) : undefined}
                                    aria-label={isSearchOpen ? "Tìm kiếm phim" : "Mở tìm kiếm phim"}
                                    title="Tìm kiếm phim"
                                >
                                    <i className="bi bi-search"></i>
                                </button>

                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    placeholder="Tìm kiếm phim..."
                                    aria-label="Tìm kiếm phim"
                                    value={searchTerm}
                                    tabIndex={isSearchOpen ? 0 : -1}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />

                                {isSearchOpen && (
                                    <button
                                        type="button"
                                        className="vbc-search-close"
                                        onClick={handleCloseSearch}
                                        aria-label="Đóng tìm kiếm"
                                        title="Đóng"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </form>
                        </div>

                        {/*=================== Chuyển đổi giao diện ========================*/}

                        <button
                            type="button"
                            className="vbc-theme-toggle"
                            onClick={handleToggleTheme}
                            aria-label={theme === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"}
                            title={theme === "light" ? "Bật giao diện tối" : "Bật giao diện sáng"}
                        >
                            <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"}`}></i>
                        </button>

                        {/*=================== Đăng nhập ========================*/}

                        <div
                            className="vbc-login-wrapper"
                            onMouseEnter={handleShowLoginHint}
                            onMouseLeave={() => setShowLoginHint(false)}
                            onFocus={handleShowLoginHint}
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) {
                                    setShowLoginHint(false);
                                }
                            }}
                        >
                            <Link to="/login" className="vbc-login-button">
                                Đăng nhập
                            </Link>

                            {/*=================== Thông báo đăng nhập ========================*/}

                            {showLoginHint && !isHintDismissed && (
                                <div className="vbc-login-hint">
                                    <button
                                        type="button"
                                        className="vbc-login-hint__close"
                                        onClick={handleDismissHint}
                                        aria-label="Đóng thông báo"
                                        title="Đóng thông báo"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>

                                    <h6>Chào mừng bạn đến với VBC!</h6>

                                    <p>
                                        Đăng nhập để nhận ưu đãi thành viên,
                                        hoặc đăng ký để trải nghiệm dịch vụ
                                        đặt vé dễ dàng hơn.
                                    </p>

                                    <Link to="/register" className="vbc-login-hint__link">
                                        Đăng ký ngay
                                        <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/*=================== Đăng ký ========================*/}

                        <Link to="/register" className="vbc-register-button">
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
