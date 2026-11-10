USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.ShowtimeSeat
(
    ShowtimeSeatId INT IDENTITY(1,1) NOT NULL,
    ShowtimeId INT NOT NULL,
    SeatId INT NOT NULL,

    SeatStatus VARCHAR(20) NOT NULL
        CONSTRAINT DF_ShowtimeSeat_SeatStatus DEFAULT 'Available',

    HoldExpiredAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ShowtimeSeat_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_ShowtimeSeat PRIMARY KEY (ShowtimeSeatId),

    CONSTRAINT FK_ShowtimeSeat_Showtimes
        FOREIGN KEY (ShowtimeId)
        REFERENCES dbo.Showtimes(ShowtimeId),

    CONSTRAINT FK_ShowtimeSeat_Seats
        FOREIGN KEY (SeatId)
        REFERENCES dbo.Seats(SeatId)
);
GO