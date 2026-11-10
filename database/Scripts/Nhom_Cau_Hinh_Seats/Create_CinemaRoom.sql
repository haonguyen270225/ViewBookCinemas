CREATE TABLE dbo.CinemaRoom
(
    RoomId INT IDENTITY(1,1) NOT NULL,
    CinemaId INT NOT NULL,
    RoomName NVARCHAR(100) NOT NULL,
    RoomType VARCHAR(30) NULL,
    Capacity INT NOT NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_CinemaRoom_Status DEFAULT 'Active',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_CinemaRoom_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_CinemaRoom PRIMARY KEY (RoomId),

    CONSTRAINT FK_CinemaRoom_Cinemas
        FOREIGN KEY (CinemaId)
        REFERENCES dbo.Cinemas(CinemaId)
);
GO