
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import MovieCard from "../../components/movie/MovieCard.jsx";
import movies from "../../data/movies.js";

import "./Movies.css";

function Movies() {

    //=================== Khởi tạo dữ liệu và trạng thái ========================

    const [searchParams, setSearchParams] = useSearchParams();

    const urlSearch = searchParams.get("search") || "";

    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedGenre, setSelectedGenre] = useState("Tất cả");
    const [selectedAge, setSelectedAge] = useState("Tất cả");
    const [selectedCountry, setSelectedCountry] = useState("Tất cả");

    //=================== Danh sách dữ liệu bộ lọc ========================

    const genres = useMemo(() => {
        const allGenres = movies.flatMap(
            (movie) => movie.genres || []
        );

        return ["Tất cả", ...new Set(allGenres)];
    }, []);

    const countries = useMemo(() => {
        const allCountries = movies
            .map((movie) => movie.country)
            .filter(Boolean);

        return ["Tất cả", ...new Set(allCountries)].sort(
            (a, b) => a.localeCompare(b, "vi")
        );
    }, []);

    const ageRatings = ["Tất cả", "P", "K", "T13", "T16", "T18"];

    //=================== Đồng bộ tìm kiếm từ Navbar ========================

    useEffect(() => {
        setSearchTerm(urlSearch);
    }, [urlSearch]);

    //=================== Xử lý lọc phim ========================

    const filteredMovies = useMemo(() => {
        return movies.filter((movie) => {

            const keyword = searchTerm.trim().toLowerCase();

            const matchesSearch = movie.title
                .toLowerCase()
                .includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                movie.status === selectedStatus;

            const matchesGenre =
                selectedGenre === "Tất cả" ||
                movie.genres?.includes(selectedGenre);

            const matchesAge =
                selectedAge === "Tất cả" ||
                movie.ageRating === selectedAge;

            const matchesCountry =
                selectedCountry === "Tất cả" ||
                movie.country === selectedCountry;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesGenre &&
                matchesAge &&
                matchesCountry
            );
        });
    }, [
        searchTerm,
        selectedStatus,
        selectedGenre,
        selectedAge,
        selectedCountry
    ]);

    //=================== Xử lý tìm kiếm và URL ========================

    const handleSearch = (event) => {
        event.preventDefault();

        const keyword = searchTerm.trim();
        const newParams = new URLSearchParams(searchParams);

        if (keyword) {
            newParams.set("search", keyword);
        } else {
            newParams.delete("search");
        }

        setSearchParams(newParams);
    };

    //=================== Xóa toàn bộ bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
        setSelectedGenre("Tất cả");
        setSelectedAge("Tất cả");
        setSelectedCountry("Tất cả");
        setSearchParams({});
    };

    //=================== Giao diện trang Movies ========================

    return (
        <>
            <Navbar />

            <main className="movies-page">

                {/*=================== Hero Banner ========================*/}

                <section className="movies-hero">
                    <div className="container">
                        <div className="movies-hero-content">
                            <span className="movies-hero-label">
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>KHÁM PHÁ PHIM</h1>

                            <p>
                                Tìm kiếm những bộ phim hấp dẫn và tận hưởng
                                trải nghiệm điện ảnh tuyệt vời.
                            </p>
                        </div>
                    </div>
                </section>

                {/*=================== Nội dung danh sách phim ========================*/}

                <section className="container movies-content">

                    {/*=================== Tiêu đề trang ========================*/}

                    <div className="movies-heading">
                        <div>
                            <h2>Danh sách phim</h2>

                            <p>
                                Khám phá những bộ phim đang chiếu và sắp ra mắt.
                            </p>
                        </div>
                    </div>

                    {/*=================== Thanh tìm kiếm và bộ lọc ========================*/}

                    <div className="movies-toolbar">

                        {/* Tìm kiếm theo tên phim */}

                        <form
                            className="movies-search"
                            onSubmit={handleSearch}
                        >
                            <i className="bi bi-search"></i>

                            <input
                                type="search"
                                placeholder="Tìm kiếm tên phim..."
                                aria-label="Tìm kiếm tên phim"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />

                            <button type="submit">
                                Tìm kiếm
                            </button>
                        </form>

                        {/* Lọc theo thể loại */}

                        <div className="movies-filter-control">
                            <label htmlFor="movieGenre">
                                Thể loại
                            </label>

                            <select
                                id="movieGenre"
                                value={selectedGenre}
                                onChange={(event) =>
                                    setSelectedGenre(event.target.value)
                                }
                            >
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc theo độ tuổi */}

                        <div className="movies-filter-control">
                            <label htmlFor="movieAge">
                                Độ tuổi
                            </label>

                            <select
                                id="movieAge"
                                value={selectedAge}
                                onChange={(event) =>
                                    setSelectedAge(event.target.value)
                                }
                            >
                                {ageRatings.map((age) => (
                                    <option key={age} value={age}>
                                        {age}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc theo quốc gia */}

                        <div className="movies-filter-control">
                            <label htmlFor="movieCountry">
                                Quốc gia
                            </label>

                            <select
                                id="movieCountry"
                                value={selectedCountry}
                                onChange={(event) =>
                                    setSelectedCountry(event.target.value)
                                }
                            >
                                {countries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/*=================== Lọc theo trạng thái ========================*/}

                    <div className="movies-status-section">
                        <div className="movies-status-group">
                            <span className="movies-status-label">
                                Trạng thái:
                            </span>

                            {["Tất cả", "Đang chiếu", "Sắp chiếu"].map(
                                (status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`movies-filter-button ${
                                            selectedStatus === status
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus(status)
                                        }
                                    >
                                        {status}
                                    </button>
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            className="movies-clear-button"
                            onClick={handleClearFilters}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            Xóa bộ lọc
                        </button>
                    </div>

                    {/*=================== Kết quả tìm kiếm ========================*/}

                    <div className="movies-result-header">
                        <h3>
                            {selectedStatus === "Tất cả"
                                ? "Tất cả phim"
                                : selectedStatus}
                        </h3>

                        <span>
                            Tìm thấy <strong>{filteredMovies.length}</strong> phim
                        </span>
                    </div>

                    {/*=================== Danh sách phim ========================*/}

                    {filteredMovies.length > 0 ? (
                        <div className="row g-4 movies-grid">
                            {filteredMovies.map((movie) => (
                                <div
                                    className="col-6 col-md-4 col-lg-3"
                                    key={movie.id}
                                >
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="movies-empty">
                            <i className="bi bi-film"></i>

                            <h4>Không tìm thấy phim phù hợp</h4>

                            <p>
                                Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
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

export default Movies;
