USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Seats
(
    SeatId INT IDENTITY(1,1) NOT NULL,
    RoomId INT NOT NULL,
    SeatTypeId INT NOT NULL,
    SeatRow VARCHAR(5) NOT NULL,
    SeatNumber INT NOT NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Seats_Status DEFAULT 'Active',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Seats_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Seats PRIMARY KEY (SeatId),

    CONSTRAINT FK_Seats_CinemaRooms
        FOREIGN KEY (RoomId)
        REFERENCES dbo.CinemaRooms(RoomId),

    CONSTRAINT FK_Seats_SeatTypes
        FOREIGN KEY (SeatTypeId)
        REFERENCES dbo.SeatTypes(SeatTypeId)
);
GO