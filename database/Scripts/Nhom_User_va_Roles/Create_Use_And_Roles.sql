-- =============================================
-- PROJECT: ViewBookCinemas (VBC)
-- DATABASE: ViewBookCinemasDB
-- TABLES: Roles, Users
-- =============================================

-- 1. CREATE DATABASE
IF DB_ID(N'ViewBookCinemasDB') IS NULL
BEGIN
    CREATE DATABASE ViewBookCinemasDB;
END
GO

USE ViewBookCinemasDB;
GO

-- =============================================
-- 2. CREATE TABLE: Roles
-- =============================================

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles
    (
        RoleId INT IDENTITY(1,1) NOT NULL,

        RoleName VARCHAR(50) NOT NULL,

        Description NVARCHAR(500) NULL,

        Status BIT NOT NULL
            CONSTRAINT DF_Roles_Status DEFAULT 1,

        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSDATETIME(),

        UpdatedAt DATETIME2 NULL,

        -- PRIMARY KEY
        CONSTRAINT PK_Roles
            PRIMARY KEY (RoleId),

        -- UNIQUE
        CONSTRAINT UQ_Roles_RoleName
            UNIQUE (RoleName)
    );
END
GO

-- =============================================
-- 3. CREATE TABLE: Users
-- =============================================

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId INT IDENTITY(1,1) NOT NULL,

        RoleId INT NOT NULL,

        Username VARCHAR(50) NOT NULL,

        Email VARCHAR(150) NOT NULL,

        PasswordHash VARCHAR(255) NOT NULL,

        FullName NVARCHAR(100) NOT NULL,

        PhoneNumber VARCHAR(15) NULL,

        DateOfBirth DATE NULL,

        Gender VARCHAR(10) NULL,

        AvatarUrl NVARCHAR(500) NULL,

        Address NVARCHAR(500) NULL,

        IsEmailVerified BIT NOT NULL
            CONSTRAINT DF_Users_IsEmailVerified DEFAULT 0,

        Status VARCHAR(20) NOT NULL
            CONSTRAINT DF_Users_Status DEFAULT 'Active',

        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),

        UpdatedAt DATETIME2 NULL,

        -- PRIMARY KEY
        CONSTRAINT PK_Users
            PRIMARY KEY (UserId),

        -- UNIQUE
        CONSTRAINT UQ_Users_Username
            UNIQUE (Username),

        CONSTRAINT UQ_Users_Email
            UNIQUE (Email),

        -- FOREIGN KEY
        CONSTRAINT FK_Users_Roles
            FOREIGN KEY (RoleId)
            REFERENCES dbo.Roles(RoleId)
    );
END
GO