
import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import MovieList from "../../components/movie/MovieList.jsx";
import HeroBanner from "../../components/home/HeroBanner.jsx";

import { getMovies } from "../../services/movieService.js";

import "./Home.css";

function Home() {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadTrigger, setReloadTrigger] = useState(0);

    //=================== Lấy danh sách phim ========================

    useEffect(() => {
        let isMounted = true;

        const fetchMovies = async () => {
            try {
                setIsLoading(true);
                setError("");

                const moviesData = await getMovies();

                if (isMounted) {
                    setMovies(moviesData);
                }
            } catch (error) {
                console.error("Không thể tải danh sách phim:", error);

                if (isMounted) {
                    setError(
                        error.message ||
                        "Không thể tải danh sách phim. Vui lòng thử lại."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMovies();

        return () => {
            isMounted = false;
        };
    }, [reloadTrigger]);

    //=================== Phân loại phim ========================

    const nowShowingMovies = useMemo(
        () => movies.filter((movie) => movie.status === "Đang chiếu"),
        [movies]
    );

    const upcomingMovies = useMemo(
        () => movies.filter((movie) => movie.status === "Sắp chiếu"),
        [movies]
    );

    //=================== Thử tải lại dữ liệu ========================

    const handleRetry = () => {
        setReloadTrigger((prev) => prev + 1);
    };

    return (
        <div className="vbc-home">
            <Navbar />

            <main>
                {/*=================== Hero Banner ========================*/}

                <HeroBanner />

                {/*=================== Movie Sections ========================*/}

                {isLoading ? (
                    <section className="home-movies">
                        <div className="container text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="mt-3">
                                Đang tải danh sách phim...
                            </p>
                        </div>
                    </section>
                ) : error ? (
                    <section className="home-movies">
                        <div className="container text-center py-5">
                            <h4>Không thể tải danh sách phim!</h4>

                            <p>{error}</p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleRetry}
                            >
                                Thử lại
                            </button>
                        </div>
                    </section>
                ) : (
                    <>
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
                                    movies={nowShowingMovies}
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
                                    movies={upcomingMovies}
                                    viewAllLink="/movies"
                                    titleTone="upcoming"
                                />
                            </div>
                        </section>
                    </>
                )}

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
