USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Combos
(
    ComboId INT IDENTITY(1,1) NOT NULL,
    ComboName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl NVARCHAR(500) NULL,
    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Combos_Status DEFAULT 'Active',
    StartDate DATETIME2 NULL,
    EndDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Combos_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Combos PRIMARY KEY (ComboId)
);
GO