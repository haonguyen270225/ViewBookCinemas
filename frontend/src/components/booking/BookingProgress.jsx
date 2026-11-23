
function BookingProgress() {
    const steps = [
        { number: 1, label: "Chọn ghế" },
        { number: 2, label: "Thanh toán" },
        { number: 3, label: "Hoàn tất" }
    ];

    return (
        <div className="booking-progress">
            {steps.map((step, index) => (
                <div
                    className={`booking-progress-step ${
                        index === 0 ? "active" : ""
                    }`}
                    key={step.number}
                >
                    <div className="booking-progress-number">
                        {step.number}
                    </div>

                    <span>{step.label}</span>

                    {index < steps.length - 1 && (
                        <div className="booking-progress-line"></div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default BookingProgress;
