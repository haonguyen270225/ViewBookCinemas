USE ViewBookCinemasDB;
GO

INSERT INTO dbo.MovieActors
(
    MovieId,
    ActorId,
    CharacterName,
    RoleType,
    DisplayOrder
)
SELECT
    M.MovieId,
    A.ActorId,
    V.CharacterName,
    V.RoleType,
    V.DisplayOrder
FROM
(
    VALUES
    -- Mai
    (N'Mai', N'Phương Anh Đào', N'Mai', 'Main', 1),
    (N'Mai', N'Tuấn Trần', N'Dương', 'Main', 2),

    -- Lật Mặt 7: Một Điều Ước
    (N'Lật Mặt 7: Một Điều Ước', N'Thanh Hiền', N'Bà Hai', 'Main', 1),
    (N'Lật Mặt 7: Một Điều Ước', N'Quách Ngọc Tuyên', N'Nhân vật trong phim', 'Supporting', 2),
    (N'Lật Mặt 7: Một Điều Ước', N'Trần Kim Hải', N'Nhân vật trong phim', 'Supporting', 3),

    -- Đào, Phở và Piano
    (N'Đào, Phở và Piano', N'Đoàn Quốc Đam', N'Dân quân', 'Main', 1),
    (N'Đào, Phở và Piano', N'Cao Thị Thùy Linh', N'Hiền', 'Main', 2),

    -- Inside Out 2
    (N'Inside Out 2', N'Amy Poehler', N'Joy', 'Main', 1),
    (N'Inside Out 2', N'Maya Hawke', N'Anxiety', 'Supporting', 2),
    (N'Inside Out 2', N'Kensington Tallman', N'Riley', 'Main', 3),

    -- Dune: Part Two
    (N'Dune: Part Two', N'Timothée Chalamet', N'Paul Atreides', 'Main', 1),
    (N'Dune: Part Two', N'Zendaya', N'Chani', 'Main', 2),
    (N'Dune: Part Two', N'Rebecca Ferguson', N'Lady Jessica', 'Supporting', 3),

    -- Deadpool & Wolverine
    (N'Deadpool & Wolverine', N'Ryan Reynolds', N'Wade Wilson / Deadpool', 'Main', 1),
    (N'Deadpool & Wolverine', N'Hugh Jackman', N'Logan / Wolverine', 'Main', 2),
    (N'Deadpool & Wolverine', N'Emma Corrin', N'Cassandra Nova', 'Supporting', 3),

    -- Moana 2
    (N'Moana 2', N'Auli''i Cravalho', N'Moana', 'Main', 1),
    (N'Moana 2', N'Dwayne Johnson', N'Maui', 'Main', 2),

    -- Wicked
    (N'Wicked', N'Cynthia Erivo', N'Elphaba', 'Main', 1),
    (N'Wicked', N'Ariana Grande', N'Glinda', 'Main', 2),

    -- Lilo & Stitch
    (N'Lilo & Stitch', N'Maia Kealoha', N'Lilo', 'Main', 1),
    (N'Lilo & Stitch', N'Sydney Agudong', N'Nani', 'Main', 2),

    -- Zootopia 2
    (N'Zootopia 2', N'Ginnifer Goodwin', N'Judy Hopps', 'Main', 1),
    (N'Zootopia 2', N'Jason Bateman', N'Nick Wilde', 'Main', 2)

) AS V(MovieTitle, ActorName, CharacterName, RoleType, DisplayOrder)

INNER JOIN dbo.Movies AS M
    ON M.Title = V.MovieTitle

INNER JOIN dbo.Actors AS A
    ON A.FullName = V.ActorName

WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.MovieActors AS MA
    WHERE MA.MovieId = M.MovieId
      AND MA.ActorId = A.ActorId
);
GO

--=====================
-- Xem dữ liệu bảng : MovieActors
--=====================

SELECT
    MA.MovieId,
    M.Title AS MovieTitle,
    MA.ActorId,
    A.FullName AS ActorName,
    MA.CharacterName,
    MA.RoleType,
    MA.DisplayOrder
FROM dbo.MovieActors AS MA
INNER JOIN dbo.Movies AS M
    ON MA.MovieId = M.MovieId
INNER JOIN dbo.Actors AS A
    ON MA.ActorId = A.ActorId
ORDER BY
    M.MovieId,
    MA.DisplayOrder;
GO