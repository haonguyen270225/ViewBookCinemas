USE ViewBookCinemasDB;
GO

INSERT INTO dbo.CinemaRooms
(
    CinemaId,
    RoomName,
    RoomType,
    Capacity
)
SELECT
    C.CinemaId,
    R.RoomName,
    R.RoomType,
    R.Capacity
FROM
(
    VALUES
        (N'ViewBookCinemas Nguyễn Trãi', N'Phòng 01', 'Standard', 100),
        (N'ViewBookCinemas Nguyễn Trãi', N'Phòng 02', 'VIP', 80),
        (N'ViewBookCinemas Nguyễn Trãi', N'Phòng 03', 'IMAX', 150),

        (N'ViewBookCinemas Cầu Giấy', N'Phòng 01', 'Standard', 100),
        (N'ViewBookCinemas Cầu Giấy', N'Phòng 02', 'VIP', 80),
        (N'ViewBookCinemas Cầu Giấy', N'Phòng 03', 'IMAX', 150),

        (N'ViewBookCinemas Đà Nẵng', N'Phòng 01', 'Standard', 100),
        (N'ViewBookCinemas Đà Nẵng', N'Phòng 02', 'VIP', 80),
        (N'ViewBookCinemas Đà Nẵng', N'Phòng 03', 'IMAX', 150),

        (N'ViewBookCinemas Cần Thơ', N'Phòng 01', 'Standard', 100),
        (N'ViewBookCinemas Cần Thơ', N'Phòng 02', 'VIP', 80),
        (N'ViewBookCinemas Cần Thơ', N'Phòng 03', 'IMAX', 150)
) AS R(CinemaName, RoomName, RoomType, Capacity)
INNER JOIN dbo.Cinemas AS C
    ON C.CinemaName = R.CinemaName
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.CinemaRooms AS CR
    WHERE CR.CinemaId = C.CinemaId
      AND CR.RoomName = R.RoomName
);
GO


--==================================
-- Kiểm tả dữ liệu bảng: CinemaRooms
--==================================

SELECT
    C.CinemaId,
    C.CinemaName,
    C.Province,
    C.District,
    CR.RoomId,
    CR.RoomName,
    CR.RoomType,
    CR.Capacity,
    CR.Status
FROM dbo.Cinemas AS C
LEFT JOIN dbo.CinemaRooms AS CR
    ON C.CinemaId = CR.CinemaId
ORDER BY
    C.CinemaId,
    CR.RoomId;
GO