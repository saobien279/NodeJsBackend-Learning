-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Cập nhật trạng thái lớp học (Đóng/Mở/Xóa mềm - Cancelled) kèm kiểm tra đăng ký học sinh
-- =============================================
CREATE PROCEDURE sp_UpdateClassStatus
    @id INT,
    @status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. Kiểm tra lớp học có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM Classes WHERE ClassId = @id)
        BEGIN
            THROW 50001, N'Lớp học không tồn tại trong hệ thống!', 1;
        END

        -- 2. Nghiệp vụ Soft Delete / Đóng lớp học
        -- Nếu chuyển trạng thái thành Cancelled hoặc Closed, kiểm tra xem đã có học sinh đăng ký (Enrollments) chưa
        IF @status = 'Cancelled' OR @status = 'Closed'
        BEGIN
            -- Giả định bảng Enrollments liên kết với Classes bằng cột ClassId
            IF EXISTS (SELECT 1 FROM Enrollments WHERE ClassId = @id)
            BEGIN
                THROW 50002, N'Không thể hủy hoặc đóng lớp học đã có học sinh đăng ký học tập!', 1;
            END
        END

        -- 3. Tiến hành cập nhật trạng thái
        UPDATE Classes
        SET Status = @status
        WHERE ClassId = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
