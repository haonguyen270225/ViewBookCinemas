USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Cinemas
(
    CinemaId INT IDENTITY(1,1) NOT NULL,
    CinemaName NVARCHAR(150) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NULL,
    Ward NVARCHAR(100) NULL,
    PhoneNumber VARCHAR(15) NULL,
    Email VARCHAR(150) NULL,
    Description NVARCHAR(1000) NULL,
    ImageUrl NVARCHAR(500) NULL,
    OpeningTime TIME NULL,
    ClosingTime TIME NULL,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Cinemas_Status DEFAULT 'Active',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Cinemas_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Cinemas PRIMARY KEY (CinemaId)
);
GO