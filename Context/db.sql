```
USE AcademicManagement;
GO

-- Bảng Hệ Thống
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);

CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL, 
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    RoleId INT FOREIGN KEY REFERENCES Roles(RoleId),
    IsActive BIT DEFAULT 1
);

INSERT INTO Roles VALUES (1, 'Admin'), (2, 'Teacher'), (3, 'Student');
-- Lưu ý: Sinh viên cần tạo thêm script INSERT tài khoản Admin và Student mẫu để test.
GO

-- Bảng Danh Mục
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode VARCHAR(20) UNIQUE NOT NULL,
    DepartmentName NVARCHAR(100) NOT NULL
);

CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode VARCHAR(20) UNIQUE NOT NULL,
    CourseName NVARCHAR(150) NOT NULL,
    Credits INT CHECK (Credits > 0 AND Credits <= 10),
    DepartmentId INT FOREIGN KEY REFERENCES Departments(DepartmentId)
);

CREATE TABLE Classes (
    ClassId INT IDENTITY(1,1) PRIMARY KEY,
    ClassCode VARCHAR(50) UNIQUE NOT NULL, 
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId),
    TeacherId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId),
    Semester VARCHAR(20) NOT NULL, 
    MaxStudents INT DEFAULT 40,
    Status VARCHAR(20) DEFAULT 'Open' 
);
GO

-- Bảng Nghiệp Vụ
CREATE TABLE Enrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    ClassId INT FOREIGN KEY REFERENCES Classes(ClassId),
    StudentId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserId),
    EnrollmentDate DATETIME DEFAULT GETDATE(),
    MidtermGrade FLOAT CHECK (MidtermGrade >= 0 AND MidtermGrade <= 10),
    FinalGrade FLOAT CHECK (FinalGrade >= 0 AND FinalGrade <= 10),
    AverageGrade AS ((MidtermGrade * 0.4) + (FinalGrade * 0.6)) PERSISTED, 
    CONSTRAINT UQ_Student_Class UNIQUE (ClassId, StudentId)
);
GO
```