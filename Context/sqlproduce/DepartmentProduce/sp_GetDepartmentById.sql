-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Lấy thông tin khoa theo ID
-- =============================================
CREATE PROCEDURE sp_GetDepartmentById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT * FROM Departments WHERE DepartmentId = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
