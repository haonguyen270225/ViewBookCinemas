
USE ViewBookCinemasDB;
GO

CREATE TABLE dbo.MovieReviews
(
    ReviewId INT IDENTITY(1,1) NOT NULL,

    UserId INT NOT NULL,
    MovieId INT NOT NULL,

    Rating DECIMAL(3,1) NOT NULL,
    Comment NVARCHAR(1000) NULL,

    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_MovieReviews_CreatedAt
        DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    -- Primary Key
    CONSTRAINT PK_MovieReviews
        PRIMARY KEY (ReviewId),

    -- Foreign Key
    CONSTRAINT FK_MovieReviews_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId),

    CONSTRAINT FK_MovieReviews_Movies
        FOREIGN KEY (MovieId)
        REFERENCES dbo.Movies(MovieId),

    -- Rating từ 1 đến 10
    CONSTRAINT CK_MovieReviews_Rating
        CHECK (Rating BETWEEN 1 AND 10),

    -- Mỗi user chỉ đánh giá một phim một lần
    CONSTRAINT UQ_MovieReviews_User_Movie
        UNIQUE (UserId, MovieId)
);
GO
