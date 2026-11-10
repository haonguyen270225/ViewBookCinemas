CREATE TABLE dbo.Payments
(
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,

    BookingId INT NOT NULL,

    PaymentCode VARCHAR(50) NOT NULL UNIQUE,

    PaymentMethod VARCHAR(30) NOT NULL,

    PaymentProvider VARCHAR(50) NULL,

    TransactionCode VARCHAR(100) NULL,

    Amount DECIMAL(12,2) NOT NULL,

    PaymentStatus VARCHAR(20) NOT NULL
        DEFAULT 'Pending',

    PaidAt DATETIME2 NULL,

    FailureReason NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Payments_Bookings
        FOREIGN KEY (BookingId)
        REFERENCES dbo.Bookings(BookingId)
);
GO