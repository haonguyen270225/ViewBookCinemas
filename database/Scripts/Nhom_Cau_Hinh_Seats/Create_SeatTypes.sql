USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.SeatTypes
(
    SeatTypeId INT IDENTITY(1,1) NOT NULL,
    SeatTypeName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(500) NULL,

    AdditionalPrice DECIMAL(10,2) NOT NULL
        CONSTRAINT DF_SeatTypes_AdditionalPrice DEFAULT 0,

    Status BIT NOT NULL
        CONSTRAINT DF_SeatTypes_Status DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_SeatTypes_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_SeatTypes PRIMARY KEY (SeatTypeId),

    CONSTRAINT UQ_SeatTypes_SeatTypeName UNIQUE (SeatTypeName)
);
GO