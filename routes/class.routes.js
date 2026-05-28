const express = require('express');
const router = express.Router();
const {
    getAllClasses,
    getById,
    createClass,
    updateClass,
    changeStatus
} = require('../controllers/class.controller');

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// ==========================================
// ĐỊNH NGHĨA SWAGGER COMPONENTS (CLASS SCHEMA)
// ==========================================
/**
 * @swagger
 * components:
 *   schemas:
 *     ClassInput:
 *       type: object
 *       required:
 *         - code
 *         - courseId
 *         - teacherId
 *         - semester
 *         - maxStudents
 *       properties:
 *         code:
 *           type: string
 *           example: "L01_CS101"
 *           description: Mã lớp học (Phải là duy nhất)
 *         courseId:
 *           type: integer
 *           example: 1
 *           description: ID của môn học thuộc về lớp này
 *         teacherId:
 *           type: integer
 *           example: 2
 *           description: ID của giáo viên chủ nhiệm
 *         semester:
 *           type: string
 *           example: "2025.2"
 *           description: Học kỳ diễn ra lớp học (Ví dụ 2025.2)
 *         maxStudents:
 *           type: integer
 *           example: 40
 *           description: Số lượng học sinh tối đa được đăng ký
 *     ClassStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Open, Closed, Cancelled]
 *           example: "Cancelled"
 *           description: Trạng thái mới của lớp học. Dùng 'Cancelled' để xóa mềm lớp học.
 */

// ==========================================
// CÁC ROUTE CÔNG KHAI (PUBLIC ROUTES)
// ==========================================

/**
 * @swagger
 * /api/class:
 *   get:
 *     summary: Lấy toàn bộ danh sách lớp học
 *     tags:
 *       - Quản lý Lớp học
 *     responses:
 *       200:
 *         description: Trả về danh sách tất cả các lớp học kèm tên giáo viên và môn học.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ClassId:
 *                     type: integer
 *                     example: 1
 *                   ClassCode:
 *                     type: string
 *                     example: "L01_CS101"
 *                   CourseId:
 *                     type: integer
 *                     example: 1
 *                   CourseName:
 *                     type: string
 *                     example: "Lập trình C cơ bản"
 *                   TeacherId:
 *                     type: integer
 *                     example: 2
 *                   TeacherName:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *                   Semester:
 *                     type: string
 *                     example: "2025.2"
 *                   MaxStudents:
 *                     type: integer
 *                     example: 40
 *                   Status:
 *                     type: string
 *                     example: "Open"
 */
router.get('/', getAllClasses);

/**
 * @swagger
 * /api/class/{id}:
 *   get:
 *     summary: Lấy thông tin lớp học theo ID
 *     tags:
 *       - Quản lý Lớp học
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lớp học cần lấy thông tin
 *     responses:
 *       200:
 *         description: Trả về thông tin lớp học chi tiết.
 *       404:
 *         description: Lớp học không tồn tại.
 */
router.get('/:id', getById);

// ==========================================
// CÁC ROUTE YÊU CẦU BẢO MẬT (PROTECTED ROUTES)
// ==========================================

/**
 * @swagger
 * /api/class:
 *   post:
 *     summary: Đăng ký tạo lớp học mới (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Lớp học
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       201:
 *         description: Tạo lớp học thành công.
 *       400:
 *         description: Đầu vào thiếu hoặc trùng mã lớp học.
 *       401:
 *         description: Thiếu token.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi cơ sở dữ liệu.
 */
router.post('/', verifyToken, isAdmin, createClass);

/**
 * @swagger
 * /api/class/{id}:
 *   put:
 *     summary: Cập nhật thông tin cơ bản của lớp học (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Lớp học
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lớp học cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       200:
 *         description: Cập nhật lớp học thành công.
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ.
 *       401:
 *         description: Thiếu token.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Lớp học không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put('/:id', verifyToken, isAdmin, updateClass);

/**
 * @swagger
 * /api/class/{id}/status:
 *   patch:
 *     summary: Thay đổi trạng thái hoặc Xóa mềm lớp học (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Lớp học
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của lớp học cần thay đổi trạng thái
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassStatusInput'
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công.
 *       400:
 *         description: Nghiệp vụ chặn (ví dụ Hủy lớp đã có học sinh đăng ký).
 *       401:
 *         description: Thiếu token.
 *       403:
 *         description: Không phải Admin.
 *       404:
 *         description: Lớp học không tồn tại.
 *       500:
 *         description: Lỗi máy chủ hoặc database.
 */
router.patch('/:id/status', verifyToken, isAdmin, changeStatus);

module.exports = router;
