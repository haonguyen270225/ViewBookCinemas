
function ShowtimeSummary({ movie, cinema, showtime, room }) {
    const formatDate = (dateTime) => {
        return new Date(dateTime).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    return (
        <section className="booking-showtime">
            <div className="booking-showtime-poster">
                <img src={movie.poster} alt={movie.title} />
            </div>

            <div className="booking-showtime-info">
                <span className="booking-showtime-label">
                    THÔNG TIN SUẤT CHIẾU
                </span>

                <h2>{movie.title}</h2>

                <div className="booking-showtime-details">
                    <p>
                        <i className="bi bi-geo-alt-fill"></i>
                        {cinema.name}
                    </p>

                    <p>
                        <i className="bi bi-door-open-fill"></i>
                        {room.roomName} - {room.roomType}
                    </p>

                    <p>
                        <i className="bi bi-calendar-event"></i>
                        {formatDate(showtime.startTime)}
                    </p>

                    <p>
                        <i className="bi bi-clock-fill"></i>
                        {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                    </p>

                    <p>
                        <i className="bi bi-film"></i>
                        {showtime.movieVersion}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ShowtimeSummary;
