USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Combos
(
    ComboName,
    Description,
    Price,
    ImageUrl,
    Status,
    StartDate,
    EndDate
)
SELECT
    V.ComboName,
    V.Description,
    V.Price,
    V.ImageUrl,
    'Active',
    NULL,
    NULL
FROM
(
    VALUES
    (
        N'Combo Couple',
        N'1 bắp rang bơ lớn và 2 Coca-Cola.',
        120000.00,
        N'/images/combos/combo-couple.jpg'
    ),
    (
        N'Combo Single',
        N'1 bắp rang bơ nhỏ và 1 Coca-Cola.',
        70000.00,
        N'/images/combos/combo-single.jpg'
    ),
    (
        N'Combo Family',
        N'2 bắp rang bơ lớn và 3 Coca-Cola.',
        210000.00,
        N'/images/combos/combo-family.jpg'
    ),
    (
        N'Combo Sweet',
        N'1 bắp rang caramel và 1 Pepsi.',
        90000.00,
        N'/images/combos/combo-sweet.jpg'
    ),
    (
        N'Combo Snack',
        N'1 Nachos phô mai và 1 Coca-Cola.',
        75000.00,
        N'/images/combos/combo-snack.jpg'
    )
) AS V(ComboName, Description, Price, ImageUrl)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Combos C
    WHERE C.ComboName = V.ComboName
);
GO


--=================================
--Kiểm tra Combos:
--=================================
SELECT *
FROM dbo.Combos
ORDER BY ComboId;