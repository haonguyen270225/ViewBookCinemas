CREATE TABLE dbo.MovieActors
(
    MovieId INT NOT NULL,
    ActorId INT NOT NULL,
    CharacterName NVARCHAR(150) NULL,
    RoleType VARCHAR(30) NULL,
    DisplayOrder INT NOT NULL
        CONSTRAINT DF_MovieActors_DisplayOrder DEFAULT 0,

    CONSTRAINT PK_MovieActors
        PRIMARY KEY (MovieId, ActorId),

    CONSTRAINT FK_MovieActors_Movies
        FOREIGN KEY (MovieId)
        REFERENCES dbo.Movies(MovieId),

    CONSTRAINT FK_MovieActors_Actors
        FOREIGN KEY (ActorId)
        REFERENCES dbo.Actors(ActorId)
);
GO