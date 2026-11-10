USE ViewBookCinemasDB;
GO

INSERT INTO dbo.Genres
(
    GenreName,
    Description
)
SELECT
    V.GenreName,
    V.Description
FROM
(
    VALUES
    (N'Hành động', N'Thể loại phim có nhiều cảnh hành động, chiến đấu và rượt đuổi.'),
    (N'Hài', N'Thể loại phim mang tính giải trí, tạo tiếng cười cho khán giả.'),
    (N'Tâm lý', N'Thể loại phim tập trung khai thác tâm lý và cảm xúc nhân vật.'),
    (N'Tình cảm', N'Thể loại phim xoay quanh tình yêu và các mối quan hệ tình cảm.'),
    (N'Chính kịch', N'Thể loại phim khai thác những câu chuyện và vấn đề trong cuộc sống.'),
    (N'Hoạt hình', N'Thể loại phim được xây dựng bằng kỹ thuật hoạt hình.'),
    (N'Phiêu lưu', N'Thể loại phim xoay quanh những chuyến hành trình và khám phá.'),
    (N'Khoa học viễn tưởng', N'Thể loại phim khai thác khoa học, công nghệ và thế giới tương lai.'),
    (N'Gia đình', N'Thể loại phim phù hợp với gia đình và khai thác tình cảm gia đình.'),
    (N'Lịch sử', N'Thể loại phim tái hiện các sự kiện và bối cảnh lịch sử.'),
    (N'Chiến tranh', N'Thể loại phim khai thác các cuộc chiến và hậu quả của chiến tranh.'),
    (N'Giả tưởng', N'Thể loại phim có yếu tố phép thuật, thế giới tưởng tượng và siêu nhiên.')
) AS V(GenreName, Description)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Genres AS G
    WHERE G.GenreName = V.GenreName
);
GO


--==========================
-- Kiểm tra dữ liệu bảng Genres
--==========================

SELECT *
FROM dbo.Genres
ORDER BY GenreId;
GO