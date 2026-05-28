-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Lấy toàn bộ danh sách khoa trong hệ thống
-- =============================================
CREATE PROCEDURE sp_GetAllDepartments
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT * FROM Departments;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
