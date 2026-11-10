
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

                {/*=================== Movie Section ========================*/}
                <section className="home-movies">
                    <div className="container">
                        <MovieList
                            title="Phim nổi bật"
                            subtitle="Khám phá những bộ phim đang được quan tâm tại ViewBookCinemas."
                            movies={movies}
                            viewAllLink="/movies"
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
                                Theo dõi những chương trình khuyến mãi và ưu đãi
                                hấp dẫn từ ViewBookCinemas.
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
