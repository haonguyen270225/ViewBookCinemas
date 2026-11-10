USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.ProductsCategories
(
    CategoryId INT IDENTITY(1,1) NOT NULL,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,

    Status BIT NOT NULL
        CONSTRAINT DF_ProductsCategories_Status DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ProductsCategories_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_ProductsCategories PRIMARY KEY (CategoryId),

    CONSTRAINT UQ_ProductsCategories_CategoryName UNIQUE (CategoryName)
);
GO