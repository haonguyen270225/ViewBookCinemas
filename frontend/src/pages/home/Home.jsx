import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import MovieList from "../../components/movie/MovieList.jsx";
import movies from "../../data/movies.js";

import "./Home.css";

function Home() {
    return (
      <div className="vbc-home">
        <Navbar />

        <main>
          {/* Hero Banner */}
          <section className="home-hero">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-7">
                  <span className="home-hero-label">
                    WELCOME TO VIEWBOOKCINEMAS
                  </span>

                  <h1 className="home-hero-title">
                    Thế giới điện ảnh
                    <span> trong tầm tay bạn.</span>
                  </h1>

                  <p className="home-hero-description">
                    Khám phá những bộ phim hấp dẫn, cập nhật lịch chiếu và đặt
                    vé nhanh chóng tại ViewBookCinemas.
                  </p>

                  <div className="home-hero-actions">
                    <a href="/movies" className="btn btn-danger">
                      Khám phá phim
                    </a>

                    <a href="/showtimes" className="btn btn-outline-light">
                      Xem lịch chiếu
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Movie Section */}
          <section className="container">
            <MovieList
              title="Phim nổi bật"
              subtitle="Khám phá những bộ phim đang được quan tâm tại ViewBookCinemas."
              movies={movies}
              viewAllLink="/movies"
            />
          </section>
          {/* Promotion */}
          <section className="home-promotion">
            <div className="container">
              <div className="home-promotion-content">
                <span>VBC SPECIAL OFFERS</span>

                <h2>
                  Ưu đãi điện ảnh
                  <br />
                  dành riêng cho bạn.
                </h2>

                <p>
                  Theo dõi những chương trình khuyến mãi và ưu đãi hấp dẫn từ
                  ViewBookCinemas.
                </p>

                <a href="/promotions" className="btn btn-light">
                  Khám phá ưu đãi
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
}

export default Home;
