const { sql } = require('../config/db.config');

/**
 * Đăng ký lớp học cho sinh viên (Enroll Class)
 * Sử dụng Transaction của mssql để bảo đảm tính toàn vẹn dữ liệu (ACID)
 */
const enrollClass = async (req, res) => {
    // Khởi tạo Transaction của mssql
    const transaction = new sql.Transaction();

    try {
        const { classId } = req.body;
        const studentId = req.user?.UserId; // Lấy từ verifyToken middleware

        // 1. Kiểm tra đầu vào phía Node.js
        if (!classId) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp mã lớp học (classId)!'
            });
        }

        if (!studentId) {
            return res.status(401).json({
                message: 'Không tìm thấy thông tin sinh viên đăng nhập!'
            });
        }

        const numClassId = parseInt(classId);
        if (isNaN(numClassId)) {
            return res.status(400).json({
                message: 'Mã lớp học (classId) phải là một số nguyên hợp lệ!'
            });
        }

        // 2. BEGIN TRANSACTION
        await transaction.begin();

        // 3. Thực thi Stored Procedure sp_EnrollClass trong ngữ cảnh của Transaction
        const request = new sql.Request(transaction);
        request.input('ClassId', sql.Int, numClassId);
        request.input('StudentId', sql.Int, studentId);

        await request.execute('sp_EnrollClass');

        // 4. Nếu SP thực thi thành công không có lỗi ➔ COMMIT TRANSACTION
        await transaction.commit();

        return res.status(201).json({
            message: 'Đăng ký thành công'
        });

    } catch (error) {
        // 5. Nếu có bất kỳ lỗi nào xảy ra ➔ ROLLBACK TRANSACTION ngay lập tức nếu transaction vẫn đang active
        if (transaction.isActive) {
            await transaction.rollback();
        }

        console.error('Lỗi khi đăng ký lớp học:', error);

        // Phân loại mã lỗi trả về dựa trên nghiệp vụ trong Stored Procedure
        if (
            error.message.includes('Lớp không tồn tại hoặc đã đóng') ||
            error.message.includes('Lớp đã đủ sĩ số') ||
            error.message.includes('Bạn đã đăng ký lớp học này rồi')
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        // Các lỗi cơ sở dữ liệu không mong muốn khác
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

module.exports = {
    enrollClass
};
