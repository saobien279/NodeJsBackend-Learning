-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Lấy toàn bộ danh sách lớp học kèm thông tin Môn học và Giáo viên chủ nhiệm
-- =============================================
CREATE PROCEDURE sp_GetAllClasses
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 
            c.ClassId,
            c.ClassCode,
            c.CourseId,
            co.CourseName,
            c.TeacherId,
            u.FullName AS TeacherName,
            c.Semester,
            c.MaxStudents,
            c.Status
        FROM Classes c
        LEFT JOIN Courses co ON c.CourseId = co.CourseId
        LEFT JOIN Users u ON c.TeacherId = u.UserId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
