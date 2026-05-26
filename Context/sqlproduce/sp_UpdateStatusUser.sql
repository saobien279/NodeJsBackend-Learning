-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-26
-- Description: Kiểm tra tồn tại và cập nhật trạng thái hoạt động (Kích hoạt/Khóa) của người dùng (Kỹ thuật 2 trong 1)
-- =============================================
ALTER PROCEDURE sp_UpdateStatusUser
    @UserId INT,
    @IsActive BIT,
    @IsSuccess BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra xem User có tồn tại trong hệ thống không
    IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = @UserId)
    BEGIN
        SET @IsSuccess = 0;
        SET @Message = N'Người dùng với ID = ' + CAST(@UserId AS VARCHAR(10)) + N' không tồn tại!';
        RETURN;
    END

    -- 2. Nếu tồn tại, tiến hành cập nhật trạng thái
    BEGIN TRY
        UPDATE Users 
        SET IsActive = @IsActive 
        WHERE UserId = @UserId;
        
        SET @IsSuccess = 1;
        IF @IsActive = 1
            SET @Message = N'Kích hoạt tài khoản thành công!';
        ELSE
            SET @Message = N'Đã khóa tài khoản người dùng!';
    END TRY
    BEGIN CATCH
        SET @IsSuccess = 0;
        SET @Message = N'Lỗi cập nhật trạng thái: ' + ERROR_MESSAGE();
    END CATCH
END
