-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-27
-- Description: Xóa môn học theo ID kèm kiểm tra sự tồn tại (Kỹ thuật 2 trong 1)
-- =============================================
CREATE PROCEDURE sp_DeleteCourse
    @CourseId INT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @IsSuccess = 1;
    SET @Message = NULL;

    -- 1. Kiểm tra tồn tại
    IF NOT EXISTS (SELECT 1 FROM Courses WHERE CourseId = @CourseId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Môn học với ID = ' + CAST(@CourseId AS VARCHAR(10)) + N' không tồn tại!';
        RETURN;
    END

    -- 2. Tiến hành xóa
    BEGIN TRY
        DELETE FROM Courses WHERE CourseId = @CourseId;

        SET @IsSuccess = 1;
        SET @Message = N'Xóa môn học thành công!';
    END TRY
    BEGIN CATCH
        SET @IsSuccess = 0;
        SET @Message = N'Lỗi khi xóa môn học: ' + ERROR_MESSAGE();
    END CATCH
END
GO
