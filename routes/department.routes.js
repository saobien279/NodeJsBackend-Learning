const express = require('express');
const router = express.Router();
const {
    getAllDepartments,
    getById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/department.controller');

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// ==========================================
// ĐỊNH NGHĨA SWAGGER COMPONENTS (DEPARTMENT SCHEMA)
// ==========================================
/**
 * @swagger
 * components:
 *   schemas:
 *     DepartmentInput:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           example: "FIT"
 *           description: Mã khoa (Phải là duy nhất)
 *         name:
 *           type: string
 *           example: "Khoa Công nghệ thông tin"
 *           description: Tên đầy đủ của khoa
 */

// ==========================================
// CÁC ROUTE CÔNG KHAI (PUBLIC ROUTES)
// ==========================================

/**
 * @swagger
 * /api/department:
 *   get:
 *     summary: Lấy toàn bộ danh sách các khoa trong trường
 *     tags:
 *       - Quản lý Khoa
 *     responses:
 *       200:
 *         description: Trả về danh sách tất cả các khoa.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   DepartmentId:
 *                     type: integer
 *                     example: 1
 *                   DepartmentCode:
 *                     type: string
 *                     example: "FIT"
 *                   DepartmentName:
 *                     type: string
 *                     example: "Khoa Công nghệ thông tin"
 */
router.get('/', getAllDepartments);

/**
 * @swagger
 * /api/department/{id}:
 *   get:
 *     summary: Lấy thông tin khoa theo ID
 *     tags:
 *       - Quản lý Khoa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của khoa cần lấy thông tin
 *     responses:
 *       200:
 *         description: Trả về thông tin khoa chi tiết.
 *       404:
 *         description: Khoa không tồn tại.
 */
router.get('/:id', getById);

// ==========================================
// CÁC ROUTE YÊU CẦU BẢO MẬT (PROTECTED ROUTES)
// ==========================================

/**
 * @swagger
 * /api/department:
 *   post:
 *     summary: Tạo khoa mới (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Khoa
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       201:
 *         description: Tạo khoa mới thành công.
 *       400:
 *         description: Đầu vào không hợp lệ hoặc trùng mã khoa.
 *       401:
 *         description: Thiếu Token xác thực JWT.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi máy chủ hoặc lỗi cơ sở dữ liệu.
 */
router.post('/', verifyToken, isAdmin, createDepartment);

/**
 * @swagger
 * /api/department/{id}:
 *   put:
 *     summary: Cập nhật thông tin khoa (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Khoa
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của khoa cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       200:
 *         description: Cập nhật thông tin khoa thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Thiếu token.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Khoa không tồn tại.
 *       500:
 *         description: Lỗi cơ sở dữ liệu.
 */
router.put('/:id', verifyToken, isAdmin, updateDepartment);

/**
 * @swagger
 * /api/department/{id}:
 *   delete:
 *     summary: Xóa khoa theo ID (Yêu cầu Admin)
 *     tags:
 *       - Quản lý Khoa
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của khoa cần xóa
 *     responses:
 *       200:
 *         description: Xóa khoa thành công.
 *       401:
 *         description: Thiếu token.
 *       403:
 *         description: Không phải Admin.
 *       404:
 *         description: Khoa không tồn tại.
 *       500:
 *         description: Lỗi cơ sở dữ liệu.
 */
router.delete('/:id', verifyToken, isAdmin, deleteDepartment);

module.exports = router;
