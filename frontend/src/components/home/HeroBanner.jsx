
import { useState } from "react";

function HeroBanner() {
    const [keyword, setKeyword] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();

        if (!keyword.trim()) {
            alert("Vui lòng nhập tên phim!");
            return;
        }

        alert(`Bạn đang tìm kiếm phim: ${keyword}`);
    };

    return (
        <section className="hero-banner">
            <div className="container">
                <div className="row align-items-center min-vh-75">

                    <div className="col-lg-7">
                        <span className="hero-label">
                            WELCOME TO VIEWBOOKCINEMAS
                        </span>

                        <h1 className="hero-title">
                            Trải nghiệm điện ảnh
                            <span> theo cách của bạn</span>
                        </h1>

                        <p className="hero-description">
                            Khám phá những bộ phim hấp dẫn,
                            lựa chọn suất chiếu và đặt vé
                            nhanh chóng tại ViewBookCinemas.
                        </p>

                        <form
                            className="hero-search"
                            onSubmit={handleSearch}
                        >
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập tên phim bạn muốn tìm..."
                                value={keyword}
                                onChange={(event) =>
                                    setKeyword(event.target.value)
                                }
                            />

                            <button className="btn btn-danger">
                                Tìm phim
                            </button>
                        </form>

                    </div>

                </div>
            </div>
        </section>
    );
}

export default HeroBanner;
