const { sql } = require('../config/db.config');

/**
 * 1. GET api/course/GetAllCourses
 * Lấy toàn bộ danh sách môn học qua Stored Procedure sp_GetAllCourses
 */
const getAllCourses = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.execute('sp_GetAllCourses');
        
        // Trả về mảng rỗng nếu không có dữ liệu
        return res.status(200).json(result.recordset || []);
    } catch (error) {
        console.error('Lỗi lấy danh sách môn học:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 2. GET api/course/GetById/:id
 * Lấy thông tin môn học cụ thể theo ID qua Stored Procedure sp_GetCourseById (Kỹ thuật 2 trong 1)
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);

        if (isNaN(courseId)) {
            return res.status(400).json({
                message: 'ID môn học phải là một số nguyên hợp lệ!'
            });
        }

        const request = new sql.Request();
        request.input('CourseId', sql.Int, courseId);
        request.output('IsSuccess', sql.Bit);
        request.output('Message', sql.NVarChar(255));

        const result = await request.execute('sp_GetCourseById');

        const isSuccess = result.output.IsSuccess;
        const message = result.output.Message;

        if (!isSuccess) {
            return res.status(404).json({
                message: message
            });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Lỗi lấy thông tin môn học:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 3. POST api/course/CreateCourse
 * Thêm môn học mới qua Stored Procedure sp_CreateCourse (Kỹ thuật 2 trong 1)
 */
const createCourse = async (req, res) => {
    try {
        const { courseCode, courseName, credits, departmentId } = req.body;

        // Validation cơ bản phía Express (Kiểm tra thiếu trường dữ liệu)
        if (!courseCode || !courseName || credits === undefined || departmentId === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ các trường: courseCode, courseName, credits, departmentId!'
            });
        }

        const numCredits = parseInt(credits);
        const numDeptId = parseInt(departmentId);

        if (isNaN(numCredits)) {
            return res.status(400).json({
                message: 'Số tín chỉ (Credits) phải là một số nguyên!'
            });
        }

        if (isNaN(numDeptId)) {
            return res.status(400).json({
                message: 'Mã khoa (DepartmentId) phải là số nguyên hợp lệ!'
            });
        }

        // Gọi Stored Procedure để thực hiện kiểm tra và chèn dữ liệu
        const insertRequest = new sql.Request();
        insertRequest.input('CourseCode', sql.VarChar(20), courseCode);
        insertRequest.input('CourseName', sql.NVarChar(100), courseName);
        insertRequest.input('Credits', sql.Int, numCredits);
        insertRequest.input('DepartmentId', sql.Int, numDeptId);
        insertRequest.output('IsSuccess', sql.Bit);
        insertRequest.output('Message', sql.NVarChar(255));
        insertRequest.output('NewCourseId', sql.Int);

        const result = await insertRequest.execute('sp_CreateCourse');

        const isSuccess = result.output.IsSuccess;
        const message = result.output.Message;
        const newCourseId = result.output.NewCourseId;

        if (!isSuccess) {
            return res.status(400).json({
                message: message
            });
        }

        return res.status(201).json({
            message: message,
            courseId: newCourseId
        });

    } catch (error) {
        console.error('Lỗi tạo môn học:', error);
        return res.status(500).json({
           // message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 4. PUT api/course/UpdateCourse/:id
 * Cập nhật thông tin môn học qua Stored Procedure sp_UpdateCourse (Kỹ thuật 2 trong 1)
 */
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);

        if (isNaN(courseId)) {
            return res.status(400).json({
                message: 'ID môn học không hợp lệ!'
            });
        }

        const { courseCode, courseName, credits, departmentId } = req.body;

        // Validation cơ bản phía Express
        if (!courseCode || !courseName || credits === undefined || departmentId === undefined) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin để cập nhật: courseCode, courseName, credits, departmentId!'
            });
        }

        const numCredits = parseInt(credits);
        const numDeptId = parseInt(departmentId);

        if (isNaN(numCredits)) {
            return res.status(400).json({
                message: 'Số tín chỉ (Credits) phải là số nguyên!'
            });
        }

        if (isNaN(numDeptId)) {
            return res.status(400).json({
                message: 'Mã khoa (DepartmentId) phải là số nguyên!'
            });
        }

        // Gọi Stored Procedure thực hiện kiểm tra tồn tại, trùng mã và cập nhật
        const updateRequest = new sql.Request();
        updateRequest.input('CourseId', sql.Int, courseId);
        updateRequest.input('CourseCode', sql.VarChar(20), courseCode);
        updateRequest.input('CourseName', sql.NVarChar(100), courseName);
        updateRequest.input('Credits', sql.Int, numCredits);
        updateRequest.input('DepartmentId', sql.Int, numDeptId);
        updateRequest.output('IsSuccess', sql.Bit);
        updateRequest.output('Message', sql.NVarChar(255));

        const result = await updateRequest.execute('sp_UpdateCourse');

        const isSuccess = result.output.IsSuccess;
        const message = result.output.Message;

        if (!isSuccess) {
            const statusCode = message.includes('không tồn tại') ? 404 : 400;
            return res.status(statusCode).json({
                message: message
            });
        }

        return res.status(200).json({
            message: message
        });

    } catch (error) {
        console.error('Lỗi cập nhật môn học:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

/**
 * 5. DELETE api/course/DeleteCourse/:id
 * Xóa môn học theo ID qua Stored Procedure sp_DeleteCourse (Kỹ thuật 2 trong 1)
 */
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const courseId = parseInt(id);

        if (isNaN(courseId)) {
            return res.status(400).json({
                message: 'ID môn học không hợp lệ!'
            });
        }

        // Gọi Stored Procedure để thực hiện kiểm tra tồn tại và xóa
        const deleteRequest = new sql.Request();
        deleteRequest.input('CourseId', sql.Int, courseId);
        deleteRequest.output('IsSuccess', sql.Bit);
        deleteRequest.output('Message', sql.NVarChar(255));

        const result = await deleteRequest.execute('sp_DeleteCourse');

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
        console.error('Lỗi xóa môn học:', error);
        return res.status(500).json({
            //message: 'Đã xảy ra lỗi ở phía máy chủ!',
            error: error.message
        });
    }
};

module.exports = {
    getAllCourses,
    getById,
    createCourse,
    updateCourse,
    deleteCourse
};
