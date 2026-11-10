
USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Movies
(
    MovieId INT IDENTITY(1,1) NOT NULL,

    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    DurationMinutes INT NOT NULL,

    ReleaseDate DATE NULL,
    EndDate DATE NULL,

    AgeRating VARCHAR(10) NULL,
    Language NVARCHAR(50) NULL,
    Director NVARCHAR(150) NULL,

    PosterUrl NVARCHAR(500) NULL,
    TrailerUrl NVARCHAR(500) NULL,

    Status VARCHAR(30) NOT NULL
        CONSTRAINT DF_Movies_Status
        DEFAULT 'ComingSoon',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Movies_CreatedAt
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    -- Primary Key
    CONSTRAINT PK_Movies
        PRIMARY KEY (MovieId)
);
GO
