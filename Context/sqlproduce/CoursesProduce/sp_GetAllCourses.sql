-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-27
-- Description: Lấy toàn bộ danh sách môn học trong hệ thống
-- =============================================
CREATE PROCEDURE sp_GetAllCourses
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Courses;
END
GO
