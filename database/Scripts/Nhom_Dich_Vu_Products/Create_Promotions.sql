USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Promotions
(
    PromotionId INT IDENTITY(1,1) PRIMARY KEY,

    PromotionCode VARCHAR(50) NOT NULL UNIQUE,

    PromotionName NVARCHAR(200) NOT NULL,

    Description NVARCHAR(1000) NULL,

    DiscountType VARCHAR(20) NOT NULL,

    DiscountValue DECIMAL(10,2) NOT NULL,

    MaxDiscountAmount DECIMAL(10,2) NULL,

    MinOrderAmount DECIMAL(10,2) NOT NULL
        DEFAULT 0,

    StartDate DATETIME2 NOT NULL,

    EndDate DATETIME2 NOT NULL,

    UsageLimit INT NULL,

    UsedCount INT NOT NULL
        DEFAULT 0,

    Status VARCHAR(20) NOT NULL
        DEFAULT 'Active',

    CreatedAt DATETIME2 NOT NULL
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL
);
GO