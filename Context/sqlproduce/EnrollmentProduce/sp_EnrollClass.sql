-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Đăng ký lớp học (Enroll) với đầy đủ 3 bước kiểm tra nghiệp vụ và xử lý giao dịch (ACID)
-- =============================================
CREATE PROCEDURE sp_EnrollClass
    @ClassId INT,
    @StudentId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra 1: Lớp học có tồn tại và đang mở (Status = 'Open') không
    IF NOT EXISTS (SELECT 1 FROM Classes WHERE ClassId = @ClassId)
    BEGIN
        THROW 50001, N'Lớp không tồn tại hoặc đã đóng', 1;
        RETURN;
    END

    DECLARE @ClassStatus VARCHAR(20);
    DECLARE @MaxStudents INT;
    SELECT @ClassStatus = Status, @MaxStudents = MaxStudents 
    FROM Classes 
    WHERE ClassId = @ClassId;

    IF @ClassStatus <> 'Open'
    BEGIN
        THROW 50001, N'Lớp không tồn tại hoặc đã đóng', 1;
        RETURN;
    END

    -- 2. Kiểm tra 2: Sĩ số lớp học hiện tại (Class Capacity)
    DECLARE @CurrentCount INT;
    SELECT @CurrentCount = COUNT(*) 
    FROM Enrollments 
    WHERE ClassId = @ClassId;

    IF @CurrentCount >= @MaxStudents
    BEGIN
        THROW 50002, N'Lớp đã đủ sĩ số', 1;
        RETURN;
    END

    -- 3. Kiểm tra 3: Đăng ký trùng lặp (Duplicate Enrollment)
    IF EXISTS (SELECT 1 FROM Enrollments WHERE ClassId = @ClassId AND StudentId = @StudentId)
    BEGIN
        THROW 50003, N'Bạn đã đăng ký lớp học này rồi', 1;
        RETURN;
    END

    -- 4. Thực hiện đăng ký nếu tất cả các bước kiểm tra đều hợp lệ
    INSERT INTO Enrollments (ClassId, StudentId, EnrollmentDate)
    VALUES (@ClassId, @StudentId, GETDATE());
END
GO
