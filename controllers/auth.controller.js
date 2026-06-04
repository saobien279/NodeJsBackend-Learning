const { sql } = require('../config/db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Xử lý Đăng nhập người dùng
 * Route: POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ tài khoản và mật khẩu!'
            });
        }

        // 1. Kết nối database và gọi Store Procedure để lấy thông tin User
        const request = new sql.Request();
        request.input('Username', sql.VarChar(50), username);
        
        const result = await request.execute('sp_GetUserByUsername');
        const user = result.recordset[0];

        // 2. Kiểm tra sự tồn tại của User
        if (!user) {
            return res.status(404).json({
                message: 'Tài khoản hoặc mật khẩu không chính xác!'
            });
        }

        // Kiểm tra xem tài khoản có đang hoạt động không
        if (user.IsActive === false) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa!'
            });
        }

        // 3. Tiến hành đối chiếu mật khẩu đã băm (Bcrypt compare)
        const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordMatch) {
            return res.status(404).json({
                message: 'Tài khoản hoặc mật khẩu không chính xác!'
            });
        }

        // 4. Nếu đúng, tạo JWT Token
        const payload = {
            UserId: user.UserId, // UserId lúc này là kiểu INT tự tăng
            RoleId: user.RoleId
        };

        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secretKey, { expiresIn: '2h' });

        // 5. Trả về kết quả
        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            token: token
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

module.exports = {
    login
};
