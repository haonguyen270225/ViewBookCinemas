USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Bookings
(
    BookingId INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    BookingCode VARCHAR(50) NOT NULL UNIQUE,

    BookingDate DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    TicketAmount DECIMAL(12,2) NOT NULL
        DEFAULT 0,

    ProductAmount DECIMAL(12,2) NOT NULL
        DEFAULT 0,

    DiscountAmount DECIMAL(12,2) NOT NULL
        DEFAULT 0,

    TotalAmount DECIMAL(12,2) NOT NULL
        DEFAULT 0,

    BookingStatus VARCHAR(20) NOT NULL
        DEFAULT 'Pending',

    PaymentStatus VARCHAR(20) NOT NULL
        DEFAULT 'Unpaid',

    ExpiredAt DATETIME2 NULL,

    ConfirmedAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Bookings_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
);
GO