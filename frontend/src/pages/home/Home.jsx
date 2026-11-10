
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import MovieList from "../../components/movie/MovieList.jsx";
import HeroBanner from "../../components/home/HeroBanner.jsx";

import movies from "../../data/movies.js";

import "./Home.css";

function Home() {
    return (
      <div className="vbc-home">
        <Navbar />

        <main>
          {/*=================== Hero Banner ========================*/}
          <HeroBanner />

          {/*=================== Movie Sections ========================*/}
          {/* Phim nổi bật */}
          <section className="home-movies">
            <div className="container">
              <MovieList
                title="Phim nổi bật"
                subtitle="Khám phá những bộ phim được quan tâm tại ViewBookCinemas."
                movies={movies}
                viewAllLink="/movies"
                titleTone="featured"
              />
            </div>
          </section>
          {/* Phim đang chiếu */}
          <section className="home-movies">
            <div className="container">
              <MovieList
                title="Phim đang chiếu"
                subtitle="Những bộ phim hiện đang được trình chiếu tại rạp."
                movies={movies.filter((movie) => movie.status === "Đang chiếu")}
                viewAllLink="/movies"
                titleTone="current"
              />
            </div>
          </section>
          {/* Phim sắp chiếu */}
          <section className="home-movies">
            <div className="container">
              <MovieList
                title="Phim sắp chiếu"
                subtitle="Cập nhật những bộ phim sắp ra mắt tại ViewBookCinemas."
                movies={movies.filter((movie) => movie.status === "Sắp chiếu")}
                viewAllLink="/movies"
                titleTone="upcoming"
              />
            </div>
          </section>
          {/*=================== Promotion ========================*/}
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
