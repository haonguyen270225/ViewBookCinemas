USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Products
(
    CategoryId,
    ProductName,
    Description,
    Price,
    ImageUrl,
    StockQuantity
)
SELECT
    PC.CategoryId,
    P.ProductName,
    P.Description,
    P.Price,
    P.ImageUrl,
    P.StockQuantity
FROM
(
    VALUES
    -- BẮP RANG
    (
        N'Bắp rang',
        N'Bắp rang bơ nhỏ',
        N'Bắp rang giòn thơm với lớp bơ béo ngậy, kích cỡ nhỏ.',
        CAST(45000 AS DECIMAL(10,2)),
        N'/images/products/popcorn-butter-small.jpg',
        100
    ),
    (
        N'Bắp rang',
        N'Bắp rang bơ lớn',
        N'Bắp rang bơ thơm ngon, khẩu phần lớn dành cho nhiều người.',
        CAST(65000 AS DECIMAL(10,2)),
        N'/images/products/popcorn-butter-large.jpg',
        100
    ),
    (
        N'Bắp rang',
        N'Bắp rang caramel',
        N'Bắp rang phủ caramel ngọt dịu, giòn và thơm.',
        CAST(70000 AS DECIMAL(10,2)),
        N'/images/products/popcorn-caramel.jpg',
        80
    ),
    (
        N'Bắp rang',
        N'Bắp rang phô mai',
        N'Bắp rang phủ bột phô mai với hương vị đậm đà.',
        CAST(70000 AS DECIMAL(10,2)),
        N'/images/products/popcorn-cheese.jpg',
        80
    ),

    -- NƯỚC UỐNG
    (
        N'Nước uống',
        N'Coca-Cola',
        N'Nước giải khát có gas Coca-Cola.',
        CAST(30000 AS DECIMAL(10,2)),
        N'/images/products/coca-cola.jpg',
        200
    ),
    (
        N'Nước uống',
        N'Pepsi',
        N'Nước giải khát có gas Pepsi.',
        CAST(30000 AS DECIMAL(10,2)),
        N'/images/products/pepsi.jpg',
        200
    ),
    (
        N'Nước uống',
        N'7Up',
        N'Nước giải khát có gas vị chanh.',
        CAST(30000 AS DECIMAL(10,2)),
        N'/images/products/7up.jpg',
        150
    ),
    (
        N'Nước uống',
        N'Nước suối',
        N'Nước uống tinh khiết đóng chai.',
        CAST(20000 AS DECIMAL(10,2)),
        N'/images/products/mineral-water.jpg',
        200
    ),

    -- ĐỒ ĂN NHẸ
    (
        N'Đồ ăn nhẹ',
        N'Nachos phô mai',
        N'Bánh nachos giòn ăn kèm sốt phô mai.',
        CAST(55000 AS DECIMAL(10,2)),
        N'/images/products/nachos-cheese.jpg',
        70
    ),
    (
        N'Đồ ăn nhẹ',
        N'Snack khoai tây',
        N'Snack khoai tây lát giòn với hương vị hấp dẫn.',
        CAST(35000 AS DECIMAL(10,2)),
        N'/images/products/potato-chips.jpg',
        100
    ),
    (
        N'Đồ ăn nhẹ',
        N'Kẹo chocolate',
        N'Kẹo chocolate ngọt ngào dùng trong khi xem phim.',
        CAST(40000 AS DECIMAL(10,2)),
        N'/images/products/chocolate-candy.jpg',
        80
    ),
    (
        N'Đồ ăn nhẹ',
        N'Bánh quy',
        N'Bánh quy giòn thơm, thích hợp dùng kèm đồ uống.',
        CAST(30000 AS DECIMAL(10,2)),
        N'/images/products/cookies.jpg',
        80
    ),

    -- ĐỒ ĂN NÓNG
    (
        N'Đồ ăn nóng',
        N'Hotdog',
        N'Bánh mì hotdog kẹp xúc xích và nước sốt.',
        CAST(50000 AS DECIMAL(10,2)),
        N'/images/products/hotdog.jpg',
        50
    ),
    (
        N'Đồ ăn nóng',
        N'Gà viên chiên',
        N'Gà viên chiên giòn, phục vụ theo phần.',
        CAST(60000 AS DECIMAL(10,2)),
        N'/images/products/fried-chicken-balls.jpg',
        50
    ),
    (
        N'Đồ ăn nóng',
        N'Xúc xích nướng',
        N'Xúc xích nướng nóng hổi dùng kèm tương ớt.',
        CAST(45000 AS DECIMAL(10,2)),
        N'/images/products/grilled-sausage.jpg',
        60
    )
) AS P
(
    CategoryName,
    ProductName,
    Description,
    Price,
    ImageUrl,
    StockQuantity
)
INNER JOIN dbo.ProductsCategories AS PC
    ON PC.CategoryName = P.CategoryName
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Products AS Existing
    WHERE Existing.CategoryId = PC.CategoryId
      AND Existing.ProductName = P.ProductName
);
GO


--================================
--Kiểm tra dữ liệu sau khi thêm
--================================


SELECT
    PC.CategoryId,
    PC.CategoryName,
    P.ProductId,
    P.ProductName,
    P.Description,
    P.Price,
    P.ImageUrl,
    P.StockQuantity,
    P.Status
FROM dbo.Products AS P
INNER JOIN dbo.ProductsCategories AS PC
    ON PC.CategoryId = P.CategoryId
ORDER BY
    PC.CategoryId,
    P.ProductId;
GO


--================================
--Kiểm tra số lượng sản phẩm trong từng danh mục:
--================================
SELECT
    PC.CategoryName,
    COUNT(P.ProductId) AS TotalProducts
FROM dbo.ProductsCategories AS PC
LEFT JOIN dbo.Products AS P
    ON P.CategoryId = PC.CategoryId
GROUP BY
    PC.CategoryId,
    PC.CategoryName
ORDER BY PC.CategoryId;
GO