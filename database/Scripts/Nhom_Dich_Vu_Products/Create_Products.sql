USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.Products
(
    ProductId INT IDENTITY(1,1) NOT NULL,
    CategoryId INT NOT NULL,
    ProductName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl NVARCHAR(500) NULL,

    StockQuantity INT NOT NULL
        CONSTRAINT DF_Products_StockQuantity DEFAULT 0,

    Status VARCHAR(20) NOT NULL
        CONSTRAINT DF_Products_Status DEFAULT 'Active',

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Products_CreatedAt DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_Products PRIMARY KEY (ProductId),

    CONSTRAINT FK_Products_ProductsCategories
        FOREIGN KEY (CategoryId)
        REFERENCES dbo.ProductsCategories(CategoryId)
);
GO