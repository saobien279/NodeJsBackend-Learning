const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     description: Xác thực tài khoản người dùng bằng cách đối chiếu mật khẩu đã băm Bcrypt và trả về mã token JWT.
 *     tags:
 *       - Auth
 *     security: [] # Không yêu cầu token khi đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: Abc@12345
 *     responses:
 *       200:
 *         description: Đăng nhập thành công và trả về token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công!
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Thiếu thông tin đầu vào.
 *       404:
 *         description: Tài khoản hoặc mật khẩu không chính xác.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.post('/login', authController.login);

module.exports = router;
