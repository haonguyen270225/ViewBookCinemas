USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Genres
(
    GenreId INT IDENTITY(1,1) NOT NULL,
    GenreName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Status BIT NOT NULL
        CONSTRAINT DF_Genres_Status DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Genres_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Genres PRIMARY KEY (GenreId),
    CONSTRAINT UQ_Genres_GenreName UNIQUE (GenreName)
);
GO