🚀 Mini-Jira Fullstack Project
Hệ thống quản lý công việc (Task Management) lấy cảm hứng từ Jira, cho phép người dùng quản lý dự án, theo dõi tiến độ công việc và thảo luận nhóm theo thời gian thực.

🛠 Công nghệ sử dụng (Tech Stack)
Backend (server/)
Ngôn ngữ: TypeScript.

Framework: Express.js.

Database: PostgreSQL.

ORM: Drizzle ORM.

Xác thực: JSON Web Token (JWT) & Bcrypt.

Frontend (client/)
Công cụ: React (Vite) + TypeScript.

Styling: Tailwind CSS.

State Management: Context API hoặc Redux Toolkit.

API Fetching: Axios.

✨ Tính năng nổi bật
1. Hệ thống xác thực (Auth)
Đăng ký và đăng nhập bảo mật.

Lưu trữ Token trong localStorage để duy trì phiên làm việc.

Middleware chặn truy cập trái phép tại Backend.

2. Quản lý Dự án (Project)
Tạo dự án với Mã Key duy nhất (ví dụ: "APP", "WEB").

Tự động gán người tạo làm chủ sở hữu (OWNER) bằng Database Transaction.

3. Quản lý Công việc & Lịch sử (Task & Audit Log)
Tạo Task với các mức độ ưu tiên: High, Medium, Low.

Cập nhật trạng thái Task (TODO -> IN PROGRESS -> DONE).

Audit Log: Tự động ghi lại mọi thay đổi trạng thái vào bảng task_history để theo dõi tiến trình.

4. Thảo luận (Comments)
Người dùng có thể bình luận dưới từng Task.

Hỗ trợ đầy đủ CRUD: Thêm, Sửa, Xóa bình luận của chính mình.

5. Tính toàn vẹn dữ liệu (Data Integrity)
Sử dụng Cascade Delete: Khi xóa một Task, toàn bộ bình luận và lịch sử liên quan sẽ tự động bị xóa sạch, tránh dữ liệu rác.

🚀 Hướng dẫn cài đặt
Bước 1: Cấu hình Backend
Di chuyển vào thư mục server: cd server.

Cài đặt thư viện: npm install.

Tạo file .env và cấu hình:

Đoạn mã

DATABASE_URL=postgres://user:password@localhost:5432/nexisdb
JWT_SECRET=your_secret_key
PORT=5000
Đẩy schema lên DB: npx drizzle-kit push.

Chạy server: npm run dev.

Bước 2: Cấu hình Frontend
Di chuyển vào thư mục client: cd client.

Cài đặt thư viện: npm install.

Chạy ứng dụng: npm run dev.

🛡 Kiểm thử (Testing)
Dự án đã vượt qua các bài kiểm tra thực tế trên Postman:

Login & Auth: Chặn truy cập khi không có Bearer Token.

Transaction: Thử nghiệm tạo lỗi khi update Task để kiểm tra tính năng Rollback dữ liệu.

Cascade Delete: Xóa Task ID 1 và xác nhận bảng comments, task_history trống trơn.

