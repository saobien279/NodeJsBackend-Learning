const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực Token JWT
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Token thường được gửi dạng: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Không tìm thấy mã xác thực (Token)! Vui lòng đăng nhập.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Gắn thông tin người dùng đã giải mã vào request để các controller sử dụng
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Mã xác thực không hợp lệ hoặc đã hết hạn!',
            error: err.message
        });
    }
};

/**
 * Middleware kiểm tra quyền Admin
 */
const isAdmin = (req, res, next) => {
    // RoleId = 1 là Admin
    if (!req.user || parseInt(req.user.RoleId) !== 1) {
        return res.status(403).json({
            message: 'Quyền truy cập bị từ chối! Bạn không phải là Quản trị viên.'
        });
    }
    next();
};


const isStudent = (req, res, next) => {
    // RoleId = 3 là Student
    if (!req.user || parseInt(req.user.RoleId) !== 3) {
        return res.status(403).json({
            message: 'Quyền truy cập bị từ chối! Bạn không phải là Sinh viên.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isStudent
};
