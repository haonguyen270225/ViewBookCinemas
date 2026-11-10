USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Showtimes
(
    ShowtimeId INT IDENTITY(1,1) NOT NULL,
    MovieVersionId INT NOT NULL,
    RoomId INT NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    BasePrice DECIMAL(10,2) NOT NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Showtimes_Status DEFAULT 'Scheduled',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Showtimes_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Showtimes PRIMARY KEY (ShowtimeId),

    CONSTRAINT FK_Showtimes_MovieVersions
        FOREIGN KEY (MovieVersionId)
        REFERENCES dbo.MovieVersions(MovieVersionId),

    CONSTRAINT FK_Showtimes_CinemaRooms
        FOREIGN KEY (RoomId)
        REFERENCES dbo.CinemaRooms(RoomId)
);
GO