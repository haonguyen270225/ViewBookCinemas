USE ViewBookCinemasDB;
GO

;WITH UserList AS
(
    SELECT TOP (20)
        UserId,
        ROW_NUMBER() OVER (ORDER BY UserId) AS RowNum
    FROM dbo.Users
    ORDER BY UserId
),
BookingData AS
(
    SELECT
        UserId,
        RowNum,
        CASE
            WHEN RowNum BETWEEN 1 AND 10 THEN 'Confirmed'
            WHEN RowNum BETWEEN 11 AND 14 THEN 'Pending'
            WHEN RowNum BETWEEN 15 AND 17 THEN 'Cancelled'
            ELSE 'Expired'
        END AS BookingStatus,

        CASE
            WHEN RowNum <= 10 THEN 'Paid'
            ELSE 'Unpaid'
        END AS PaymentStatus,

        CASE
            WHEN RowNum <= 10 THEN 180000
            WHEN RowNum BETWEEN 11 AND 14 THEN 120000
            WHEN RowNum BETWEEN 15 AND 17 THEN 90000
            ELSE 150000
        END AS TicketAmount,

        CASE
            WHEN RowNum IN (1, 3, 5, 7, 9) THEN 70000
            WHEN RowNum IN (2, 4, 6, 8, 10) THEN 120000
            ELSE 0
        END AS ProductAmount,

        CASE
            WHEN RowNum IN (1, 3, 5) THEN 20000
            ELSE 0
        END AS DiscountAmount
    FROM UserList
)
INSERT INTO dbo.Bookings
(
    UserId,
    BookingCode,
    BookingDate,
    TicketAmount,
    ProductAmount,
    DiscountAmount,
    TotalAmount,
    BookingStatus,
    PaymentStatus,
    ExpiredAt,
    ConfirmedAt
)
SELECT
    BD.UserId,
    'VBC' + FORMAT(BD.RowNum, '000000'),
    DATEADD(DAY, -BD.RowNum, SYSDATETIME()),
    BD.TicketAmount,
    BD.ProductAmount,
    BD.DiscountAmount,
    BD.TicketAmount + BD.ProductAmount - BD.DiscountAmount,
    BD.BookingStatus,
    BD.PaymentStatus,

    CASE
        WHEN BD.BookingStatus IN ('Pending', 'Expired')
            THEN DATEADD(HOUR, 15, SYSDATETIME())
        ELSE NULL
    END,

    CASE
        WHEN BD.BookingStatus = 'Confirmed'
            THEN DATEADD(DAY, -BD.RowNum, SYSDATETIME())
        ELSE NULL
    END
FROM BookingData BD
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Bookings B
    WHERE B.BookingCode = 'VBC' + FORMAT(BD.RowNum, '000000')
);
GO


--Lưu ý: Đây là dữ liệu mô phỏng. ExpiredAt được đặt thời gian tương 
--lai cho các đơn Pending để minh họa; nếu muốn kiểm thử logic hết hạn
--thực tế, cần điều chỉnh thời gian này.

--=========================================
--Kiểm tra dữ liệu bảng Bookings
--=========================================
SELECT
    BookingId,
    UserId,
    BookingCode,
    BookingDate,
    TicketAmount,
    ProductAmount,
    DiscountAmount,
    TotalAmount,
    BookingStatus,
    PaymentStatus,
    ExpiredAt,
    ConfirmedAt
FROM dbo.Bookings
ORDER BY BookingId;