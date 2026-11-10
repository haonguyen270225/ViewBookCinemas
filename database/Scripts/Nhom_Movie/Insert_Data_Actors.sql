USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Actors
(
    FullName,
    Biography,
    DateOfBirth,
    Gender,
    Nationality,
    AvatarUrl
)
SELECT
    V.FullName,
    V.Biography,
    V.DateOfBirth,
    V.Gender,
    V.Nationality,
    V.AvatarUrl
FROM
(
    VALUES
    (N'Phương Anh Đào', N'Nữ diễn viên Việt Nam, được biết đến qua nhiều bộ phim điện ảnh.', NULL, 'Female', N'Việt Nam', NULL),
    (N'Tuấn Trần', N'Nam diễn viên Việt Nam tham gia nhiều dự án phim điện ảnh và truyền hình.', NULL, 'Male', N'Việt Nam', NULL),

    (N'Thanh Hiền', N'Nữ diễn viên Việt Nam tham gia phim điện ảnh và truyền hình.', NULL, 'Female', N'Việt Nam', NULL),
    (N'Quách Ngọc Tuyên', N'Nam diễn viên Việt Nam hoạt động trong lĩnh vực sân khấu và điện ảnh.', NULL, 'Male', N'Việt Nam', NULL),
    (N'Trần Kim Hải', N'Nam diễn viên Việt Nam tham gia các dự án điện ảnh.', NULL, 'Male', N'Việt Nam', NULL),

    (N'Đoàn Quốc Đam', N'Nam diễn viên Việt Nam được biết đến qua các vai diễn truyền hình và điện ảnh.', NULL, 'Male', N'Việt Nam', NULL),
    (N'Cao Thị Thùy Linh', N'Nữ diễn viên Việt Nam tham gia phim Đào, Phở và Piano.', NULL, 'Female', N'Việt Nam', NULL),

    (N'Amy Poehler', N'Nữ diễn viên và nghệ sĩ hài người Mỹ, lồng tiếng nhân vật Joy.', '1971-09-16', 'Female', N'Mỹ', NULL),
    (N'Maya Hawke', N'Nữ diễn viên người Mỹ, lồng tiếng nhân vật Anxiety.', '1998-07-08', 'Female', N'Mỹ', NULL),
    (N'Kensington Tallman', N'Nữ diễn viên người Mỹ, lồng tiếng nhân vật Riley.', NULL, 'Female', N'Mỹ', NULL),

    (N'Timothée Chalamet', N'Nam diễn viên người Mỹ gốc Pháp, đảm nhận vai Paul Atreides.', '1995-12-27', 'Male', N'Mỹ', NULL),
    (N'Zendaya', N'Nữ diễn viên người Mỹ, đảm nhận vai Chani.', '1996-09-01', 'Female', N'Mỹ', NULL),
    (N'Rebecca Ferguson', N'Nữ diễn viên người Thụy Điển, đảm nhận vai Lady Jessica.', '1983-10-19', 'Female', N'Thụy Điển', NULL),

    (N'Ryan Reynolds', N'Nam diễn viên người Canada, đảm nhận vai Deadpool.', '1976-10-23', 'Male', N'Canada', NULL),
    (N'Hugh Jackman', N'Nam diễn viên người Australia, đảm nhận vai Wolverine.', '1968-10-12', 'Male', N'Úc', NULL),
    (N'Emma Corrin', N'Nữ diễn viên người Anh, đảm nhận vai Cassandra Nova.', '1995-12-13', 'Female', N'Anh', NULL),

    (N'Auli''i Cravalho', N'Nữ diễn viên người Mỹ, lồng tiếng nhân vật Moana.', '2000-11-22', 'Female', N'Mỹ', NULL),
    (N'Dwayne Johnson', N'Nam diễn viên người Mỹ, lồng tiếng nhân vật Maui.', '1972-05-02', 'Male', N'Mỹ', NULL),

    (N'Cynthia Erivo', N'Nữ diễn viên và ca sĩ người Anh, đảm nhận vai Elphaba.', '1987-01-08', 'Female', N'Anh', NULL),
    (N'Ariana Grande', N'Nữ ca sĩ và diễn viên người Mỹ, đảm nhận vai Glinda.', '1993-06-26', 'Female', N'Mỹ', NULL),

    (N'Maia Kealoha', N'Nữ diễn viên người Mỹ, đảm nhận vai Lilo.', NULL, 'Female', N'Mỹ', NULL),
    (N'Sydney Agudong', N'Nữ diễn viên người Mỹ, đảm nhận vai Nani.', '2000-11-13', 'Female', N'Mỹ', NULL),

    (N'Ginnifer Goodwin', N'Nữ diễn viên người Mỹ, lồng tiếng nhân vật Judy Hopps.', '1978-05-22', 'Female', N'Mỹ', NULL),
    (N'Jason Bateman', N'Nam diễn viên người Mỹ, lồng tiếng nhân vật Nick Wilde.', '1969-01-14', 'Male', N'Mỹ', NULL)
) AS V(FullName, Biography, DateOfBirth, Gender, Nationality, AvatarUrl)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Actors AS A
    WHERE A.FullName = V.FullName
);
GO


--=================================
-- Kiểm tra dữ liệu bảng Actors
--=================================


SELECT
    ActorId,
    FullName,
    Gender,
    Nationality,
    Status
FROM dbo.Actors
ORDER BY ActorId;
GO