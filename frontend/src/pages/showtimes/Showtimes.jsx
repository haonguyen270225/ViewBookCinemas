
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

import movies from "../../data/movies.js";
import { cinemas, showtimes } from "../../data/showtimes.js";

import "./Showtimes.css";

//=================== Component Showtimes ========================

function Showtimes() {
    const navigate = useNavigate();

    //=================== Khởi tạo trạng thái ========================

    const [selectedCinema, setSelectedCinema] = useState(1);

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
    });

    //=================== Lấy thông tin rạp đang chọn ========================

    const currentCinema = cinemas.find(
        (cinema) => cinema.id === Number(selectedCinema)
    );

    //=================== Tạo đường dẫn Google Maps ========================

    const cinemaAddress = currentCinema?.address || "";

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
        cinemaAddress
    )}&output=embed`;

    const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        cinemaAddress
    )}`;

    //=================== Tạo danh sách ngày chiếu ========================

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return {
                value: `${year}-${month}-${day}`,
                day: index === 0
                    ? "Hôm nay"
                    : date.toLocaleDateString("vi-VN", {
                        weekday: "short"
                    }),
                date: `${day}/${month}`,
                isToday: index === 0
            };
        });
    }, []);

    //=================== Lọc lịch chiếu ========================

    const filteredShowtimes = useMemo(() => {
        return showtimes.filter((showtime) => {
            const showDate = showtime.startTime.substring(0, 10);

            return (
                showtime.cinemaId === Number(selectedCinema) &&
                showDate === selectedDate &&
                showtime.status === "Scheduled"
            );
        });
    }, [selectedCinema, selectedDate]);

    //=================== Gom lịch chiếu theo phim ========================

    const movieSchedules = useMemo(() => {
        return movies
            .map((movie) => ({
                ...movie,
                schedules: filteredShowtimes
                    .filter((showtime) => showtime.movieId === movie.id)
                    .sort((a, b) =>
                        a.startTime.localeCompare(b.startTime)
                    )
            }))
            .filter((movie) => movie.schedules.length > 0);
    }, [filteredShowtimes]);

    //=================== Định dạng thời gian ========================

    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    //=================== Định dạng tiền tệ ========================

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    //=================== Chuyển đến bước đặt vé ========================

    const handleSelectShowtime = (showtime) => {
        navigate(`/booking/${showtime.id}`);
    };

    //=================== Giao diện trang Lịch chiếu ========================

    return (
      <>
        <Navbar />

        <main className="showtimes-page">
          {/*=================== Banner ========================*/}

          <section className="showtimes-hero">
            <div className="container">
              <span>VIEWBOOKCINEMAS</span>
              <h1>LỊCH CHIẾU PHIM</h1>
              <p>
                Chọn rạp, ngày chiếu và suất chiếu phù hợp để tận hưởng những bộ
                phim yêu thích.
              </p>
            </div>
          </section>

          <section className="container showtimes-content">
            {/*=================== Chọn rạp ========================*/}

            <div className="showtimes-section cinema-section">
              <h2>
                <i className="bi bi-geo-alt-fill"></i>
                Chọn rạp chiếu
              </h2>

              <div className="cinema-select-wrapper">
                <i className="bi bi-buildings cinema-select-icon"></i>

                <select
                  value={selectedCinema}
                  onChange={(event) =>
                    setSelectedCinema(Number(event.target.value))
                  }
                  aria-label="Chọn rạp chiếu"
                >
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>

                <i className="bi bi-chevron-down cinema-select-arrow"></i>
              </div>

              {/*=================== Thông tin rạp và Google Maps ========================*/}

              <div className="cinema-location-layout">
                <div className="cinema-location-info">
                  <h3>
                    <i className="bi bi-buildings"></i>
                    Thông tin rạp
                  </h3>

                  <p className="cinema-location-name">{currentCinema?.name}</p>

                  <div className="cinema-address">
                    <i className="bi bi-geo-alt-fill"></i>
                    <span>{currentCinema?.address}</span>
                  </div>

                  <a
                    href={directionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cinema-direction-link"
                  >
                    <i className="bi bi-sign-turn-right"></i>
                    Chỉ đường đến rạp
                  </a>
                </div>

                <div className="cinema-map">
                  <iframe
                    title={`Bản đồ ${currentCinema?.name || "rạp chiếu phim"}`}
                    src={mapUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  ></iframe>

                  <a
                    href={directionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cinema-map-button"
                  >
                    <i className="bi bi-map"></i>
                    Xem Google Maps
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>
              </div>
            </div>

            {/*=================== Chọn ngày chiếu ========================*/}

            <div className="showtimes-section date-section">
              <h2>
                <i className="bi bi-calendar-event"></i>
                Chọn ngày chiếu
              </h2>

              <div className="showtimes-date-list">
                {dates.map((date) => {
                  const isActive = selectedDate === date.value;

                  return (
                    <button
                      key={date.value}
                      type="button"
                      className={`showtimes-date-item ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setSelectedDate(date.value)}
                    >
                      <span className="showtimes-date-label">
                        {date.isToday && (
                          <i className="bi bi-calendar-check"></i>
                        )}
                        {date.day}
                      </span>

                      <strong>{date.date}</strong>

                      {isActive && (
                        <i className="bi bi-check-circle-fill date-selected-icon"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/*=================== Danh sách lịch chiếu ========================*/}

            <div className="showtimes-list-section">
              <div className="showtimes-list-heading">
                <div>
                  <h2>Danh sách suất chiếu</h2>

                  <p>
                    <i className="bi bi-geo-alt-fill"></i>
                    {currentCinema?.name}
                  </p>
                </div>

                <span className="showtimes-count">
                  {filteredShowtimes.length} suất chiếu
                </span>
              </div>

              {movieSchedules.length > 0 ? (
                <div className="showtimes-movie-list">
                  {movieSchedules.map((movie) => (
                    <article className="showtimes-movie-card" key={movie.id}>
                      <div className="showtimes-movie-poster">
                        <img src={movie.poster} alt={movie.title} />
                      </div>

                      <div className="showtimes-movie-info">
                        <h3>{movie.title}</h3>

                        <div className="showtimes-movie-meta">
                          <span>{movie.ageRating}</span>
                          <span>
                            <i className="bi bi-clock"></i>
                            {movie.duration} phút
                          </span>
                          <span>{movie.genres?.join(", ")}</span>
                        </div>

                        <div className="showtimes-session-list">
                          {movie.schedules.map((showtime) => (
                            <button
                              type="button"
                              className="showtime-session"
                              key={showtime.id}
                              onClick={() => handleSelectShowtime(showtime)}
                            >
                              <strong>
                                <i className="bi bi-clock"></i>
                                {formatTime(showtime.startTime)}
                              </strong>

                              <span>{showtime.movieVersion}</span>

                              <small>
                                <i className="bi bi-door-open"></i>
                                {showtime.roomName}
                                <span className="session-dot">·</span>
                                {formatPrice(showtime.basePrice)}
                              </small>
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="showtimes-empty">
                  <i className="bi bi-calendar-x"></i>
                  <h3>Chưa có lịch chiếu</h3>
                  <p>Không tìm thấy suất chiếu tại rạp vào ngày bạn đã chọn.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
}

export default Showtimes;
