-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-27
-- Description: Thêm môn học mới kèm kiểm tra tính hợp lệ của số tín chỉ và tính duy nhất của mã môn học
-- =============================================
CREATE PROCEDURE sp_CreateCourse
    @CourseCode VARCHAR(20),
    @CourseName NVARCHAR(100),
    @Credits INT,
    @DepartmentId INT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT,
    @NewCourseId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @IsSuccess = 1;
    SET @Message = NULL;
    SET @NewCourseId = 0;

    -- 1. Kiểm tra tính hợp lệ của số tín chỉ (Credits)
    IF @Credits < 1 OR @Credits > 10
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Số tín chỉ (Credits) phải nằm trong khoảng từ 1 đến 10!';
        RETURN;
    END

    -- 2. Kiểm tra mã môn học đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM Courses WHERE CourseCode = @CourseCode)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Mã môn học (CourseCode) ''' + CAST(@CourseCode AS NVARCHAR(20)) + N''' đã tồn tại trong hệ thống!';
        RETURN;
    END

    -- 3. Tiến hành Insert
    BEGIN TRY
        INSERT INTO Courses (CourseCode, CourseName, Credits, DepartmentId)
        VALUES (@CourseCode, @CourseName, @Credits, @DepartmentId);

        SET @NewCourseId = SCOPE_IDENTITY();
        SET @IsSuccess = 1;
        SET @Message = N'Thêm môn học mới thành công!';
    END TRY
    BEGIN CATCH
        SET @IsSuccess = 0;
        SET @Message = N'Lỗi khi thêm môn học: ' + ERROR_MESSAGE();
    END CATCH
END
GO
