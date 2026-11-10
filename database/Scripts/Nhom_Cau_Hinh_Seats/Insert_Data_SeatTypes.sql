USE ViewBookCinemasDB;
GO

INSERT INTO dbo.SeatTypes
(
    SeatTypeName,
    Description,
    AdditionalPrice
)
SELECT
    V.SeatTypeName,
    V.Description,
    V.AdditionalPrice
FROM
(
    VALUES
    (
        N'Ghế thường',
        N'Ghế ngồi tiêu chuẩn trong phòng chiếu.',
        CAST(0 AS DECIMAL(10,2))
    ),
    (
        N'Ghế VIP',
        N'Ghế có vị trí và tiện nghi cao cấp hơn ghế thường.',
        CAST(20000 AS DECIMAL(10,2))
    ),
    (
        N'Ghế đôi',
        N'Ghế dành cho hai người ngồi cạnh nhau.',
        CAST(50000 AS DECIMAL(10,2))
    )
) AS V(SeatTypeName, Description, AdditionalPrice)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.SeatTypes AS ST
    WHERE ST.SeatTypeName = V.SeatTypeName
);
GO

