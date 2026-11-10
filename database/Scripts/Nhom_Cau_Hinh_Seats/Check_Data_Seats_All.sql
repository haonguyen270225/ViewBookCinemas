--====================================
-- Kiểm tra dữ liệu
-- Kiểm tra số lượng ghế theo từng phòng:
--====================================
SELECT
    C.CinemaName,
    CR.RoomName,
    CR.RoomType,
    CR.Capacity,
    COUNT(S.SeatId) AS TotalSeats
FROM dbo.CinemaRooms AS CR
INNER JOIN dbo.Cinemas AS C
    ON C.CinemaId = CR.CinemaId
LEFT JOIN dbo.Seats AS S
    ON S.RoomId = CR.RoomId
GROUP BY
    C.CinemaName,
    CR.RoomName,
    CR.RoomType,
    CR.Capacity
ORDER BY
    C.CinemaName,
    CR.RoomName;
GO

--====================================
-- Kiểm tra phân bổ loại ghế:
--====================================
SELECT
    C.CinemaName,
    CR.RoomName,
    ST.SeatTypeName,
    ST.AdditionalPrice,
    COUNT(S.SeatId) AS TotalSeats
FROM dbo.Seats AS S
INNER JOIN dbo.CinemaRooms AS CR
    ON CR.RoomId = S.RoomId
INNER JOIN dbo.Cinemas AS C
    ON C.CinemaId = CR.CinemaId
INNER JOIN dbo.SeatTypes AS ST
    ON ST.SeatTypeId = S.SeatTypeId
GROUP BY
    C.CinemaName,
    CR.RoomName,
    ST.SeatTypeName,
    ST.AdditionalPrice
ORDER BY
    C.CinemaName,
    CR.RoomName,
    ST.SeatTypeName;
GO

--====================================
-- Kiểm tra sơ đồ ghế của một phòng cụ thể:
--====================================
SELECT
    S.SeatId,
    S.RoomId,
    S.SeatRow,
    S.SeatNumber,
    ST.SeatTypeName,
    ST.AdditionalPrice,
    S.Status
FROM dbo.Seats AS S
INNER JOIN dbo.SeatTypes AS ST
    ON ST.SeatTypeId = S.SeatTypeId
INNER JOIN dbo.CinemaRooms AS CR
    ON CR.RoomId = S.RoomId
WHERE CR.RoomName = N'Phòng 01'
ORDER BY
    S.SeatRow,
    S.SeatNumber;
GO