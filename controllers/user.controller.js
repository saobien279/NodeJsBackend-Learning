const { sql } = require('../config/db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

/**
 * 1. GET api/user/GetAllUser
 * Lấy toàn bộ danh sách người dùng
 */
const getAllUser = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.execute('sp_GetUsers');

        const users = result.recordset;

        if (!users || users.length === 0) {
            return res.status(202).json({
                message: 'Danh sách user trống'
            });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * Helper function để trích xuất và giải mã token thủ công (dành cho AddUser public/private kết hợp)
 */
const getDecodedToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * 2. POST api/user/AddUser (Registry đã gộp vào đây)
 * Thêm người dùng mới / Đăng ký tài khoản
 */
const addUser = async (req, res) => {
    try {
        const { username, password, fullName, email, roleId } = req.body;

        //A Validation: Kiểm tra thiếu trường thông tin
        if (!username || !password || !fullName || !email || roleId === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ các trường: username, password, fullName, email, roleId!'
            });
        }

        const targetRoleId = parseInt(roleId);


        //B Gọi Stored Procedure để thực hiện tất cả các bước validate dữ liệu đầu vào
        const validateRequest = new sql.Request();
        
        // B1. Khai báo các tham số đầu vào (Inputs)
        validateRequest.input('Email', sql.VarChar(100), email);
        validateRequest.input('Username', sql.VarChar(50), username);
        validateRequest.input('RoleId', sql.Int, targetRoleId);
        
        // B2. Khai báo các tham số đầu ra (Outputs)
        validateRequest.output('IsValid', sql.Bit);
        validateRequest.output('ErrorMessage', sql.NVarChar(255));
        
        // B3. Thực thi Stored Procedure
        const validateResult = await validateRequest.execute('sp_ValidateUserCreation');
        
        // B4. Nhận kết quả từ output
        const isValid = validateResult.output.IsValid;
        const errorMessage = validateResult.output.ErrorMessage;
        
        if (!isValid) {
            // Nếu có lỗi, trả về mã lỗi 400 (Bad Request) hoặc 404 (tùy thông báo) kèm Message lỗi
            const statusCode = errorMessage.includes('không tồn tại') ? 404 : 400;
            return res.status(statusCode).json({
                message: errorMessage
            });
        }
        

        // C. Xử lý phân quyền khi thêm Admin (RoleId = 1)
        if (targetRoleId === 1) {
            const decoded = getDecodedToken(req);
            // Nếu không có token hợp lệ hoặc token không phải của Admin (RoleId = 1)
            if (!decoded || parseInt(decoded.RoleId) !== 1) {
                return res.status(403).json({
                    message: 'Quyền truy cập bị từ chối! Chỉ Admin mới có quyền tạo thêm tài khoản Admin khác.'
                });
            }
        }

        // E. Tiến hành băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // F. Gọi Store Procedure 'sp_AddUser'
        const addRequest = new sql.Request();
        addRequest.input('Username', sql.VarChar(50), username);
        addRequest.input('PasswordHash', sql.NVarChar(255), hashedPassword);
        addRequest.input('FullName', sql.NVarChar(100), fullName);
        addRequest.input('Email', sql.VarChar(100), email);
        addRequest.input('RoleId', sql.Int, targetRoleId);

        const result = await addRequest.execute('AddUserSystem');
        const newUserId = result.recordset[0].UserId;

        return res.status(201).json({
            message: 'Tạo người dùng thành công!',
            userId: newUserId
        });

    } catch (error) {
        console.error('Lỗi thêm user:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 3. PUT api/user/UpdateUser
 * Cập nhật thông tin người dùng
 */
const updateUser = async (req, res) => {
    try {
        const { id, username, fullName, email, roleId } = req.body;

        // Validation
        if (!id || !username || !fullName || !email || roleId === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ: id, username, fullName, email, roleId!'
            });
        }

        if (username.trim().length === 0) {
            return res.status(400).json({
                message: 'Tên đăng nhập không được để trống!'
            });
        }

        const targetUserId = parseInt(id);
        const targetRoleId = parseInt(roleId);

        // A. Kiểm tra xem Id (UserId) có tồn tại không
        const userCheck = new sql.Request();
        userCheck.input('UserId', sql.Int, targetUserId);
        const userResult = await userCheck.query('SELECT 1 FROM Users WHERE UserId = @UserId');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                message: `Người dùng với ID = ${targetUserId} không tồn tại!`
            });
        }

        //B Gọi Stored Procedure để thực hiện tất cả các bước validate dữ liệu đầu vào
        const validateRequest = new sql.Request();
        
        // B1. Khai báo các tham số đầu vào (Inputs)
        validateRequest.input('Email', sql.VarChar(100), email);
        validateRequest.input('Username', sql.VarChar(50), username);
        validateRequest.input('RoleId', sql.Int, targetRoleId);
        validateRequest.input('UserId', sql.Int, targetUserId); // QUAN TRỌNG: Truyền UserId để loại trừ khi check trùng lặp!
        
        // B2. Khai báo các tham số đầu ra (Outputs)
        validateRequest.output('IsValid', sql.Bit);
        validateRequest.output('ErrorMessage', sql.NVarChar(255));
        
        // B3. Thực thi Stored Procedure
        const validateResult = await validateRequest.execute('sp_ValidateUserCreation');
        
        // B4. Nhận kết quả từ output
        const isValid = validateResult.output.IsValid;
        const errorMessage = validateResult.output.ErrorMessage;
        
        if (!isValid) {
            // Nếu có lỗi, trả về mã lỗi 400 (Bad Request) hoặc 404 (tùy thông báo) kèm Message lỗi
            const statusCode = errorMessage.includes('không tồn tại') ? 404 : 400;
            return res.status(statusCode).json({
                message: errorMessage
            });
        }

        // C. Gọi Store Procedure 'sp_UpdateUser'
        const updateRequest = new sql.Request();
        updateRequest.input('UserId', sql.Int, targetUserId);
        updateRequest.input('Username', sql.VarChar(50), username);
        updateRequest.input('FullName', sql.NVarChar(100), fullName);
        updateRequest.input('Email', sql.VarChar(100), email);
        updateRequest.input('RoleId', sql.Int, targetRoleId);

        await updateRequest.execute('sp_UpdateUser');

        return res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công!'
        });

    } catch (error) {
        console.error('Lỗi cập nhật user:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 4. DELETE api/user/DeleteUser
 * Xóa người dùng theo ID (Nhận từ Body hoặc Query)
 */
const deleteUser = async (req, res) => {
    try {
        // Lấy ID từ Request Body hoặc Query Parameter
        let id = req.body.id || req.query.id;

        if (!id) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp tham số ID người dùng cần xóa!'
            });
        }

        const targetUserId = parseInt(id);
        if (isNaN(targetUserId)) {
            return res.status(400).json({
                message: 'ID người dùng phải là một số nguyên hợp lệ!'
            });
        }

        // Gọi Store Procedure 'sp_DeleteUser' (Đã tích hợp kiểm tra tồn tại 2 trong 1)
        const deleteRequest = new sql.Request();
        deleteRequest.input('UserId', sql.Int, targetUserId);
        deleteRequest.output('IsSuccess', sql.Bit);
        deleteRequest.output('Message', sql.NVarChar(255));

        const result = await deleteRequest.execute('sp_DeleteUser');

        const isSuccess = result.output.IsSuccess;
        const message = result.output.Message;

        if (!isSuccess) {
            return res.status(404).json({
                message: message
            });
        }

        return res.status(200).json({
            message: message
        });

    } catch (error) {
        console.error('Lỗi xóa user:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 5. PUT api/user/UpdateStatusUser
 * Kích hoạt hoặc Khóa tài khoản người dùng
 */
const updateStatusUser = async (req, res) => {
    try {
        const { id, isActive } = req.body;

        // Validation
        if (id === undefined || isActive === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ: id (INT) và isActive (1: Hoạt động, 0: Khóa)!'
            });
        }

        const targetUserId = parseInt(id);
        const statusVal = parseInt(isActive);

        if (statusVal !== 0 && statusVal !== 1) {
            return res.status(400).json({
                message: 'Trạng thái isActive chỉ chấp nhận giá trị 0 (Khóa) hoặc 1 (Kích hoạt)!'
            });
        }

        // Gọi Store Procedure 'sp_UpdateStatusUser' (Đã tích hợp kiểm tra tồn tại 2 trong 1)
        const statusRequest = new sql.Request();
        statusRequest.input('UserId', sql.Int, targetUserId);
        statusRequest.input('IsActive', sql.Bit, statusVal);
        statusRequest.output('IsSuccess', sql.Bit);
        statusRequest.output('Message', sql.NVarChar(255));

        const result = await statusRequest.execute('sp_UpdateStatusUser');

        const isSuccess = result.output.IsSuccess;
        const message = result.output.Message;

        if (!isSuccess) {
            return res.status(404).json({
                message: message
            });
        }

        return res.status(200).json({
            message: message
        });

    } catch (error) {
        console.error('Lỗi cập nhật trạng thái user:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

module.exports = {
    getAllUser,
    addUser,
    updateUser,
    deleteUser,
    updateStatusUser
};
