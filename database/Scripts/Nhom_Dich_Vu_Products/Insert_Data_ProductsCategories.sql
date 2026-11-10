USE ViewBookCinemasDB;
GO

INSERT INTO dbo.ProductsCategories
(
    CategoryName,
    Description
)
SELECT
    V.CategoryName,
    V.Description
FROM
(
    VALUES
    (
        N'Bắp rang',
        N'Danh mục các sản phẩm bắp rang với nhiều hương vị và kích cỡ.'
    ),
    (
        N'Nước uống',
        N'Danh mục nước ngọt, nước suối và các loại đồ uống.'
    ),
    (
        N'Đồ ăn nhẹ',
        N'Danh mục các món ăn nhẹ dùng trong khi xem phim.'
    ),
    (
        N'Đồ ăn nóng',
        N'Danh mục các món ăn nóng được phục vụ tại rạp.'
    )
) AS V(CategoryName, Description)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.ProductsCategories AS PC
    WHERE PC.CategoryName = V.CategoryName
);
GO