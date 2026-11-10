CREATE TABLE dbo.MovieGenres
(
    MovieId INT NOT NULL,
    GenreId INT NOT NULL,

    CONSTRAINT PK_MovieGenres
        PRIMARY KEY (MovieId, GenreId),

    CONSTRAINT FK_MovieGenres_Movies
        FOREIGN KEY (MovieId)
        REFERENCES dbo.Movies(MovieId),

    CONSTRAINT FK_MovieGenres_Genres
        FOREIGN KEY (GenreId)
        REFERENCES dbo.Genres(GenreId)
);
GO