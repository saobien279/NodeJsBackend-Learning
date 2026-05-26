-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-26
-- Description: Kiểm tra tính hợp lệ của Email, RoleId, Username và Email trùng lặp trước khi tạo User mới.
-- =============================================
ALTER PROCEDURE sp_ValidateUserCreation
    @Email VARCHAR(100),
    @Username VARCHAR(50),
    @RoleId INT,
    @UserId INT = NULL, -- Thêm tham số này (mặc định là NULL cho Add)
    @IsValid BIT OUTPUT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @IsValid = 1;
    SET @ErrorMessage = NULL;

    -- 1. Kiểm tra Email hợp lệ (Add & Update giống nhau)
    IF @Email NOT LIKE '%_@_%._%' OR CHARINDEX(' ', @Email) > 0
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = N'Định dạng Email không hợp lệ!';
        RETURN;
    END

    -- 2. Kiểm tra RoleId có tồn tại (Add & Update giống nhau)
    IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleId = @RoleId)
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = N'Vai trò không tồn tại!';
        RETURN;
    END

    -- 3. Kiểm tra trùng Username (Loại trừ chính mình nếu là Update)
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE Username = @Username 
          AND (@UserId IS NULL OR UserId <> @UserId) -- Thêm điều kiện này
    )
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = N'Tên đăng nhập (Username) đã tồn tại ở tài khoản khác!';
        RETURN;
    END

    -- 4. Kiểm tra trùng Email (Loại trừ chính mình nếu là Update)
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE Email = @Email 
          AND (@UserId IS NULL OR UserId <> @UserId) -- Thêm điều kiện này
    )
    BEGIN
        SET @IsValid = 0;
        SET @ErrorMessage = N'Địa chỉ Email đã được sử dụng bởi tài khoản khác!';
        RETURN;
    END
END
