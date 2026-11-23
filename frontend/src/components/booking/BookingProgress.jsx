
function BookingProgress({ activeStep = 1 }) {
    const steps = [
        { number: 1, label: "Chọn ghế" },
        { number: 2, label: "Bắp nước" },
        { number: 3, label: "Thanh toán" },
        { number: 4, label: "Hoàn tất" }
    ];

    return (
        <div className="booking-progress">
            {steps.map((step, index) => {
                const isActive = step.number === activeStep;
                const isCompleted = step.number < activeStep;

                return (
                    <div
                        className={`booking-progress-step ${
                            isActive ? "active" : ""
                        } ${isCompleted ? "completed" : ""}`}
                        key={step.number}
                    >
                        <div className="booking-progress-number">
                            {isCompleted ? (
                                <i className="bi bi-check"></i>
                            ) : (
                                step.number
                            )}
                        </div>

                        <span>{step.label}</span>

                        {index < steps.length - 1 && (
                            <div className="booking-progress-line"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default BookingProgress;
