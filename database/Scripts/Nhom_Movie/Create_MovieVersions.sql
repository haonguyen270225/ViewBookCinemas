CREATE TABLE dbo.MovieVersions
(
    MovieVersionId INT IDENTITY(1,1) NOT NULL,
    MovieId INT NOT NULL,
    VersionName NVARCHAR(100) NOT NULL,
    AudioLanguage NVARCHAR(50) NOT NULL,
    SubtitleLanguage NVARCHAR(50) NULL,
    VersionType VARCHAR(20) NOT NULL,
    Status BIT NOT NULL
        CONSTRAINT DF_MovieVersions_Status DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_MovieVersions_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_MovieVersions
        PRIMARY KEY (MovieVersionId),

    CONSTRAINT FK_MovieVersions_Movies
        FOREIGN KEY (MovieId)
        REFERENCES dbo.Movies(MovieId)
);
GO