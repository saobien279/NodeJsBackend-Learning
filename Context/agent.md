# 📖 HƯỚNG DẪN DỰ ÁN BACKEND QUẢN LÝ HỌC VỤ (ACADEMIC MANAGEMENT API)

Tài liệu này được biên soạn dành cho các AI Coding Agents tiếp nhận dự án ở các phiên làm việc tiếp theo. Vui lòng đọc kỹ cấu trúc, danh sách API, quy chuẩn thiết kế hệ thống và các điểm lưu ý đặc biệt dưới đây để đảm bảo tính nhất quán của mã nguồn.

---

## 🛠️ 1. CÔNG NGHỆ & MÔI TRƯỜNG PHÁT TRIỂN
*   **Runtime Environment:** Node.js
*   **Web Framework:** Express.js (v5.2.1)
*   **Database:** Microsoft SQL Server (kết nối qua thư viện `mssql` v12.5.2)
*   **Security:** JSON Web Token (`jsonwebtoken` v9.0.3) & Mật khẩu băm (`bcrypt` v10)
*   **Tài liệu API:** Swagger UI (`swagger-ui-express` v5.0.1) & OpenAPI 3.0 JSDoc (`swagger-jsdoc` v6.2.8)
*   **Công cụ phát triển:** `nodemon` (tự động reload khi đổi code)
*   **Tệp môi trường:** `.env` (mã hóa UTF-8 bắt buộc để tránh lỗi giải mã chữ Trung Quốc / Mojibake trong Windows).

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN (MVC ARCHITECTURE)
```text
NodejsABackend/
├── config/             # Cấu hình hệ thống (db.config.js - Kết nối database)
├── Context/            # Lưu trữ mã nguồn Database Layer
│   └── sqlproduce/     # Chứa các file Stored Procedure SQL Server (.sql)
│       ├── ClassProduce/       # SP cho Lớp học
│       ├── DepartmentProduce/  # SP cho Khoa học vụ
│       └── EnrollmentProduce/  # SP cho Đăng ký học phần
├── controllers/        # Xử lý Logic & Điều hướng dữ liệu (Controllers)
├── middlewares/        # Bộ lọc an toàn (auth.middleware.js - verifyToken, isAdmin, isStudent)
├── routes/             # Định nghĩa các Endpoint API & Swagger docs
├── .env                # Lưu các biến cấu hình bí mật (PORT, DB, JWT_SECRET)
├── index.js            # Entry Point - Khởi chạy Server Express
└── package.json        # Quản lý thư viện phụ thuộc & script khởi chạy
```

---

## 💾 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE LAYER)

### 📌 QUY TẮC CỰC KỲ QUAN TRỌNG:
> [!IMPORTANT]
> **TUYỆT ĐỐI KHÔNG VIẾT TRUY VẤN SELECT/INSERT/UPDATE/DELETE TRỰC TIẾP TRONG NODE.JS CONTROLLER.**
> Tất cả các tương tác nghiệp vụ với Database bắt buộc phải đi qua **Stored Procedure (Thủ tục lưu trữ)**. Node.js chỉ đóng vai trò gác cổng request và gọi `.execute('sp_...')` với các tham số đầu vào/đầu ra.

### 📋 Sơ đồ các bảng dữ liệu chính (Database Tables)
1.  **Roles** (`RoleId` INT PK, `RoleName` NVARCHAR) -> Quyền hạn (1: Admin, 2: Teacher, 3: Student).
2.  **Users** (`UserId` INT PK, `Username` VARCHAR, `PasswordHash` NVARCHAR, `FullName` NVARCHAR, `Email` VARCHAR, `RoleId` INT FK, `IsActive` BIT) -> Người dùng hệ thống.
3.  **Departments** (`DepartmentId` INT PK, `DepartmentCode` VARCHAR, `DepartmentName` NVARCHAR) -> Các khoa học vụ.
4.  **Courses** (`CourseId` INT PK, `CourseCode` VARCHAR, `CourseName` NVARCHAR, `Credits` INT, `DepartmentId` INT FK) -> Môn học (Credits từ 1 đến 10).
5.  **Classes** (`ClassId` INT PK, `ClassCode` VARCHAR, `CourseId` INT FK, `TeacherId` INT FK, `Semester` VARCHAR, `MaxStudents` INT, `Status` VARCHAR) -> Lớp học (Status: 'Open', 'Closed', 'Cancelled').
6.  **Enrollments** (`EnrollmentId` INT PK, `ClassId` INT FK, `StudentId` INT FK, `EnrollmentDate` DATETIME) -> Đăng ký học phần của sinh viên.

