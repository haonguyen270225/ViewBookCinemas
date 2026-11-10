
USE ViewBookCinemasDB;
GO

-- =========================================
-- 1. BỔ SUNG ROLE MANAGER NẾU CHƯA TỒN TẠI
-- =========================================

IF NOT EXISTS (
    SELECT 1 FROM dbo.Roles
    WHERE RoleName = 'Manager'
)
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description)
    VALUES ('Manager', N'Quản lý hệ thống rạp chiếu phim');
END;
GO

-- =========================================
-- 2. LẤY ROLE ID
-- =========================================

DECLARE @AdminRoleId INT;
DECLARE @StaffRoleId INT;
DECLARE @ManagerRoleId INT;
DECLARE @CustomerRoleId INT;

SELECT @AdminRoleId = RoleId
FROM dbo.Roles WHERE RoleName = 'Admin';

SELECT @StaffRoleId = RoleId
FROM dbo.Roles WHERE RoleName = 'Staff';

SELECT @ManagerRoleId = RoleId
FROM dbo.Roles WHERE RoleName = 'Manager';

SELECT @CustomerRoleId = RoleId
FROM dbo.Roles WHERE RoleName = 'Customer';

-- =========================================
-- 3. THÊM 20 USERS
-- =========================================

INSERT INTO dbo.Users
(
    RoleId,
    Username,
    Email,
    PasswordHash,
    FullName,
    PhoneNumber,
    DateOfBirth,
    Gender,
    Address
)
VALUES
-- 1 ADMIN
(@AdminRoleId, 'admin01', 'admin01@viewbookcinemas.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Nguyễn Văn Admin', '0900000001', '1990-01-01', 'Male', N'Cần Thơ'),

-- 3 STAFF
(@StaffRoleId, 'staff01', 'staff01@viewbookcinemas.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Nguyễn Văn An', '0900000002', '1998-02-10', 'Male', N'Cần Thơ'),

(@StaffRoleId, 'staff02', 'staff02@viewbookcinemas.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Trần Thị Bình', '0900000003', '1999-03-15', 'Female', N'Vĩnh Long'),

(@StaffRoleId, 'staff03', 'staff03@viewbookcinemas.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Lê Văn Cường', '0900000004', '1997-04-20', 'Male', N'An Giang'),

-- 1 MANAGER
(@ManagerRoleId, 'manager01', 'manager01@viewbookcinemas.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Phạm Thị Dung', '0900000005', '1992-05-25', 'Female', N'Cần Thơ'),

-- 15 CUSTOMER
(@CustomerRoleId, 'customer01', 'customer01@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Nguyễn Minh Hoàng', '0900000006', '2002-01-10', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer02', 'customer02@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Trần Ngọc Mai', '0900000007', '2003-02-12', 'Female', N'Cần Thơ'),

(@CustomerRoleId, 'customer03', 'customer03@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Lê Quốc Bảo', '0900000008', '2001-03-14', 'Male', N'Vĩnh Long'),

(@CustomerRoleId, 'customer04', 'customer04@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Phạm Thùy Linh', '0900000009', '2002-04-16', 'Female', N'An Giang'),

(@CustomerRoleId, 'customer05', 'customer05@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Hoàng Đức Anh', '0900000010', '2000-05-18', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer06', 'customer06@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Võ Khánh Vy', '0900000011', '2003-06-20', 'Female', N'Sóc Trăng'),

(@CustomerRoleId, 'customer07', 'customer07@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Đặng Minh Tuấn', '0900000012', '2001-07-22', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer08', 'customer08@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Bùi Ngọc Hân', '0900000013', '2002-08-24', 'Female', N'Hậu Giang'),

(@CustomerRoleId, 'customer09', 'customer09@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Đỗ Thành Đạt', '0900000014', '2000-09-26', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer10', 'customer10@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Nguyễn Thảo My', '0900000015', '2003-10-28', 'Female', N'Vĩnh Long'),

(@CustomerRoleId, 'customer11', 'customer11@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Trương Hoàng Nam', '0900000016', '2001-11-12', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer12', 'customer12@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Phan Bảo Ngọc', '0900000017', '2002-12-14', 'Female', N'An Giang'),

(@CustomerRoleId, 'customer13', 'customer13@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Vũ Gia Huy', '0900000018', '2000-01-16', 'Male', N'Cần Thơ'),

(@CustomerRoleId, 'customer14', 'customer14@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Đinh Quỳnh Như', '0900000019', '2003-02-18', 'Female', N'Sóc Trăng'),

(@CustomerRoleId, 'customer15', 'customer15@gmail.com',
 'REPLACE_WITH_REAL_PASSWORD_HASH',
 N'Đào Nhật Minh', '0900000020', '2001-03-20', 'Male', N'Cần Thơ');
GO

-- =========================================
-- 4. KIỂM TRA DANH SÁCH USERS
-- =========================================

SELECT
    U.UserId,
    U.Username,
    U.Email,
    U.FullName,
    R.RoleName,
    U.Status,
    U.CreatedAt
FROM dbo.Users AS U
INNER JOIN dbo.Roles AS R
    ON U.RoleId = R.RoleId
ORDER BY U.UserId;
GO

-- =========================================
-- 5. THỐNG KÊ SỐ LƯỢNG THEO ROLE
-- =========================================

SELECT
    R.RoleName,
    COUNT(U.UserId) AS TotalUsers
FROM dbo.Roles AS R
LEFT JOIN dbo.Users AS U
    ON R.RoleId = U.RoleId
GROUP BY R.RoleName
ORDER BY R.RoleName;
GO
