const express = require('express');
const router = express.Router();
const { enrollClass } = require('../controllers/enrollment.controller');
const { verifyToken, isStudent } = require('../middlewares/auth.middleware');

// ==========================================
// ĐỊNH NGHĨA SWAGGER COMPONENTS (ENROLLMENT SCHEMA)
// ==========================================
/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentInput:
 *       type: object
 *       required:
 *         - classId
 *       properties:
 *         classId:
 *           type: integer
 *           example: 1
 *           description: ID của lớp học cần đăng ký học tập
 */

// ==========================================
// CÁC ROUTE ĐĂNG KÝ HỌC PHẦN (SECURED BY JWT)
// ==========================================

/**
 * @swagger
 * /api/enrollment:
 *   post:
 *     summary: Đăng ký tham gia vào lớp học (Yêu cầu Sinh viên)
 *     tags:
 *       - Quản lý Đăng ký Học phần
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollmentInput'
 *     responses:
 *       201:
 *         description: Đăng ký thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *       400:
 *         description: Lỗi kiểm tra nghiệp vụ đầu vào (Lớp đầy, Lớp đóng/huỷ, Học sinh đã đăng ký trước đó).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lớp đã đủ sĩ số"
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token xác thực JWT).
 *       403:
 *         description: Quyền truy cập bị từ chối (Bạn không phải là Sinh viên).
 *       500:
 *         description: Đã xảy ra lỗi ở phía máy chủ!
 */
router.post('/', verifyToken, isStudent, enrollClass);

module.exports = router;
