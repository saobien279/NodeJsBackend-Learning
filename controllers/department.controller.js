const { sql } = require('../config/db.config');

/**
 * 1. GET api/department
 * Lấy toàn bộ danh sách khoa
 */
const getAllDepartments = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllDepartments');
        return res.status(200).json(result.recordset || []);
    } catch (error) {
        console.error('Lỗi lấy danh sách khoa:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 2. GET api/department/:id
 * Lấy thông tin khoa cụ thể theo ID
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const deptId = parseInt(id);

        if (isNaN(deptId)) {
            return res.status(400).json({
                message: 'ID khoa phải là một số nguyên hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, deptId);
        const result = await request.execute('sp_GetDepartmentById');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: `Khoa với ID = ${deptId} không tồn tại!`
            });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Lỗi lấy chi tiết khoa:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 3. POST api/department
 * Tạo mới khoa (Upsert với id = NULL)
 */
const createDepartment = async (req, res) => {
    try {
        const { code, name } = req.body;

        if (!code || !name) {
            return res.status(400).json({
                message: 'Mã khoa (code) và Tên khoa (name) không được để trống!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, null);
        request.input('code', sql.VarChar(20), code);
        request.input('name', sql.NVarChar(100), name);
        request.output('newId', sql.Int);

        const result = await request.execute('sp_UpsertDepartment');
        const newDeptId = result.output.newId;

        return res.status(201).json({
            message: 'Tạo khoa mới thành công!',
            departmentId: newDeptId
        });
    } catch (error) {
        console.error('Lỗi tạo khoa:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ khi tạo khoa!',
            error: error.message
        });
    }
};

/**
 * 4. PUT api/department/:id
 * Cập nhật thông tin khoa (Upsert với id = req.params.id)
 */
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const deptId = parseInt(id);

        if (isNaN(deptId)) {
            return res.status(400).json({
                message: 'ID khoa không hợp lệ!'
            });
        }

        const { code, name } = req.body;

        if (!code || !name) {
            return res.status(400).json({
                message: 'Mã khoa (code) và Tên khoa (name) không được để trống!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, deptId);
        request.input('code', sql.VarChar(20), code);
        request.input('name', sql.NVarChar(100), name);
        request.output('newId', sql.Int);

        await request.execute('sp_UpsertDepartment');

        return res.status(200).json({
            message: 'Cập nhật thông tin khoa thành công!'
        });
    } catch (error) {
        console.error('Lỗi cập nhật khoa:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ khi cập nhật khoa!',
            error: error.message
        });
    }
};

/**
 * 5. DELETE api/department/:id
 * Xóa khoa theo ID
 */
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const deptId = parseInt(id);

        if (isNaN(deptId)) {
            return res.status(400).json({
                message: 'ID khoa không hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, deptId);

        await request.execute('sp_DeleteDepartment');

        return res.status(200).json({
            message: 'Xóa khoa thành công!'
        });
    } catch (error) {
        console.error('Lỗi xóa khoa:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ khi xóa khoa!',
            error: error.message
        });
    }
};

module.exports = {
    getAllDepartments,
    getById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
