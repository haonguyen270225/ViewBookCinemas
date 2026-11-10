
-- =============================================
-- 4. INSERT DEFAULT ROLES
-- =============================================

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Admin')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Admin', N'Quản trị viên hệ thống');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Staff')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Staff', N'Nhân viên rạp chiếu phim');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Customer')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Customer', N'Khách hàng sử dụng dịch vụ');
END;
GO

-- =============================================
-- 5. CHECK DATA
-- =============================================

SELECT * FROM dbo.Roles;

SELECT * FROM dbo.Users;
GO
