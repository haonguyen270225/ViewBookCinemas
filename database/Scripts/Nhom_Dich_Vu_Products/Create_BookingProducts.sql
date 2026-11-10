CREATE TABLE dbo.BookingProducts
(
    BookingProductId INT IDENTITY(1,1) NOT NULL,
    BookingId INT NOT NULL,
    ProductId INT NULL,
    ComboId INT NULL,
    ItemName NVARCHAR(150) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(12,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_BookingProducts_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT PK_BookingProducts
        PRIMARY KEY (BookingProductId),

    CONSTRAINT FK_BookingProducts_Bookings
        FOREIGN KEY (BookingId)
        REFERENCES dbo.Bookings(BookingId),

    CONSTRAINT FK_BookingProducts_Products
        FOREIGN KEY (ProductId)
        REFERENCES dbo.Products(ProductId),

    CONSTRAINT FK_BookingProducts_Combos
        FOREIGN KEY (ComboId)
        REFERENCES dbo.Combos(ComboId),

    CONSTRAINT CK_BookingProducts_Quantity
        CHECK (Quantity > 0),

    CONSTRAINT CK_BookingProducts_Prices
        CHECK (UnitPrice >= 0 AND TotalPrice >= 0),

    CONSTRAINT CK_BookingProducts_Item
        CHECK (
            (ProductId IS NOT NULL AND ComboId IS NULL)
            OR
            (ProductId IS NULL AND ComboId IS NOT NULL)
        )
);
GO