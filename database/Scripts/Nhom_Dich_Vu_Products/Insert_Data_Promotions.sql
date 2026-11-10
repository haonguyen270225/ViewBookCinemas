USE ViewBookCinemasDB;
GO

-- Nếu bảng cũ vẫn tên Promotion thì đổi thành Promotions
IF OBJECT_ID(N'dbo.Promotions', N'U') IS NULL
   AND OBJECT_ID(N'dbo.Promotion', N'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'dbo.Promotion', 'Promotions';
END;
GO

INSERT INTO dbo.Promotions
(
    PromotionCode,
    PromotionName,
    Description,
    DiscountType,
    DiscountValue,
    MaxDiscountAmount,
    MinOrderAmount,
    StartDate,
    EndDate,
    UsageLimit,
    UsedCount,
    Status
)
SELECT
    V.PromotionCode,
    V.PromotionName,
    V.Description,
    V.DiscountType,
    V.DiscountValue,
    V.MaxDiscountAmount,
    V.MinOrderAmount,
    DATEADD(DAY, -30, SYSDATETIME()),
    DATEADD(DAY, 60, SYSDATETIME()),
    V.UsageLimit,
    0,
    'Active'
FROM
(
    VALUES
    (
        'WELCOME10',
        N'Khuyến mãi khách hàng mới',
        N'Giảm 10% cho đơn đặt vé từ 100.000 đồng.',
        'Percentage',
        10.00,
        50000.00,
        100000.00,
        100,
        0
    ),
    (
        'VBC20K',
        N'Ưu đãi giảm 20K',
        N'Giảm trực tiếp 20.000 đồng cho đơn từ 150.000 đồng.',
        'FixedAmount',
        20000.00,
        NULL,
        150000.00,
        200,
        0
    ),
    (
        'MOVIE15',
        N'Ưu đãi xem phim',
        N'Giảm 15% cho đơn đặt vé từ 200.000 đồng.',
        'Percentage',
        15.00,
        60000.00,
        200000.00,
        100,
        0
    ),
    (
        'WEEKDAY5',
        N'Ưu đãi ngày thường',
        N'Giảm 5% cho đơn đặt vé từ 80.000 đồng.',
        'Percentage',
        5.00,
        30000.00,
        80000.00,
        300,
        0
    ),
    (
        'COMBO10K',
        N'Ưu đãi mua combo',
        N'Giảm trực tiếp 10.000 đồng cho đơn từ 50.000 đồng.',
        'FixedAmount',
        10000.00,
        NULL,
        50000.00,
        150,
        0
    )
) AS V
(
    PromotionCode,
    PromotionName,
    Description,
    DiscountType,
    DiscountValue,
    MaxDiscountAmount,
    MinOrderAmount,
    UsageLimit,
    UsedCount
)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Promotions P
    WHERE P.PromotionCode = V.PromotionCode
);
GO


--===============================================
--Kiểm tra danh sách khuyến mãi : Promotions
--===============================================
SELECT *
FROM dbo.Promotions
ORDER BY PromotionId;