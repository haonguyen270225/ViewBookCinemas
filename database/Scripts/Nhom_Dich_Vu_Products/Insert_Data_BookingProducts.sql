USE ViewBookCinemasDB;
GO

;WITH BookingList AS
(
    SELECT TOP (10)
        BookingId
    FROM dbo.Bookings
    ORDER BY BookingId
),
ItemList AS
(
    SELECT
        N'Product' AS ItemType,
        N'Coca-Cola' AS ItemName,
        2 AS Quantity

    UNION ALL

    SELECT
        N'Combo',
        N'Combo Couple',
        1
)
INSERT INTO dbo.BookingProducts
(
    BookingId,
    ProductId,
    ComboId,
    ItemName,
    Quantity,
    UnitPrice,
    TotalPrice
)
SELECT
    B.BookingId,
    P.ProductId,
    C.ComboId,
    I.ItemName,
    I.Quantity,
    COALESCE(P.Price, C.Price),
    COALESCE(P.Price, C.Price) * I.Quantity
FROM BookingList B
CROSS JOIN ItemList I
LEFT JOIN dbo.Products P
    ON I.ItemType = N'Product'
    AND P.ProductName = I.ItemName
LEFT JOIN dbo.Combos C
    ON I.ItemType = N'Combo'
    AND C.ComboName = I.ItemName
WHERE
    (P.ProductId IS NOT NULL OR C.ComboId IS NOT NULL)
    AND NOT EXISTS
    (
        SELECT 1
        FROM dbo.BookingProducts BP
        WHERE BP.BookingId = B.BookingId
          AND BP.ItemName = I.ItemName
    );
GO

--================================
--Kiểm tra BookingProducts:
--================================
SELECT
    BP.BookingProductId,
    BP.BookingId,
    BP.ProductId,
    BP.ComboId,
    BP.ItemName,
    BP.Quantity,
    BP.UnitPrice,
    BP.TotalPrice
FROM dbo.BookingProducts BP
ORDER BY BP.BookingProductId;