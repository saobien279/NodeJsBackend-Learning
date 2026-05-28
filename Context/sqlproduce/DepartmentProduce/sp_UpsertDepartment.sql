-- =============================================
-- Author:      Backend Developer
-- Create date: 2026-05-28
-- Description: Thêm mới hoặc Cập nhật thông tin khoa (Upsert)
-- =============================================
CREATE PROCEDURE sp_UpsertDepartment
    @id INT = NULL,
    @code VARCHAR(20),
    @name NVARCHAR(100),
    @newId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. Kiểm tra rỗng đầu vào
        IF @code IS NULL OR LTRIM(RTRIM(@code)) = '' OR @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        BEGIN
            THROW 50001, N'Mã khoa (DepartmentCode) và Tên khoa (DepartmentName) không được để trống!', 1;
        END

        -- 2. Thực hiện cập nhật nếu có ID truyền vào
        IF @id IS NOT NULL AND @id > 0
        BEGIN
            -- Kiểm tra xem khoa có tồn tại không
            IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentId = @id)
            BEGIN
                THROW 50002, N'Khoa không tồn tại trong hệ thống để cập nhật!', 1;
            END

            -- Kiểm tra trùng mã khoa với các khoa khác
            IF EXISTS (SELECT 1 FROM Departments WHERE DepartmentCode = @code AND DepartmentId <> @id)
            BEGIN
                THROW 50003, N'Mã khoa đã được sử dụng ở khoa khác!', 1;
            END

            -- Cập nhật
            UPDATE Departments
            SET DepartmentCode = @code,
                DepartmentName = @name
            WHERE DepartmentId = @id;

            SET @newId = @id;
        END
        -- 3. Thực hiện thêm mới nếu không có ID
        ELSE
        BEGIN
            -- Kiểm tra trùng mã khoa
            IF EXISTS (SELECT 1 FROM Departments WHERE DepartmentCode = @code)
            BEGIN
                THROW 50003, N'Mã khoa đã tồn tại trong hệ thống!', 1;
            END

            INSERT INTO Departments (DepartmentCode, DepartmentName)
            VALUES (@code, @name);

            SET @newId = SCOPE_IDENTITY();
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