---

## 📡 4. DANH SÁCH CÁC CỔNG API ENDPOINT

Tất cả các API được hiển thị trực quan tại: **`http://localhost:3000/api-docs`**.

### 🔒 A. Nhóm Xác thực (`/api/auth`)
*   `POST /login`: Đăng nhập hệ thống. Trả về JWT Token. (Public)

### 👥 B. Nhóm Người dùng (`/api/user`)
*   `GET /GetAllUser`: Lấy danh sách toàn bộ User. (Yêu cầu `Admin`)
*   `POST /AddUser`: Đăng ký thành viên mới / Thêm User. (Có logic phân quyền kiểm tra tự động)
*   `PUT /UpdateUser`: Cập nhật thông tin User. (Sử dụng `sp_ValidateUserCreation` nâng cấp loại trừ chính mình qua `@UserId`)
*   `DELETE /DeleteUser`: Xóa tài khoản theo ID. (Yêu cầu `Admin`)
*   `PUT /UpdateStatusUser`: Khóa hoặc kích hoạt lại tài khoản. (Yêu cầu `Admin`)

### 📚 C. Nhóm Môn học (`/api/course`)
*   `GET /`: Lấy toàn bộ môn học. (Public)
*   `GET /:id`: Chi tiết môn học theo ID. (Public)
*   `POST /`: Thêm môn học mới. (Yêu cầu `Admin`)
*   `PUT /:id`: Cập nhật môn học theo ID. (Yêu cầu `Admin`)
*   `DELETE /:id`: Xóa môn học theo ID. (Yêu cầu `Admin`)

### 🏛️ D. Nhóm Khoa học vụ (`/api/department`)
*   `GET /`: Lấy toàn bộ danh sách khoa. (Public)
*   `GET /:id`: Chi tiết khoa theo ID. (Public)
*   `POST /`: Tạo khoa mới. Sử dụng SP `sp_UpsertDepartment` với `@id = NULL`. (Yêu cầu `Admin`)
*   `PUT /:id`: Sửa thông tin khoa. Sử dụng SP `sp_UpsertDepartment` với `@id = req.params.id`. (Yêu cầu `Admin`)
*   `DELETE /:id`: Xóa khoa. Gọi SP `sp_DeleteDepartment` kèm kiểm tra tồn tại bằng `THROW` trong SQL. (Yêu cầu `Admin`)

### 🏫 E. Nhóm Lớp học (`/api/class`)
*   `GET /`: Lấy toàn bộ lớp học, tự động `JOIN` lấy tên Môn học và Giáo viên. (Public)
*   `GET /:id`: Chi tiết lớp học kèm Giáo viên và Môn học theo ID. (Public)
*   `POST /`: Đăng ký mở lớp học mới (Status mặc định là `'Open'`). (Yêu cầu `Admin`)
*   `PUT /:id`: Sửa đổi thông tin cơ bản lớp học (Không được cập nhật `Status` tại đây). (Yêu cầu `Admin`)
*   `PATCH /:id/status`: Thay đổi trạng thái lớp / **Soft Delete** lớp học bằng cách truyền `status: 'Cancelled'`. (Yêu cầu `Admin`)
    *   *Nghiệp vụ chặn:* Nếu lớp học đã có sinh viên đăng ký học tập (`Enrollments`), hệ thống sẽ chặn đứng hành động và trả về mã lỗi không cho phép xóa/hủy lớp.

