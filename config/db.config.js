const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Dùng cho Azure
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // Quan trọng khi dùng localhost
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

/**
 * Hàm khởi tạo kết nối đến SQL Server
 * Sử dụng Connection Pool để tối ưu hóa hiệu suất
 */
const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('--------------------------------------------------');
        console.log('✅ Thành công: Đã kết nối đến MS SQL Server!');
        console.log(`📡 Database: ${process.env.DB_DATABASE}`);
        console.log('--------------------------------------------------');
        return pool;
    } catch (err) {
        console.error('--------------------------------------------------');
        console.error('❌ Thất bại: Không thể kết nối đến SQL Server!');
        console.error(`🔴 Lỗi: ${err.message}`);
        console.error('--------------------------------------------------');

        // Gợi ý khắc phục nếu lỗi phổ biến
        if (err.message.includes('Login failed')) {
            console.log('👉 Gợi ý: Hãy kiểm tra lại DB_USER và DB_PASSWORD trong file .env');
        }

        process.exit(1); // Dừng ứng dụng nếu không kết nối được DB
    }
};

module.exports = {
    sql,
    connectDB
};
