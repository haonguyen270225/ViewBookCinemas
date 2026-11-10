USE ViewBookCinemasDB;
GO

INSERT INTO dbo.MovieVersions
(
    MovieId,
    VersionName,
    AudioLanguage,
    SubtitleLanguage,
    VersionType
)
SELECT
    M.MovieId,
    V.VersionName,
    V.AudioLanguage,
    V.SubtitleLanguage,
    V.VersionType
FROM
(
    VALUES
    -- Mai
    (N'Mai', N'2D - Bản gốc', N'Tiếng Việt', NULL, 'Original'),
    (N'Mai', N'2D - Phụ đề Anh', N'Tiếng Việt', N'Tiếng Anh', 'Subtitled'),

    -- Lật Mặt 7: Một Điều Ước
    (N'Lật Mặt 7: Một Điều Ước', N'2D - Bản gốc', N'Tiếng Việt', NULL, 'Original'),
    (N'Lật Mặt 7: Một Điều Ước', N'2D - Phụ đề Anh', N'Tiếng Việt', N'Tiếng Anh', 'Subtitled'),

    -- Đào, Phở và Piano
    (N'Đào, Phở và Piano', N'2D - Bản gốc', N'Tiếng Việt', NULL, 'Original'),
    (N'Đào, Phở và Piano', N'2D - Phụ đề Anh', N'Tiếng Việt', N'Tiếng Anh', 'Subtitled'),

    -- Inside Out 2
    (N'Inside Out 2', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),
    (N'Inside Out 2', N'2D - Lồng tiếng Việt', N'Tiếng Việt', NULL, 'Dubbed'),

    -- Dune: Part Two
    (N'Dune: Part Two', N'2D - Bản gốc', N'Tiếng Anh', NULL, 'Original'),
    (N'Dune: Part Two', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),

    -- Deadpool & Wolverine
    (N'Deadpool & Wolverine', N'2D - Bản gốc', N'Tiếng Anh', NULL, 'Original'),
    (N'Deadpool & Wolverine', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),

    -- Moana 2
    (N'Moana 2', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),
    (N'Moana 2', N'2D - Lồng tiếng Việt', N'Tiếng Việt', NULL, 'Dubbed'),

    -- Wicked
    (N'Wicked', N'2D - Bản gốc', N'Tiếng Anh', NULL, 'Original'),
    (N'Wicked', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),

    -- Lilo & Stitch
    (N'Lilo & Stitch', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),
    (N'Lilo & Stitch', N'2D - Lồng tiếng Việt', N'Tiếng Việt', NULL, 'Dubbed'),

    -- Zootopia 2
    (N'Zootopia 2', N'2D - Phụ đề Việt', N'Tiếng Anh', N'Tiếng Việt', 'Subtitled'),
    (N'Zootopia 2', N'2D - Lồng tiếng Việt', N'Tiếng Việt', NULL, 'Dubbed')

) AS V(MovieTitle, VersionName, AudioLanguage, SubtitleLanguage, VersionType)

INNER JOIN dbo.Movies AS M
    ON M.Title = V.MovieTitle

WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.MovieVersions AS MV
    WHERE MV.MovieId = M.MovieId
      AND MV.VersionName = V.VersionName
);
GO

--======================================
-- Kiêm tra dữ liệu bảng : MovieVersions
--======================================

SELECT
    MV.MovieVersionId,
    M.Title AS MovieTitle,
    MV.VersionName,
    MV.AudioLanguage,
    MV.SubtitleLanguage,
    MV.VersionType,
    MV.Status
FROM dbo.MovieVersions AS MV
INNER JOIN dbo.Movies AS M
    ON MV.MovieId = M.MovieId
ORDER BY M.MovieId, MV.MovieVersionId;
GO