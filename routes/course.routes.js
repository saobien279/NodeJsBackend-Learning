const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getById,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/course.controller');

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// ==========================================
// ĐỊNH NGHĨA SWAGGER COMPONENTS (COURSE SCHEMA)
// ==========================================
/**
 * @swagger
 * components:
 *   schemas:
 *     CourseInput:
 *       type: object
 *       required:
 *         - courseCode
 *         - courseName
 *         - credits
 *         - departmentId
 *       properties:
 *         courseCode:
 *           type: string
 *           example: "CS101"
 *           description: Mã môn học (Phải là duy nhất)
 *         courseName:
 *           type: string
 *           example: "Lập trình C cơ bản"
 *           description: Tên môn học
 *         credits:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           example: 3
 *           description: Số tín chỉ (Giá trị từ 1 đến 10)
 *         departmentId:
 *           type: integer
 *           example: 1
 *           description: Mã khoa quản lý môn học
 */

// ==========================================
// CÁC ROUTE KHÔNG BẢO MẬT (PUBLIC)
// ==========================================

/**
 * @swagger
 * /api/course:
 *   get:
 *     summary: Lấy toàn bộ danh sách môn học
 *     tags:
 *       - Quản lý Môn học
 *     responses:
 *       200:
 *         description: Trả về danh sách tất cả môn học.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CourseId:
 *                     type: integer
 *                     example: 1
 *                   CourseCode:
 *                     type: string
 *                     example: "CS101"
 *                   CourseName:
 *                     type: string
 *                     example: "Lập trình C cơ bản"
 *                   Credits:
 *                     type: integer
 *                     example: 3
 *                   DepartmentId:
 *                     type: integer
 *                     example: 1
 */
router.get('/', getAllCourses);

/**
 * @swagger
 * /api/course/{id}:
 *   get:
 *     summary: Lấy thông tin môn học theo ID
 *     tags:
 *       - Quản lý Môn học
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần lấy thông tin
 *     responses:
 *       200:
 *         description: Trả về thông tin môn học chi tiết.
 *       404:
 *         description: Môn học không tồn tại.
 */
router.get('/:id', getById);

// ==========================================
// CÁC ROUTE YÊU CẦU QUYỀN ADMIN (SECURED BY JWT)
// ==========================================

/**
 * @swagger
 * /api/course:
 *   post:
 *     summary: Thêm môn học mới (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Môn học
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       201:
 *         description: Tạo môn học thành công.
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ hoặc trùng mã môn học.
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token).
 *       403:
 *         description: Không có quyền truy cập (Không phải Admin).
 */
router.post('/', verifyToken, isAdmin, createCourse);

/**
 * @swagger
 * /api/course/{id}:
 *   put:
 *     summary: Cập nhật thông tin môn học (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Môn học
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc trùng mã môn học.
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token).
 *       403:
 *         description: Không có quyền hoặc không phải Admin.
 *       404:
 *         description: Môn học không tồn tại.
 */
router.put('/:id', verifyToken, isAdmin, updateCourse);

/**
 * @swagger
 * /api/course/{id}:
 *   delete:
 *     summary: Xóa môn học theo ID (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Môn học
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của môn học cần xóa
 *     responses:
 *       200:
 *         description: Xóa môn học thành công.
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token).
 *       403:
 *         description: Không phải Admin.
 *       404:
 *         description: Môn học không tồn tại.
 */
router.delete('/:id', verifyToken, isAdmin, deleteCourse);

module.exports = router;
