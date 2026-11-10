USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.BookingSeats
(
    BookingSeatId INT IDENTITY(1,1) PRIMARY KEY,

    BookingId INT NOT NULL,
    ShowtimeSeatId INT NOT NULL,

    TicketPrice DECIMAL(10,2) NOT NULL,

    CreatedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_BookingSeats_Bookings
        FOREIGN KEY (BookingId)
        REFERENCES dbo.Bookings(BookingId),

    CONSTRAINT FK_BookingSeats_ShowtimeSeat
        FOREIGN KEY (ShowtimeSeatId)
        REFERENCES dbo.ShowtimeSeat(ShowtimeSeatId)
);
GO