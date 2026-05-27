-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-27
-- Description: Lấy chi tiết thông tin môn học theo CourseId
-- =============================================
CREATE PROCEDURE sp_GetCourseById
    @CourseId INT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Courses WHERE CourseId = @CourseId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Môn học không tồn tại!';
        RETURN;
    END

    SET @IsSuccess = 1;
    SET @Message = N'Lấy thông tin môn học thành công!';
    
    SELECT * FROM Courses WHERE CourseId = @CourseId;
END
GO
