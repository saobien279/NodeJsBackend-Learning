-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-27
-- Description: Cập nhật môn học kèm kiểm tra sự tồn tại, tính hợp lệ của tín chỉ và loại trừ trùng mã
-- =============================================
CREATE PROCEDURE sp_UpdateCourse
    @CourseId INT,
    @CourseCode VARCHAR(20),
    @CourseName NVARCHAR(100),
    @Credits INT,
    @DepartmentId INT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @IsSuccess = 1;
    SET @Message = NULL;

    -- 1. Kiểm tra xem môn học có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Courses WHERE CourseId = @CourseId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Môn học với ID = ' + CAST(@CourseId AS VARCHAR(10)) + N' không tồn tại!';
        RETURN;
    END

    -- 2. Kiểm tra tính hợp lệ của số tín chỉ (Credits)
    IF @Credits < 1 OR @Credits > 10
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Số tín chỉ (Credits) phải nằm trong khoảng từ 1 đến 10!';
        RETURN;
    END

    -- 3. Kiểm tra trùng mã môn học (loại trừ chính nó)
    IF EXISTS (SELECT 1 FROM Courses WHERE CourseCode = @CourseCode AND CourseId <> @CourseId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Mã môn học (CourseCode) ''' + CAST(@CourseCode AS NVARCHAR(20)) + N''' đã được sử dụng ở một môn học khác!';
        RETURN;
    END

    -- 4. Tiến hành cập nhật
    BEGIN TRY
        UPDATE Courses
        SET CourseCode = @CourseCode,
            CourseName = @CourseName,
            Credits = @Credits,
            DepartmentId = @DepartmentId
        WHERE CourseId = @CourseId;

        SET @IsSuccess = 1;
        SET @Message = N'Cập nhật thông tin môn học thành công!';
    END TRY
    BEGIN CATCH
        SET @IsSuccess = 0;
        SET @Message = N'Lỗi cập nhật môn học: ' + ERROR_MESSAGE();
    END CATCH
END
GO
