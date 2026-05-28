const { sql } = require('../config/db.config');

/**
 * 1. GET api/class
 * Lấy toàn bộ danh sách lớp học kèm thông tin Môn học và Giáo viên
 */
const getAllClasses = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllClasses');
        return res.status(200).json(result.recordset || []);
    } catch (error) {
        console.error('Lỗi lấy danh sách lớp học:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 2. GET api/class/:id
 * Lấy thông tin lớp học chi tiết theo ID
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const classId = parseInt(id);

        if (isNaN(classId)) {
            return res.status(400).json({
                message: 'ID lớp học phải là một số nguyên hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, classId);
        const result = await request.execute('sp_GetClassById');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: `Lớp học với ID = ${classId} không tồn tại!`
            });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Lỗi lấy chi tiết lớp học:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 3. POST api/class
 * Tạo mới một lớp học (Upsert với id = NULL)
 */
const createClass = async (req, res) => {
    try {
        const { code, courseId, teacherId, semester, maxStudents } = req.body;

        if (!code || !courseId || !teacherId || !semester || maxStudents === undefined) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin: code, courseId, teacherId, semester, maxStudents!'
            });
        }

        const numCourseId = parseInt(courseId);
        const numTeacherId = parseInt(teacherId);
        const numMaxStudents = parseInt(maxStudents);

        if (isNaN(numCourseId) || isNaN(numTeacherId) || isNaN(numMaxStudents)) {
            return res.status(400).json({
                message: 'CourseId, TeacherId và MaxStudents phải là các số nguyên hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, null);
        request.input('code', sql.VarChar(50), code);
        request.input('courseId', sql.Int, numCourseId);
        request.input('teacherId', sql.Int, numTeacherId);
        request.input('semester', sql.VarChar(20), semester);
        request.input('maxStudents', sql.Int, numMaxStudents);
        request.output('newId', sql.Int);

        const result = await request.execute('sp_UpsertClass');
        const newClassId = result.output.newId;

        return res.status(201).json({
            message: 'Tạo lớp học mới thành công!',
            classId: newClassId
        });
    } catch (error) {
        console.error('Lỗi tạo lớp học:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ khi tạo lớp học!',
            error: error.message
        });
    }
};

/**
 * 4. PUT api/class/:id
 * Cập nhật thông tin cơ bản của lớp học (Upsert với id = req.params.id)
 */
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const classId = parseInt(id);

        if (isNaN(classId)) {
            return res.status(400).json({
                message: 'ID lớp học không hợp lệ!'
            });
        }

        const { code, courseId, teacherId, semester, maxStudents } = req.body;

        if (!code || !courseId || !teacherId || !semester || maxStudents === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin: code, courseId, teacherId, semester, maxStudents!'
            });
        }

        const numCourseId = parseInt(courseId);
        const numTeacherId = parseInt(teacherId);
        const numMaxStudents = parseInt(maxStudents);

        if (isNaN(numCourseId) || isNaN(numTeacherId) || isNaN(numMaxStudents)) {
            return res.status(400).json({
                message: 'CourseId, TeacherId và MaxStudents phải là các số nguyên hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, classId);
        request.input('code', sql.VarChar(50), code);
        request.input('courseId', sql.Int, numCourseId);
        request.input('teacherId', sql.Int, numTeacherId);
        request.input('semester', sql.VarChar(20), semester);
        request.input('maxStudents', sql.Int, numMaxStudents);
        request.output('newId', sql.Int);

        await request.execute('sp_UpsertClass');

        return res.status(200).json({
            message: 'Cập nhật thông tin lớp học thành công!'
        });
    } catch (error) {
        console.error('Lỗi cập nhật lớp học:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ khi cập nhật lớp học!',
            error: error.message
        });
    }
};

/**
 * 5. PATCH api/class/:id/status
 * Thay đổi trạng thái lớp học (Đóng/Mở/Xóa mềm qua truyền status: 'Cancelled')
 */
const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const classId = parseInt(id);

        if (isNaN(classId)) {
            return res.status(400).json({
                message: 'ID lớp học không hợp lệ!'
            });
        }

        const { status } = req.body;

        if (!status || status.trim().length === 0) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp trạng thái mới (status) trong body request!'
            });
        }

        const request = new sql.Request();
        request.input('id', sql.Int, classId);
        request.input('status', sql.VarChar(20), status);

        await request.execute('sp_UpdateClassStatus');

        return res.status(200).json({
            message: `Thay đổi trạng thái lớp học thành '${status}' thành công!`
        });
    } catch (error) {
        console.error('Lỗi thay đổi trạng thái lớp:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi ở phía máy chủ khi cập nhật trạng thái lớp học!',
            error: error.message
        });
    }
};

module.exports = {
    getAllClasses,
    getById,
    createClass,
    updateClass,
    changeStatus
};
