USE ViewBookCinemasDB;
GO

;WITH RowNumbers AS
(
    SELECT 1 AS RowNumber
    UNION ALL
    SELECT RowNumber + 1
    FROM RowNumbers
    WHERE RowNumber < 10
),
SeatNumbers AS
(
    SELECT 1 AS SeatNumber
    UNION ALL
    SELECT SeatNumber + 1
    FROM SeatNumbers
    WHERE SeatNumber < 15
),
RowNames AS
(
    SELECT *
    FROM
    (
        VALUES
            (1, 'A'),
            (2, 'B'),
            (3, 'C'),
            (4, 'D'),
            (5, 'E'),
            (6, 'F'),
            (7, 'G'),
            (8, 'H'),
            (9, 'I'),
            (10, 'J')
    ) AS R(RowNumber, SeatRow)
),
RoomLayouts AS
(
    SELECT
        CR.RoomId,
        CR.RoomName,
        CR.RoomType,
        C.CinemaName,

        CASE
            WHEN CR.RoomName = N'Phòng 01' THEN 10
            WHEN CR.RoomName = N'Phòng 02' THEN 8
            WHEN CR.RoomName = N'Phòng 03' THEN 10
        END AS TotalRows,

        CASE
            WHEN CR.RoomName = N'Phòng 01' THEN 10
            WHEN CR.RoomName = N'Phòng 02' THEN 10
            WHEN CR.RoomName = N'Phòng 03' THEN 15
        END AS SeatsPerRow

    FROM dbo.CinemaRooms AS CR
    INNER JOIN dbo.Cinemas AS C
        ON C.CinemaId = CR.CinemaId

    WHERE
        (
            C.CinemaName = N'ViewBookCinemas Nguyễn Trãi'
            OR C.CinemaName = N'ViewBookCinemas Cầu Giấy'
            OR C.CinemaName = N'ViewBookCinemas Đà Nẵng'
            OR C.CinemaName = N'ViewBookCinemas Cần Thơ'
        )
        AND CR.RoomName IN
        (
            N'Phòng 01',
            N'Phòng 02',
            N'Phòng 03'
        )
),
SeatData AS
(
    SELECT
        RL.RoomId,
        RN.SeatRow,
        SN.SeatNumber,

        CASE
            WHEN RL.RoomName = N'Phòng 02'
                THEN N'Ghế VIP'

            WHEN RN.RowNumber BETWEEN 1 AND 6
                THEN N'Ghế thường'

            WHEN RN.RowNumber BETWEEN 7 AND 8
                THEN N'Ghế VIP'

            ELSE N'Ghế đôi'
        END AS SeatTypeName

    FROM RoomLayouts AS RL

    INNER JOIN RowNumbers AS R
        ON R.RowNumber <= RL.TotalRows

    INNER JOIN RowNames AS RN
        ON RN.RowNumber = R.RowNumber

    CROSS JOIN SeatNumbers AS SN

    WHERE SN.SeatNumber <= RL.SeatsPerRow
)

INSERT INTO dbo.Seats
(
    RoomId,
    SeatTypeId,
    SeatRow,
    SeatNumber
)
SELECT
    SD.RoomId,
    ST.SeatTypeId,
    SD.SeatRow,
    SD.SeatNumber

FROM SeatData AS SD

INNER JOIN dbo.SeatTypes AS ST
    ON ST.SeatTypeName = SD.SeatTypeName

WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Seats AS S
    WHERE S.RoomId = SD.RoomId
      AND S.SeatRow = SD.SeatRow
      AND S.SeatNumber = SD.SeatNumber
);

GO