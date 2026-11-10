USE ViewBookCinemasDB;
GO

DECLARE @Applied TABLE
(
    BookingId INT,
    PromotionId INT,
    DiscountAmount DECIMAL(10,2)
);

;WITH EligibleBookings AS
(
    SELECT TOP (5)
        B.BookingId,
        B.TicketAmount + B.ProductAmount AS OrderAmount,
        ROW_NUMBER() OVER (ORDER BY B.BookingId) AS RowNum
    FROM dbo.Bookings B
    WHERE B.BookingStatus = 'Confirmed'
      AND B.PaymentStatus = 'Paid'
      AND NOT EXISTS
      (
          SELECT 1
          FROM dbo.BookingPromotions BP
          WHERE BP.BookingId = B.BookingId
      )
    ORDER BY B.BookingId
),
AssignedPromotions AS
(
    SELECT
        EB.BookingId,
        EB.OrderAmount,
        P.PromotionId,
        P.DiscountType,
        P.DiscountValue,
        P.MaxDiscountAmount
    FROM EligibleBookings EB
    INNER JOIN dbo.Promotions P
        ON P.PromotionCode =
            CASE EB.RowNum
                WHEN 1 THEN 'WELCOME10'
                WHEN 2 THEN 'VBC20K'
                WHEN 3 THEN 'MOVIE15'
                WHEN 4 THEN 'WEEKDAY5'
                WHEN 5 THEN 'COMBO10K'
            END
    WHERE P.Status = 'Active'
      AND SYSDATETIME() BETWEEN P.StartDate AND P.EndDate
      AND EB.OrderAmount >= P.MinOrderAmount
),
CalculatedDiscounts AS
(
    SELECT
        AP.BookingId,
        AP.PromotionId,
        CAST
        (
            CASE
                WHEN AP.MaxDiscountAmount IS NOT NULL
                     AND D.CalculatedAmount > AP.MaxDiscountAmount
                    THEN AP.MaxDiscountAmount
                ELSE D.CalculatedAmount
            END
            AS DECIMAL(10,2)
        ) AS DiscountAmount
    FROM AssignedPromotions AP
    CROSS APPLY
    (
        SELECT
            CASE
                WHEN AP.DiscountType = 'Percentage'
                    THEN AP.OrderAmount * AP.DiscountValue / 100.0
                WHEN AP.DiscountType = 'FixedAmount'
                    THEN AP.DiscountValue
                ELSE 0
            END AS CalculatedAmount
    ) D
)
INSERT INTO dbo.BookingPromotions
(
    BookingId,
    PromotionId,
    DiscountAmount
)
OUTPUT
    inserted.BookingId,
    inserted.PromotionId,
    inserted.DiscountAmount
INTO @Applied
(
    BookingId,
    PromotionId,
    DiscountAmount
)
SELECT
    BookingId,
    PromotionId,
    DiscountAmount
FROM CalculatedDiscounts;

-- Cập nhật tổng tiền đơn đặt vé
UPDATE B
SET
    B.DiscountAmount = B.DiscountAmount + A.NewDiscount,
    B.TotalAmount = B.TicketAmount + B.ProductAmount
                   - B.DiscountAmount - A.NewDiscount,
    B.UpdatedAt = SYSDATETIME()
FROM dbo.Bookings B
INNER JOIN
(
    SELECT
        BookingId,
        SUM(DiscountAmount) AS NewDiscount
    FROM @Applied
    GROUP BY BookingId
) A
    ON B.BookingId = A.BookingId;

-- Cập nhật số lượt sử dụng khuyến mãi
UPDATE P
SET
    P.UsedCount = P.UsedCount + A.UsageCount,
    P.UpdatedAt = SYSDATETIME()
FROM dbo.Promotions P
INNER JOIN
(
    SELECT
        PromotionId,
        COUNT(*) AS UsageCount
    FROM @Applied
    GROUP BY PromotionId
) A
    ON P.PromotionId = A.PromotionId;
GO

--==============================================
--Kiểm tra các khuyến mãi đã áp dụng:BookingPromotions
--==============================================
SELECT
    BP.BookingPromotionId,
    B.BookingCode,
    P.PromotionCode,
    P.PromotionName,
    BP.DiscountAmount,
    BP.AppliedAt
FROM dbo.BookingPromotions BP
INNER JOIN dbo.Bookings B
    ON BP.BookingId = B.BookingId
INNER JOIN dbo.Promotions P
    ON BP.PromotionId = P.PromotionId
ORDER BY BP.BookingPromotionId;