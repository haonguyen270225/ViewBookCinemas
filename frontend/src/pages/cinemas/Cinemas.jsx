
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
//=================== Import dữ liệu ========================

import { cinemas } from "../../data/cinemas.js";
import "./Cinemas.css";



//=================== Trang Rạp chiếu ========================

function Cinemas() {

    //=================== Khởi tạo trạng thái ========================

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("Tất cả");

    //=================== Danh sách tỉnh/thành phố ========================

    const provinces = useMemo(() => {
        const allProvinces = cinemas.map(
            (cinema) => cinema.province
        );

        return ["Tất cả", ...new Set(allProvinces)];
    }, []);

    //=================== Xử lý tìm kiếm và lọc rạp ========================

    const filteredCinemas = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return cinemas.filter((cinema) => {

            const matchesSearch =
                cinema.name.toLowerCase().includes(keyword) ||
                cinema.address.toLowerCase().includes(keyword) ||
                cinema.district.toLowerCase().includes(keyword);

            const matchesProvince =
                selectedProvince === "Tất cả" ||
                cinema.province === selectedProvince;

            return matchesSearch && matchesProvince;
        });
    }, [searchTerm, selectedProvince]);

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedProvince("Tất cả");
    };

    //=================== Giao diện trang Cinemas ========================

    return (
        <>
            <Navbar />

            <main className="cinemas-page">

                {/*=================== Hero Banner ========================*/}

                <section className="cinemas-hero">
                    <div className="container">
                        <div className="cinemas-hero-content">

                            <span className="cinemas-hero-label">
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>HỆ THỐNG RẠP CHIẾU</h1>

                            <p>
                                Khám phá hệ thống rạp chiếu của chúng tôi.
                                Tìm địa điểm phù hợp và tận hưởng những
                                trải nghiệm điện ảnh tuyệt vời.
                            </p>

                        </div>
                    </div>
                </section>

                {/*=================== Nội dung trang ========================*/}

                <section className="container cinemas-content">

                    {/*=================== Tiêu đề ========================*/}

                    <div className="cinemas-heading">
                        <div>
                            <h2>Rạp chiếu của chúng tôi</h2>

                            <p>
                                Tìm kiếm rạp chiếu phim theo tên hoặc khu vực.
                            </p>
                        </div>
                    </div>

                    {/*=================== Thanh tìm kiếm và bộ lọc ========================*/}

                    <div className="cinemas-toolbar">

                        <form
                            className="cinemas-search"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <i className="bi bi-search"></i>

                            <input
                                type="search"
                                placeholder="Tìm tên rạp, địa chỉ..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                aria-label="Tìm kiếm rạp chiếu"
                            />
                        </form>

                        <div className="cinemas-filter-control">

                            <label htmlFor="cinemaProvince">
                                Khu vực
                            </label>

                            <select
                                id="cinemaProvince"
                                value={selectedProvince}
                                onChange={(event) =>
                                    setSelectedProvince(event.target.value)
                                }
                            >
                                {provinces.map((province) => (
                                    <option key={province} value={province}>
                                        {province}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <button
                            type="button"
                            className="cinemas-clear-button"
                            onClick={handleClearFilters}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            Xóa bộ lọc
                        </button>

                    </div>

                    {/*=================== Thông tin kết quả ========================*/}

                    <div className="cinemas-result-header">

                        <h3>Danh sách rạp</h3>

                        <span>
                            Tìm thấy{" "}
                            <strong>{filteredCinemas.length}</strong> rạp
                        </span>

                    </div>

                    {/*=================== Danh sách rạp ========================*/}

                    {filteredCinemas.length > 0 ? (

                        <div className="row g-4 cinemas-grid">

                            {filteredCinemas.map((cinema) => {

                                const directionUrl =
                                    `https://www.google.com/maps/dir/?api=1&destination=${
                                        encodeURIComponent(cinema.address)
                                    }`;

                                return (
                                  <div
                                    className="col-12 col-md-6 col-lg-4"
                                    key={cinema.id}
                                  >
                                    <article className="cinema-card">
                                      {/*=================== Hình ảnh rạp ========================*/}

                                      <div className="cinema-card-image">
                                        <img
                                          src={cinema.image}
                                          alt={cinema.name}
                                          loading="lazy"
                                        />

                                        <span className="cinema-status">
                                          <i className="bi bi-circle-fill"></i>
                                          Đang hoạt động
                                        </span>
                                      </div>

                                      {/*=================== Thông tin rạp ========================*/}

                                      <div className="cinema-card-body">
                                        <h4>{cinema.name}</h4>
                                        <p className="cinema-description">
                                          {cinema.description}
                                        </p>
                                        <div className="cinema-info">
                                          <div>
                                            <i className="bi bi-geo-alt-fill"></i>
                                            <span>{cinema.address}</span>
                                          </div>

                                          <div>
                                            <i className="bi bi-telephone-fill"></i>
                                            <span>{cinema.phone}</span>
                                          </div>

                                          <div>
                                            <i className="bi bi-envelope-fill"></i>
                                            <span>{cinema.email}</span>
                                          </div>

                                          <div>
                                            <i className="bi bi-clock-fill"></i>
                                            <span>
                                              {cinema.openingTime} -{" "}
                                              {cinema.closingTime}
                                            </span>
                                          </div>
                                        </div>
                                        {/* =================== Nút chỉ đường ======================== */}
                                        <a
                                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cinema.address)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="cinema-direction-button"
                                          title="Chỉ đường đến rạp"
                                        >
                                          <i className="bi bi-arrow-up-right"></i>
                                          <span>Đường đi</span>
                                        </a>
                                      </div>
                                    </article>
                                  </div>
                                );
                            })}

                        </div>

                    ) : (

                        /*=================== Không tìm thấy rạp ========================*/

                        <div className="cinemas-empty">

                            <i className="bi bi-building"></i>

                            <h4>Không tìm thấy rạp chiếu</h4>

                            <p>
                                Hãy thử thay đổi từ khóa hoặc khu vực tìm kiếm.
                            </p>

                            <button
                                type="button"
                                onClick={handleClearFilters}
                            >
                                Xóa bộ lọc
                            </button>

                        </div>

                    )}

                </section>

            </main>

            <Footer />
        </>
    );
}

export default Cinemas;
