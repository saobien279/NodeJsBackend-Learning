-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Xóa khoa theo ID kèm kiểm tra tồn tại bằng THROW
-- =============================================
CREATE PROCEDURE sp_DeleteDepartment
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. Kiểm tra tồn tại
        IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentId = @id)
        BEGIN
            THROW 50002, N'Khoa không tồn tại trong hệ thống để thực hiện xóa!', 1;
        END

        -- 2. Tiến hành xóa
        DELETE FROM Departments WHERE DepartmentId = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
