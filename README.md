# Mini-Jira Fullstack Project

> **Hệ thống quản lý công việc (Task Management) lấy cảm hứng từ Jira, hỗ trợ quản lý dự án, theo dõi tiến độ và thảo luận nhóm theo thời gian thực.**

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📖 Giới thiệu (Overview)

Dự án này là một ứng dụng Fullstack mô phỏng các tính năng cốt lõi của Jira. Nó tập trung vào việc xử lý dữ liệu chặt chẽ (Data Integrity), hiệu suất cao và trải nghiệm người dùng mượt mà. Hệ thống sử dụng **Database Transaction** để đảm bảo tính nhất quán và **Cascade Delete** để tự động dọn dẹp dữ liệu.

## 🛠 Tech Stack (Công nghệ sử dụng)

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **Node.js & Express** | RESTful API Server |
| | **TypeScript** | Strongly typed programming |
| | **PostgreSQL** | Relational Database |
| | **Drizzle ORM** | Type-safe Database Interaction |
| | **JWT & Bcrypt** | Authentication & Security |
| **Frontend** | **React (Vite)** | Client-side Library |
| | **Tailwind CSS** | Utility-first CSS Framework |
| | **Axios** | API Fetching |
| | **Context API / Redux** | State Management |   

## ✨ Tính năng nổi bật (Key Features)

### 1. 🔐 Hệ thống xác thực (Authentication)
* Đăng ký và Đăng nhập bảo mật với mật khẩu được mã hóa (Bcrypt).
* Cấp phát **JSON Web Token (JWT)** và lưu trữ an toàn.
* **Middleware** bảo vệ các Private Route, chặn truy cập trái phép từ phía Server.

### 2. 📂 Quản lý Dự án (Project Management)
* Tạo dự án mới với **Mã Key** duy nhất (VD: `APP`, `WEB`).
* **Database Transaction:** Tự động gán người tạo thành chủ sở hữu (OWNER) ngay khi dự án được khởi tạo, đảm bảo không có lỗi dữ liệu.

### 3. 📊 Quản lý Task & Audit Log
* Tạo Task với đầy đủ mức độ ưu tiên: 🔴 High, 🟡 Medium, 🔵 Low.
* Quy trình trạng thái chuẩn: `TODO` ➡️ `IN PROGRESS` ➡️ `DONE`.
* **Audit Log:** Hệ thống tự động ghi lại lịch sử thay đổi vào bảng `task_history` giúp theo dõi tiến độ chi tiết.

### 4. 💬 Thảo luận (Comments)
* Hệ thống bình luận realtime dưới mỗi Task.
* Hỗ trợ trọn bộ **CRUD**: Thêm, Sửa, Xóa bình luận của chính mình.

### 5. 🛡 Tính toàn vẹn dữ liệu (Data Integrity)
* **Cascade Delete:** Khi một Task bị xóa, hệ thống tự động xóa sạch toàn bộ Comments và Lịch sử (Logs) liên quan, giúp Database luôn sạch sẽ.

---

## Hướng dẫn cài đặt (Installation)

### Yêu cầu tiên quyết (Prerequisites)
* Node.js (v18+)
* PostgreSQL (đã cài đặt và đang chạy)

### Bước 1: Cấu hình Backend ⚙️

1.  Di chuyển vào thư mục server:
    ```bash
    cd server
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Tạo file `.env` và cấu hình các biến môi trường:
    ```env
    DATABASE_URL=postgres://user:password@localhost:5432/mini_jira_db
    JWT_SECRET=your_super_secret_key_123
    PORT=5000
    ```
4.  Đẩy schema lên Database (Drizzle Kit):
    ```bash
    npx drizzle-kit push
    ```
5.  Khởi chạy Server:
    ```bash
    npm run dev
    ```

### Bước 2: Cấu hình Frontend 🎨

1.  Mở một terminal mới và di chuyển vào thư mục client:
    ```bash
    cd client
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Khởi chạy ứng dụng:
    ```bash
    npm run dev
    ```
    *Truy cập vào địa chỉ: `http://localhost:5173` (hoặc port hiển thị trên terminal).*

---

## 🧪 Kiểm thử (Testing Strategy)

Dự án đã được kiểm thử nghiêm ngặt thông qua **Postman** với các kịch bản thực tế:

* ✅ **Login & Auth:** API trả về lỗi 401/403 nếu request không kèm Bearer Token hợp lệ.
* ✅ **Transaction Safety:** Giả lập lỗi server khi update Task để đảm bảo tính năng **Rollback** hoạt động (dữ liệu trở về trạng thái cũ).
* ✅ **Cascade Delete:** Xóa một `Task ID: 1` và verify trong Database rằng bảng `comments` và `task_history` liên quan đã hoàn toàn trống.

## 📸 Screenshots
*(Đang cập nhật hình ảnh demo...)*

## 👤 Author
**Xuan Quang**
- GitHub: [@XuanQuang1301](https://github.com/XuanQuang1301)

---
*⭐️ Star dự án này nếu bạn thấy nó hữu ích!*
