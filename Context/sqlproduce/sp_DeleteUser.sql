-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-26
-- Description: Kiểm tra tồn tại và xóa người dùng theo ID (Kỹ thuật 2 trong 1)
-- =============================================
ALTER PROCEDURE sp_DeleteUser
    @UserId INT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra xem User có tồn tại trong hệ thống không
    IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = @UserId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Người dùng với ID = ' + CAST(@UserId AS VARCHAR(10)) + N' không tồn tại trong hệ thống!';
        RETURN;
    END

    -- 2. Nếu tồn tại, tiến hành xóa
    BEGIN TRY
        DELETE FROM Users WHERE UserId = @UserId;
        
        SET @IsSuccess = 1;
        SET @Message = N'Xóa người dùng thành công!';
    END TRY
    BEGIN CATCH
        SET @IsSuccess = 0;
        SET @Message = N'Lỗi khi xóa người dùng: ' + ERROR_MESSAGE();
    END CATCH
END