### 📝 F. Nhóm Đăng ký Học phần (`/api/enrollment`)
*   `POST /`: Sinh viên đăng ký tham gia lớp học. (Yêu cầu `Student` - RoleId = 3)
    *   *Nghiệp vụ bảo mật:* Phải đi qua chain middlewares `[verifyToken, isStudent]`.
    *   *Xử lý ACID:* Sử dụng **`mssql.Transaction()`** bao bọc cuộc gọi Stored Procedure `sp_EnrollClass`.
    *   *Cơ chế Rollback:* Tự động gọi `transaction.rollback()` trong khối `catch` để bảo toàn tính toàn vẹn nếu gặp bất kỳ lỗi logic nào.

---

## ⚡ 5. CÁC QUY CHUẨN LẬP TRÌNH & THIẾT KẾ (CRITICAL FOR AGENTS)

### 🛡️ 1. Nguyên tắc gác cổng dữ liệu 2 lớp (Validation Flow)
*   **Tại Node.js (Controller):** Kiểm tra tính hợp lệ của Request Body (Trường bắt buộc có trống không, ID truyền lên có phải số không `isNaN`). Đây là kiểm tra RAM cục bộ không tốn tài nguyên DB.
*   **Tại SQL Server (Stored Procedure):** Kiểm tra nghiệp vụ dữ liệu thực tế (Kiểm tra ID tồn tại trong bảng, kiểm tra trùng lặp mã duy nhất, kiểm tra sĩ số lớp học...). Nếu không đạt, sử dụng lệnh `THROW` trong SQL Server để ném lỗi về Node.js.

### 🔄 2. Cơ chế xử lý lỗi Stored Procedure THROW
*   Khi viết Stored Procedure, đối với các lỗi kiểm tra nghiệp vụ chặn (Validation fails), hãy sử dụng lệnh `THROW 50001, N'Thông báo lỗi bằng tiếng Việt', 1;`
*   Ở Node.js Controller, bọc toàn bộ code trong khối `try...catch`. Driver `mssql` sẽ tự động chuyển lỗi `THROW` của SQL thành một Exception trong JS. Khối `catch(error)` sẽ bắt lấy nó và trả về HTTP Status `500` hoặc `400` kèm thông báo tiếng Việt chính xác của database gửi lên (`error.message`).

### 📦 3. Cơ chế Connection Pool chia sẻ (Singleton)
*   Tất cả các Controller bắt buộc phải sử dụng chung một bể chứa kết nối bằng cách import:
    ```javascript
    const { sql } = require('../config/db.config');
    ```
*   Khởi tạo request bằng cú pháp **không tham số**:
    ```javascript
    const request = new sql.Request();
    ```
    *Cơ chế tự động:* Nó sẽ tự động tìm kiếm kết nối đã được `index.js` mở sẵn ở bộ nhớ đệm toàn cục và áp dụng ngay, không tự ý tạo thêm kết nối mới tránh gây sập Database.

### 📝 4. Chú thích Swagger API Document
*   Bất kỳ khi nào tạo hoặc cập nhật Route mới, bắt buộc phải viết chú thích **JSDoc @swagger** trực tiếp phía trên dòng khai báo route.
*   Định dạng Swagger JSDoc phải viết bằng ngôn ngữ **YAML** chuẩn xác.
*   Với các Route được bảo vệ (cần Token), bắt buộc phải có thuộc tính:
    ```yaml
    security:
      - BearerAuth: []
    ```
    Để Swagger UI hiển thị biểu tượng ổ khóa màu xanh lá cây hỗ trợ test API.

---

## 📌 6. THÔNG TIN KẾT NỐI DATABASE MẪU (.env.example)
```env
PORT=3000
DB_USER=sa
DB_PASSWORD=your_secure_password
DB_SERVER=localhost
DB_DATABASE=abc
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=abcxyzcxzx
JWT_EXPIRES_IN=XXH
```

---

*Tài liệu này là bộ xương sống của dự án. Mọi Agent tiếp quản sau này xin vui lòng tuân thủ nghiêm ngặt các quy tắc trên để bảo toàn kiến trúc Clean Architecture tối ưu nhất.*
