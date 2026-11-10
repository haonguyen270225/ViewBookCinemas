USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Movies
(
    Title,
    Description,
    DurationMinutes,
    ReleaseDate,
    EndDate,
    AgeRating,
    Language,
    Director,
    PosterUrl,
    TrailerUrl,
    Status
)
VALUES
(
    N'Mai',
    N'Câu chuyện về Mai, một người phụ nữ có quá khứ nhiều tổn thương, luôn mong muốn tìm kiếm hạnh phúc và một cuộc sống tốt đẹp hơn.',
    131,
    '2024-02-10',
    '2024-04-10',
    'T18',
    N'Tiếng Việt',
    N'Trấn Thành',
    NULL,
    NULL,
    'Ended'
),
(
    N'Lật Mặt 7: Một Điều Ước',
    N'Câu chuyện cảm động về tình cảm gia đình, tình mẫu tử và những lựa chọn trong cuộc sống.',
    138,
    '2024-04-26',
    '2024-06-26',
    'T16',
    N'Tiếng Việt',
    N'Lý Hải',
    NULL,
    NULL,
    'Ended'
),
(
    N'Đào, Phở và Piano',
    N'Bộ phim tái hiện cuộc sống và tinh thần chiến đấu của người dân Hà Nội trong những ngày đầu Toàn quốc kháng chiến.',
    100,
    '2024-02-10',
    '2024-04-10',
    'T13',
    N'Tiếng Việt',
    N'Phi Tiến Sơn',
    NULL,
    NULL,
    'Ended'
),
(
    N'Inside Out 2',
    N'Riley bước vào tuổi thiếu niên và phải đối mặt với những cảm xúc mới trong hành trình trưởng thành.',
    96,
    '2024-06-14',
    '2024-08-14',
    'P',
    N'Tiếng Anh',
    N'Kelsey Mann',
    NULL,
    NULL,
    'Ended'
),
(
    N'Dune: Part Two',
    N'Paul Atreides tiếp tục hành trình trên hành tinh Arrakis và đối mặt với những lựa chọn có thể thay đổi số phận của vũ trụ.',
    166,
    '2024-03-01',
    '2024-05-01',
    'T16',
    N'Tiếng Anh',
    N'Denis Villeneuve',
    NULL,
    NULL,
    'Ended'
),
(
    N'Deadpool & Wolverine',
    N'Deadpool hợp tác cùng Wolverine trong một chuyến phiêu lưu đầy hành động và hài hước để cứu lấy thế giới của mình.',
    128,
    '2024-07-26',
    '2024-09-26',
    'T18',
    N'Tiếng Anh',
    N'Shawn Levy',
    NULL,
    NULL,
    'Ended'
),
(
    N'Moana 2',
    N'Moana nhận được lời gọi từ tổ tiên và bắt đầu chuyến hành trình mới vượt đại dương cùng những người bạn.',
    100,
    '2024-11-27',
    '2025-01-27',
    'P',
    N'Tiếng Anh',
    N'David Derrick Jr.',
    NULL,
    NULL,
    'Ended'
),
(
    N'Wicked',
    N'Câu chuyện về tình bạn giữa Elphaba và Glinda, hai cô gái có số phận khác biệt tại vùng đất Oz.',
    160,
    '2024-11-22',
    '2025-01-22',
    'P',
    N'Tiếng Anh',
    N'Jon M. Chu',
    NULL,
    NULL,
    'Ended'
),
(
    N'Lilo & Stitch',
    N'Câu chuyện về cô bé Lilo và sinh vật ngoài hành tinh Stitch, cùng hành trình xây dựng tình cảm gia đình.',
    108,
    '2025-05-23',
    '2025-07-23',
    'P',
    N'Tiếng Anh',
    N'Dean Fleischer Camp',
    NULL,
    NULL,
    'Ended'
),
(
    N'Zootopia 2',
    N'Judy Hopps và Nick Wilde tiếp tục hợp tác trong một vụ án mới tại thành phố Zootopia.',
    108,
    '2025-11-26',
    '2026-01-26',
    'P',
    N'Tiếng Anh',
    N'Jared Bush',
    NULL,
    NULL,
    'Ended'
);
GO


-- =============================================
-- Xuất thông tin dữ liệu table Movies
-- =============================================

SELECT
    MovieId,
    Title,
    DurationMinutes,
    ReleaseDate,
    EndDate,
    AgeRating,
    Language,
    Director,
    Status
FROM dbo.Movies
ORDER BY MovieId;
GO