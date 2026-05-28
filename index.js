const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { connectDB } = require('./config/db.config');

// Nạp các biến môi trường
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json())


// ==========================================
// CẤU HÌNH SWAGGER (TÀI LIỆU API)
// ==========================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hệ thống Quản lý Học vụ API',
            version: '1.0.0',
            description: 'Tài liệu hướng dẫn sử dụng API hệ thống quản lý học vụ Node.js kết nối MS SQL Server và bảo mật JWT.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Máy chủ phát triển local'
            }
        ],
        // Cấu hình bảo mật JWT Bearer Auth cho Swagger
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Nhập mã token JWT theo định dạng: Bearer <your_token>'
                }
            }
        },
        // Áp dụng bảo mật cho toàn bộ các API (mặc định)
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    // Đường dẫn để Swagger tìm các file chứa chú thích JSDoc viết tài liệu
    apis: ['./index.js', './routes/*.js', './controllers/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==========================================
// ĐỊNH NGHĨA CÁC ROUTE
// ==========================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái hoạt động của Server
 *     description: API kiểm tra xem máy chủ Express có đang chạy ổn định không.
 *     tags:
 *       - Trạng thái hệ thống
 *     security: [] # API này không yêu cầu token JWT
 *     responses:
 *       200:
 *         description: Server hoạt động bình thường.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running smoothly!
 *                 uptime:
 *                   type: number
 *                   example: 12.34
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running smoothly!',
        uptime: process.uptime()
    });
});

// Routes
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const courseRouter = require('./routes/course.routes');
const departmentRouter = require('./routes/department.routes');
const classRouter = require('./routes/class.routes');
const enrollmentRouter = require('./routes/enrollment.routes');

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/department', departmentRouter);
app.use('/api/class', classRouter);
app.use('/api/enrollment', enrollmentRouter);

// ==========================================
// KHỞI ĐỘNG SERVER VÀ KẾT NỐI DATABASE
// ==========================================
const startServer = async () => {
    // 1. Thử kết nối Database trước
    await connectDB();

    // 2. Nếu DB kết nối ok, khởi động server Express
    app.listen(PORT, () => {
        console.log('==================================================');
        console.log(`🚀 Server đang chạy thành công tại port: ${PORT}`);
        console.log(`📖 Xem tài liệu API tại: http://localhost:${PORT}/api-docs`);
        console.log('==================================================');
    });
};

startServer();
