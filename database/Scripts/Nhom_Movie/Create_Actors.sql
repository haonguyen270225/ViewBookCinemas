USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Actors
(
    ActorId INT IDENTITY(1,1) NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    Biography NVARCHAR(MAX) NULL,
    DateOfBirth DATE NULL,
    Gender VARCHAR(10) NULL,
    Nationality NVARCHAR(100) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Actors_Status DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Actors_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Actors PRIMARY KEY (ActorId)
);
GO