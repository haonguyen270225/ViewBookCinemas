USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Cinemas
(
    CinemaName,
    Address,
    Province,
    District,
    Ward,
    PhoneNumber,
    Email,
    Description,
    ImageUrl,
    OpeningTime,
    ClosingTime
)
SELECT
    N'ViewBookCinemas Nguyễn Trãi',
    N'123 Nguyễn Trãi',
    N'TP. Hồ Chí Minh',
    N'Quận 1',
    N'Phường Bến Thành',
    '02838220001',
    'nguyentrai@viewbookcinemas.vn',
    N'Rạp chiếu phim hiện đại nằm tại trung tâm thành phố.',
    NULL,
    '08:00',
    '23:00'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Cinemas
    WHERE CinemaName = N'ViewBookCinemas Nguyễn Trãi'
);

INSERT INTO dbo.Cinemas
(
    CinemaName, Address, Province, District, Ward,
    PhoneNumber, Email, Description, ImageUrl,
    OpeningTime, ClosingTime
)
SELECT
    N'ViewBookCinemas Cầu Giấy',
    N'45 Trần Duy Hưng',
    N'Hà Nội',
    N'Cầu Giấy',
    N'Phường Trung Hòa',
    '02438220002',
    'caugiay@viewbookcinemas.vn',
    N'Rạp chiếu phim phục vụ khu vực Cầu Giấy và các khu vực lân cận.',
    NULL,
    '08:00',
    '23:00'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Cinemas
    WHERE CinemaName = N'ViewBookCinemas Cầu Giấy'
);

INSERT INTO dbo.Cinemas
(
    CinemaName, Address, Province, District, Ward,
    PhoneNumber, Email, Description, ImageUrl,
    OpeningTime, ClosingTime
)
SELECT
    N'ViewBookCinemas Đà Nẵng',
    N'88 Nguyễn Văn Linh',
    N'Đà Nẵng',
    N'Hải Châu',
    N'Phường Nam Dương',
    '02363820003',
    'danang@viewbookcinemas.vn',
    N'Rạp chiếu phim phục vụ khách hàng tại khu vực trung tâm Đà Nẵng.',
    NULL,
    '08:00',
    '23:00'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Cinemas
    WHERE CinemaName = N'ViewBookCinemas Đà Nẵng'
);

INSERT INTO dbo.Cinemas
(
    CinemaName, Address, Province, District, Ward,
    PhoneNumber, Email, Description, ImageUrl,
    OpeningTime, ClosingTime
)
SELECT
    N'ViewBookCinemas Cần Thơ',
    N'56 Hòa Bình',
    N'Cần Thơ',
    N'Ninh Kiều',
    N'Phường Tân An',
    '02923820004',
    'cantho@viewbookcinemas.vn',
    N'Rạp chiếu phim phục vụ khách hàng tại trung tâm thành phố Cần Thơ.',
    NULL,
    '08:00',
    '23:00'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Cinemas
    WHERE CinemaName = N'ViewBookCinemas Cần Thơ'
);
GO

--==========================
-- Kiểm tra dữ liệu bảng : Cinemas
--==========================
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
