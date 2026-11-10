CREATE TABLE dbo.Tickets
(
    TicketId INT IDENTITY(1,1) PRIMARY KEY,

    BookingSeatId INT NOT NULL UNIQUE,

    TicketCode VARCHAR(50) NOT NULL UNIQUE,

    QRCode NVARCHAR(500) NULL,

    IssuedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    TicketStatus VARCHAR(20) NOT NULL
        DEFAULT 'Valid',

    CheckedInAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Tickets_BookingSeats
        FOREIGN KEY (BookingSeatId)
        REFERENCES dbo.BookingSeats(BookingSeatId)
);
GO