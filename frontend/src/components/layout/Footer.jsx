
import { Link } from "react-router-dom";
import logo from "../../assets/images/ViewBookCinemas_Logo.svg";
import "./Footer.css";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="vbc-footer">
            <div className="container">
                <div className="row gy-4">

                    {/* Thông tin thương hiệu */}
                    <div className="col-lg-4 col-md-6">
                        <Link to="/" className="vbc-footer-brand">
                            <img
                                src={logo}
                                alt="ViewBookCinemas Logo"
                                className="vbc-footer-logo"
                            />

                            <span>ViewBookCinemas</span>
                        </Link>

                        <p className="vbc-footer-description">
                            Mang đến trải nghiệm xem phim tuyệt vời
                            với dịch vụ đặt vé trực tuyến nhanh chóng,
                            tiện lợi và dễ dàng.
                        </p>

                        <div className="vbc-footer-social">
                            <a
                                href="https://www.facebook.com/your-page"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                                className="vbc-social-link facebook"
                            >
                                <i className="bi bi-facebook"></i>
                            </a>

                            <a
                                href="https://zalo.me/your-id"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Zalo"
                                className="vbc-social-link zalo"
                            >
                                <span>Zalo</span>
                            </a>

                            <a
                                href="https://www.tiktok.com/@your-page"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="TikTok"
                                className="vbc-social-link tiktok"
                            >
                                <i className="bi bi-tiktok"></i>
                            </a>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div className="col-lg-2 col-md-6">
                        <h5 className="vbc-footer-heading">
                            Liên kết nhanh
                        </h5>

                        <ul className="vbc-footer-links">
                            <li><Link to="/">Trang chủ</Link></li>
                            <li><Link to="/movies">Phim đang chiếu</Link></li>
                            <li><Link to="/showtimes">Lịch chiếu</Link></li>
                            <li><Link to="/cinemas">Rạp chiếu phim</Link></li>
                            <li><Link to="/promotions">Khuyến mãi</Link></li>
                        </ul>
                    </div>

                    {/* Hỗ trợ khách hàng */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="vbc-footer-heading">
                            Hỗ trợ khách hàng
                        </h5>

                        <ul className="vbc-footer-links">
                            <li><Link to="/contact">Liên hệ với chúng tôi</Link></li>
                            <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
                            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                        </ul>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="vbc-footer-heading">
                            Thông tin liên hệ
                        </h5>

                        <ul className="vbc-footer-contact">
                            <li>
                                <i className="bi bi-geo-alt-fill"></i>
                                <span>Địa chỉ: Việt Nam</span>
                            </li>

                            <li>
                                <i className="bi bi-telephone-fill"></i>
                                <a href="tel:0123456789">
                                    0123 456 789
                                </a>
                            </li>

                            <li>
                                <i className="bi bi-envelope-fill"></i>
                                <a href="mailto:support@viewbookcinemas.com">
                                    support@viewbookcinemas.com
                                </a>
                            </li>

                            <li>
                                <i className="bi bi-clock-fill"></i>
                                <span>Hỗ trợ: 08:00 – 22:00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bản quyền */}
                <div className="vbc-footer-bottom">
                    <p>
                        © {currentYear} ViewBookCinemas.
                        All rights reserved.
                    </p>

                    <p>
                        Made with <i className="bi bi-heart-fill"></i> for movie lovers.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
