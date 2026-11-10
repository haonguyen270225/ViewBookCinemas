USE ViewBookCinemasDB;
GO

INSERT INTO dbo.MovieReviews
(
    UserId,
    MovieId,
    Rating,
    Comment
)
VALUES
-- Đánh giá phim Mai (MovieId = 1)
(1, 1, 9.0, N'Một bộ phim rất cảm động, nội dung sâu sắc và diễn xuất tuyệt vời.'),
(2, 1, 8.5, N'Cốt truyện hay, có nhiều phân cảnh khiến mình xúc động.'),
(3, 1, 7.5, N'Phim khá tốt nhưng một số đoạn diễn biến hơi dài.'),

-- Đánh giá phim Lật Mặt 7: Một Điều Ước (MovieId = 2)
(4, 2, 9.0, N'Nội dung ý nghĩa, truyền tải thông điệp rất tốt về tình cảm gia đình.'),
(5, 2, 8.0, N'Diễn viên diễn tự nhiên, phim có nhiều phân cảnh cảm động.'),

-- Đánh giá phim Đào, Phở và Piano (MovieId = 3)
(6, 3, 8.5, N'Bộ phim có giá trị lịch sử và hình ảnh được đầu tư tốt.'),

-- Đánh giá phim Inside Out 2 (MovieId = 4)
(7, 4, 9.0, N'Phim hoạt hình rất hay, nội dung ý nghĩa và phù hợp với nhiều lứa tuổi.'),
(8, 4, 8.5, N'Các nhân vật cảm xúc mới rất thú vị, hình ảnh đẹp.'),

-- Đánh giá phim Dune: Part Two (MovieId = 5)
(9, 5, 9.5, N'Phần hình ảnh và âm thanh xuất sắc, trải nghiệm điện ảnh tuyệt vời.'),
(10, 5, 8.0, N'Thế giới trong phim được xây dựng rất tốt nhưng nội dung hơi khó theo dõi.'),

-- Đánh giá phim Deadpool & Wolverine (MovieId = 6)
(11, 6, 9.0, N'Hài hước, hành động mãn nhãn và có nhiều tình tiết bất ngờ.'),
(12, 6, 7.0, N'Phim giải trí tốt nhưng có một số đoạn hài chưa thực sự phù hợp.'),

-- Đánh giá phim Moana 2 (MovieId = 7)
(13, 7, 8.0, N'Âm nhạc hay, hình ảnh đẹp và câu chuyện dễ thương.'),

-- Đánh giá phim Wicked (MovieId = 8)
(14, 8, 8.5, N'Âm nhạc tuyệt vời, diễn xuất tốt và phần hình ảnh rất ấn tượng.'),

-- Đánh giá phim Lilo & Stitch (MovieId = 9)
(15, 9, 9.0, N'Câu chuyện dễ thương, hài hước và mang thông điệp ý nghĩa về gia đình.');
GO


-- =============================================
-- Kiểm tra dữ liệu vừa thêm MovieReviews
-- =============================================
SELECT
    ReviewId,
    UserId,
    MovieId,
    Rating,
    Comment,
    CreatedAt,
    UpdatedAt
FROM dbo.MovieReviews
ORDER BY ReviewId;
GO