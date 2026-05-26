USE AcademicManagement;
GO

-- 1. XÓA BẢNG CŨ (Để tránh lỗi khóa ngoại khi thay đổi kiểu dữ liệu)
IF OBJECT_ID('dbo.Enrollments', 'U') IS NOT NULL DROP TABLE dbo.Enrollments;
IF OBJECT_ID('dbo.Classes', 'U') IS NOT NULL DROP TABLE dbo.Classes;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
GO

-- 2. TẠO LẠI CÁC BẢNG HỆ THỐNG VỚI USERID LÀ INT IDENTITY
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY, -- Thay đổi sang INT tự tăng
    Username VARCHAR(50) UNIQUE NOT NULL, 
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    RoleId INT FOREIGN KEY REFERENCES Roles(RoleId),
    IsActive BIT DEFAULT 1
);

INSERT INTO Roles VALUES (1, 'Admin'), (2, 'Teacher'), (3, 'Student');
GO

-- Tạo lại các bảng nghiệp vụ liên quan với khóa ngoại INT cho TeacherId và StudentId
CREATE TABLE Classes (
    ClassId INT IDENTITY(1,1) PRIMARY KEY,
    ClassCode VARCHAR(50) UNIQUE NOT NULL, 
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId),
    TeacherId INT FOREIGN KEY REFERENCES Users(UserId), -- Thay đổi sang INT
    Semester VARCHAR(20) NOT NULL, 
    MaxStudents INT DEFAULT 40,
    Status VARCHAR(20) DEFAULT 'Open' 
);

CREATE TABLE Enrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    StudentId INT FOREIGN KEY REFERENCES Users(UserId), -- Thay đổi sang INT
    EnrollmentDate DATETIME DEFAULT GETDATE(),
    MidtermGrade FLOAT CHECK (MidtermGrade >= 0 AND MidtermGrade <= 10),
    FinalGrade FLOAT CHECK (FinalGrade >= 0 AND FinalGrade <= 10),
    AverageGrade AS ((MidtermGrade * 0.4) + (FinalGrade * 0.6)) PERSISTED, 
    CONSTRAINT UQ_Student_Class UNIQUE (ClassId, StudentId)
);
GO

-- 3. TẠO MẪU USER ADMIN BAN ĐẦU
-- Mật khẩu mẫu đã được băm bằng bcrypt: Abc@12345 (hash: '$2b$10$tZ2c6U1WdJk1y4d87Wb7du8y5v7K156/6J3.456g89.HJKL7QW')
-- Tuy nhiên để đơn giản khi test, bạn sẽ băm lại khi chạy code, dưới đây là tài khoản admin mặc định:
INSERT INTO Users (Username, PasswordHash, FullName, Email, RoleId, IsActive)
VALUES ('admin', '$2b$10$nK4sCg9.97bT4lqA0mK9o.gPZk.uR8aL286X5y84F5j2h7d51lWJ.', N'Quản trị viên', 'admin@academic.edu.vn', 1, 1);
GO


-- =========================================================================
-- 4. TẠO CÁC STORED PROCEDURE CẦN THIẾT
-- =========================================================================

-- A. Lấy thông tin user bằng Username (dùng cho Login)
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, PasswordHash, RoleId, IsActive
    FROM Users
    WHERE Username = @Username;
END;
GO

-- B. Lấy danh sách toàn bộ người dùng (GET api/user/GetAllUser)
CREATE OR ALTER PROCEDURE sp_GetUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.UserId, u.Username, u.FullName, u.Email, u.RoleId, r.RoleName, u.IsActive
    FROM Users u
    INNER JOIN Roles r ON u.RoleId = r.RoleId
    ORDER BY u.UserId DESC;
END;
GO

-- C. Thêm người dùng mới (POST api/user/AddUser - Gộp cả Register)
CREATE OR ALTER PROCEDURE sp_AddUser
    @Username VARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(100),
    @Email VARCHAR(100),
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Users (Username, PasswordHash, FullName, Email, RoleId, IsActive)
    VALUES (@Username, @PasswordHash, @FullName, @Email, @RoleId, 1);
    
    -- Trả về ID của user vừa được tạo
    SELECT SCOPE_IDENTITY() AS UserId;
END;
GO

-- D. Cập nhật người dùng (PUT api/user/UpdateUser)
CREATE OR ALTER PROCEDURE sp_UpdateUser
    @UserId INT,
    @Username VARCHAR(50),
    @FullName NVARCHAR(100),
    @Email VARCHAR(100),
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET Username = @Username,
        FullName = @FullName,
        Email = @Email,
        RoleId = @RoleId
    WHERE UserId = @UserId;
END;
GO

-- E. Xóa người dùng (DELETE api/user/DeleteUser)
CREATE OR ALTER PROCEDURE sp_DeleteUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Users WHERE UserId = @UserId;
END;
GO

-- F. Cập nhật trạng thái người dùng (PUT api/user/UpdateStatusUser)
CREATE OR ALTER PROCEDURE sp_UpdateStatusUser
    @UserId INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET IsActive = @IsActive
    WHERE UserId = @UserId;
END;
GO
