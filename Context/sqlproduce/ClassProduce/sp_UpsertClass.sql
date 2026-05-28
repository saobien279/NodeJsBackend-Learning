-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Thêm mới hoặc cập nhật thông tin lớp học (Upsert) kèm kiểm tra nghiệp vụ
-- =============================================
CREATE PROCEDURE sp_UpsertClass
    @id INT = NULL,
    @code VARCHAR(50),
    @courseId INT,
    @teacherId INT,
    @semester VARCHAR(20),
    @maxStudents INT,
    @newId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. Kiểm tra rỗng các trường bắt buộc
        IF @code IS NULL OR LTRIM(RTRIM(@code)) = '' 
           OR @semester IS NULL OR LTRIM(RTRIM(@semester)) = ''
           OR @courseId IS NULL OR @courseId <= 0
           OR @teacherId IS NULL OR @teacherId <= 0
        BEGIN
            THROW 50001, N'Mã lớp (code), Học kỳ (semester), Môn học (courseId) và Giáo viên (teacherId) không được để trống!', 1;
        END

        -- 2. Kiểm tra tính hợp lệ của CourseId và TeacherId
        IF NOT EXISTS (SELECT 1 FROM Courses WHERE CourseId = @courseId)
        BEGIN
            THROW 50002, N'Môn học (CourseId) được chọn không tồn tại trên hệ thống!', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = @teacherId)
        BEGIN
            THROW 50003, N'Giáo viên (TeacherId) được chọn không tồn tại trên hệ thống!', 1;
        END

        -- 3. Cập nhật thông tin (Update)
        IF @id IS NOT NULL AND @id > 0
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Classes WHERE ClassId = @id)
            BEGIN
                THROW 50004, N'Lớp học cần cập nhật không tồn tại!', 1;
            END

            -- Kiểm tra trùng mã lớp với các lớp khác
            IF EXISTS (SELECT 1 FROM Classes WHERE ClassCode = @code AND ClassId <> @id)
            BEGIN
                THROW 50005, N'Mã lớp học này đã được sử dụng cho một lớp học khác!', 1;
            END

            -- Tiến hành cập nhật (không cập nhật trường Status để tránh xung đột nghiệp vụ)
            UPDATE Classes
            SET ClassCode = @code,
                CourseId = @courseId,
                TeacherId = @teacherId,
                Semester = @semester,
                MaxStudents = @maxStudents
            WHERE ClassId = @id;

            SET @newId = @id;
        END
        -- 4. Thêm mới (Create)
        ELSE
        BEGIN
            -- Kiểm tra trùng mã lớp
            IF EXISTS (SELECT 1 FROM Classes WHERE ClassCode = @code)
            BEGIN
                THROW 50005, N'Mã lớp học này đã tồn tại trong hệ thống!', 1;
            END

            INSERT INTO Classes (ClassCode, CourseId, TeacherId, Semester, MaxStudents, Status)
            VALUES (@code, @courseId, @teacherId, @semester, @maxStudents, 'Open');

            SET @newId = SCOPE_IDENTITY();
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
