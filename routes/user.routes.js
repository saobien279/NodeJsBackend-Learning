const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/user/GetAllUser:
 *   get:
 *     summary: Lấy danh sách toàn bộ người dùng
 *     description: Trả về danh sách người dùng bao gồm thông tin chi tiết vai trò của họ. Yêu cầu token xác thực.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   UserId:
 *                     type: integer
 *                     example: 1
 *                   Username:
 *                     type: string
 *                     example: nguyenvanA
 *                   FullName:
 *                     type: string
 *                     example: Nguyễn Văn A
 *                   Email:
 *                     type: string
 *                     example: vana@academic.edu.vn
 *                   RoleId:
 *                     type: integer
 *                     example: 3
 *                   RoleName:
 *                     type: string
 *                     example: Student
 *                   IsActive:
 *                     type: boolean
 *                     example: true
 *       202:
 *         description: Danh sách rỗng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Danh sách user trống
 *       401:
 *         description: Chưa xác thực (Thiếu token).
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get('/GetAllUser', verifyToken, userController.getAllUser);

/**
 * @swagger
 * /api/user/AddUser:
 *   post:
 *     summary: Thêm người dùng mới / Đăng ký tài khoản (Gộp Registry)
 *     description: API công khai cho phép Sinh viên và Giáo viên tự đăng ký. Nếu đăng ký tài khoản Admin (RoleId = 1), bắt buộc phải truyền token xác thực của một tài khoản Admin đang hoạt động.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: [] # Chỉ cần thiết khi đăng ký với RoleId = 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - fullName
 *               - email
 *               - roleId
 *             properties:
 *               username:
 *                 type: string
 *                 example: sv001
 *               password:
 *                 type: string
 *                 example: Matkhau@123
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn Sinh Viên
 *               email:
 *                 type: string
 *                 example: sv001@academic.edu.vn
 *               roleId:
 *                 type: integer
 *                 example: 3
 *                 description: "1: Admin (Yêu cầu token Admin), 2: Teacher, 3: Student"
 *     responses:
 *       201:
 *         description: Tạo người dùng mới thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tạo người dùng thành công!
 *                 userId:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Thiếu thông tin hoặc Username/Email đã tồn tại.
 *       403:
 *         description: Không có quyền (khi cố tình đăng ký Admin mà không có token Admin hợp lệ).
 *       404:
 *         description: Không tìm thấy RoleId trong hệ thống.
 *       500:
 *         description: Lỗi hệ thống.
 */
router.post('/AddUser', userController.addUser);

/**
 * @swagger
 * /api/user/UpdateUser:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     description: Cập nhật Username, Họ tên, Email và Vai trò của người dùng dựa trên ID. Yêu cầu quyền Admin.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - username
 *               - fullName
 *               - email
 *               - roleId
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 2
 *               username:
 *                 type: string
 *                 example: nguyenvanA_updated
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A Cập Nhật
 *               email:
 *                 type: string
 *                 example: vana_new@academic.edu.vn
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ.
 *       404:
 *         description: ID người dùng hoặc RoleId không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put('/UpdateUser', verifyToken, isAdmin, userController.updateUser);

/**
 * @swagger
 * /api/user/DeleteUser:
 *   delete:
 *     summary: Xóa người dùng khỏi hệ thống
 *     description: Xóa người dùng theo ID nhận từ Query string (?id=...) hoặc Request Body JSON. Yêu cầu quyền Admin.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 2
 *                 description: Nhập ID người dùng muốn xóa ở đây (hoặc truyền qua query parameter ?id=2)
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công.
 *       400:
 *         description: ID rỗng hoặc định dạng không hợp lệ.
 *       404:
 *         description: Không tìm thấy ID người dùng trong DB.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.delete('/DeleteUser', verifyToken, isAdmin, userController.deleteUser);

/**
 * @swagger
 * /api/user/UpdateStatusUser:
 *   put:
 *     summary: Khóa / Mở khóa tài khoản người dùng
 *     description: Cập nhật trạng thái hoạt động (isActive) của người dùng. Yêu cầu quyền Admin.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - isActive
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 2
 *               isActive:
 *                 type: integer
 *                 example: 0
 *                 description: "1: Hoạt động (ON), 0: Khóa (OFF)"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công.
 *       400:
 *         description: Giá trị đầu vào không hợp lệ.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put('/UpdateStatusUser', verifyToken, isAdmin, userController.updateStatusUser);

module.exports = router;
