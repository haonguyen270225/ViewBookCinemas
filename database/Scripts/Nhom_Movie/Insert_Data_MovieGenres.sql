USE ViewBookCinemasDB;
GO

INSERT INTO dbo.MovieGenres
(
    MovieId,
    GenreId
)
SELECT
    M.MovieId,
    G.GenreId
FROM
(
    VALUES
    -- Mai
    (N'Mai', N'Tâm lý'),
    (N'Mai', N'Tình cảm'),
    (N'Mai', N'Chính kịch'),

    -- Lật Mặt 7: Một Điều Ước
    (N'Lật Mặt 7: Một Điều Ước', N'Gia đình'),
    (N'Lật Mặt 7: Một Điều Ước', N'Tâm lý'),
    (N'Lật Mặt 7: Một Điều Ước', N'Chính kịch'),

    -- Đào, Phở và Piano
    (N'Đào, Phở và Piano', N'Lịch sử'),
    (N'Đào, Phở và Piano', N'Chiến tranh'),
    (N'Đào, Phở và Piano', N'Chính kịch'),

    -- Inside Out 2
    (N'Inside Out 2', N'Hoạt hình'),
    (N'Inside Out 2', N'Gia đình'),
    (N'Inside Out 2', N'Hài'),

    -- Dune: Part Two
    (N'Dune: Part Two', N'Khoa học viễn tưởng'),
    (N'Dune: Part Two', N'Hành động'),
    (N'Dune: Part Two', N'Phiêu lưu'),

    -- Deadpool & Wolverine
    (N'Deadpool & Wolverine', N'Hành động'),
    (N'Deadpool & Wolverine', N'Hài'),
    (N'Deadpool & Wolverine', N'Khoa học viễn tưởng'),

    -- Moana 2
    (N'Moana 2', N'Hoạt hình'),
    (N'Moana 2', N'Phiêu lưu'),
    (N'Moana 2', N'Gia đình'),

    -- Wicked
    (N'Wicked', N'Giả tưởng'),
    (N'Wicked', N'Tình cảm'),

    -- Lilo & Stitch
    (N'Lilo & Stitch', N'Hoạt hình'),
    (N'Lilo & Stitch', N'Gia đình'),
    (N'Lilo & Stitch', N'Hài'),
    (N'Lilo & Stitch', N'Khoa học viễn tưởng'),

    -- Zootopia 2
    (N'Zootopia 2', N'Hoạt hình'),
    (N'Zootopia 2', N'Hài'),
    (N'Zootopia 2', N'Phiêu lưu')

) AS V(MovieTitle, GenreName)

INNER JOIN dbo.Movies AS M
    ON M.Title = V.MovieTitle

INNER JOIN dbo.Genres AS G
    ON G.GenreName = V.GenreName

WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.MovieGenres AS MG
    WHERE MG.MovieId = M.MovieId
      AND MG.GenreId = G.GenreId
);
GO



--===================================
-- Kiểm tra dữ liệu bảng : MovieGenres
--===================================


SELECT
    M.MovieId,
    M.Title AS MovieTitle,
    G.GenreId,
    G.GenreName
FROM dbo.MovieGenres AS MG
INNER JOIN dbo.Movies AS M
    ON MG.MovieId = M.MovieId
INNER JOIN dbo.Genres AS G
    ON MG.GenreId = G.GenreId
ORDER BY M.MovieId, G.GenreName;
GO