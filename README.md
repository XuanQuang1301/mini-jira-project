# Mini Jira Project

Hệ thống Quản lý Dự án và Công việc theo mô hình Agile/Kanban, tích hợp Bảng điều khiển Quản trị (Admin Portal), Sơ đồ Lộ trình (Roadmap/Timeline) và Quản lý Tiến độ Thời gian thực.

---

## 1. Giới thiệu Hệ thống (Overview)

Mini Jira Project là giải pháp phần mềm Fullstack được phát triển nhằm tối ưu hóa quy trình làm việc nhóm, phân công nhiệm vụ và giám sát tiến độ dự án. Hệ thống được thiết kế theo kiến trúc tách biệt Client-Server (Decoupled Architecture), đảm bảo khả năng mở rộng, tính bảo mật dữ liệu và hiệu năng phản hồi cao.

---

## 2. Kiến trúc & Công nghệ (Tech Stack)

### Backend
- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js
- **Programming Language**: TypeScript
- **Database System**: PostgreSQL
- **ORM Tool**: Drizzle ORM
- **Authentication & Security**: JSON Web Token (JWT), Bcrypt password hashing
- **Development Tools**: Tsx, Nodemon, Drizzle Kit

### Frontend
- **Core Library**: React.js (v19)
- **Build Tool**: Vite
- **Programming Language**: TypeScript
- **Styling & Design System**: Modern Vanilla CSS, TailwindCSS
- **State & Routing**: React Router DOM (v7)
- **HTTP Client**: Axios
- **Drag & Drop Engine**: @hello-pangea/dnd
- **Data Visualization**: Recharts
- **Icons Library**: Lucide React

---

## 3. Các Phân hệ Tính năng chính (Key Modules)

### 3.1. Phân hệ Xác thực & An ninh (Authentication & Security)
- Đăng ký và Đăng nhập tài khoản với mã hóa Bcrypt.
- Xác thực và phân quyền qua HTTP Header Bearer Token.
- Bảo vệ các đường dẫn nội bộ bằng Middleware và phân quyền Admin/User.

### 3.2. Phân hệ Quản lý Dự án (Project Management)
- Khởi tạo dự án mới với Mã định danh (Key) độc bản.
- Tham gia dự án có sẵn thông qua Mã dự án.
- Phân quyền người dùng trong dự án: Chủ sở hữu (Owner), Quản lý (Manager), Thành viên (Member).

### 3.3. Phân hệ Bảng công việc Kanban (Kanban Board)
- Quản lý công việc theo các trạng thái: TODO, IN_PROGRESS, IN_REVIEW, DONE.
- Thao tác kéo - thả (Drag and Drop) chuyển trạng thái công việc mượt mà.
- Theo dõi thông tin chi tiết: Mức độ ưu tiên (Low, Medium, High, Urgent), thời hạn (Deadline), phần trăm hoàn thành.

### 3.4. Phân hệ Lộ trình & Dòng thời gian (Roadmap & Timeline)
- Trực quan hóa tiến độ theo thời gian thực với biểu đồ Gantt / Timeline.
- Lọc danh sách công việc theo Ngày, Tháng, Năm.

### 3.5. Phân hệ Quản trị Hệ thống (Admin Portal)
- Trang điều khiển trung tâm giám sát tổng số người dùng, số dự án và tài khoản bị khóa.
- Trang Quản lý Dự án Hệ thống: Xem toàn bộ dự án trong hệ thống và danh sách công việc thuộc về từng dự án.
- Trang Quản lý Người dùng: Thực hiện khóa hoặc mở khóa tài khoản người dùng.
- Trang Cấu hình Hệ thống: Quản lý tham số vận hành và tham số bảo mật.

---

## 4. Yêu cầu Tiên quyết (Prerequisites)

- **Node.js**: Phiên bản 18.0.0 trở lên.
- **npm**: Phiên bản 9.0.0 trở lên.
- **PostgreSQL Database Server**: Đã được cài đặt và vận hành trên môi trường local hoặc cloud.

---

## 5. Cấu hình Biến môi trường (Environment Variables)

### 5.1. Cấu hình Backend (`server/.env`)

Tạo file `.env` trong thư mục `server/` với nội dung mẫu sau:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/mini_jira_db
JWT_SECRET=super_secret_jwt_key_mini_jira_2026
```

### 5.2. Cấu hình Frontend (`client/.env`)

Tạo file `.env` trong thư mục `client/` nếu cần tùy chỉnh URL kết nối API:

```env
VITE_API_URL=http://localhost:5000
```

---

## 6. Hướng dẫn Cài đặt và Khởi chạy (Installation & Execution Guide)

### Bước 1: Clone Repository

```bash
git clone https://github.com/XuanQuang1301/mini-jira-project.git
cd mini-jira-project
```

### Bước 2: Cài đặt Dependencies

Cài đặt gói phụ thuộc cho thư mục gốc, máy chủ backend và ứng dụng frontend:

```bash
# Cài đặt tại thư mục gốc (Root)
npm install

# Cài đặt cho Backend
cd server
npm install

# Cài đặt cho Frontend
cd client
npm install
```

### Bước 3: Đồng bộ Cơ sở dữ liệu (Database Migration)

Tại thư mục `server/`, thực hiện đẩy cấu trúc bảng lên PostgreSQL:

```bash
cd server
npx drizzle-kit push
cd ..
```

### Bước 4: Khởi chạy Ứng dụng

#### Cách 1: Khởi chạy toàn bộ hệ thống qua Turborepo TUI từ thư mục Root

```bash
npm run dev
```

Lệnh này sẽ tự động khởi chạy Turborepo Terminal User Interface (TUI) với 3 tab tác vụ riêng biệt:
- **`web#dev`**: Frontend Vite App tại `http://localhost:5173`
- **`server#dev`**: Backend Express Server tại `http://localhost:5000`
- **`drizzle#dev`**: Drizzle Studio (Database GUI) tại `http://localhost:4984` hoặc `https://local.drizzle.studio`

Sử dụng phím **Mũi tên lên / xuống (↑ / ↓)** để chuyển đổi giữa các tab tác vụ.

#### Cách 2: Khởi chạy riêng biệt từng phân hệ (Tùy chọn)

- Khởi chạy Backend Server:
  ```bash
  cd server
  npm run dev
  ```

- Khởi chạy Frontend Client:
  ```bash
  cd client
  npm run dev
  ```

- Mở Giao diện Quản lý CSDL (Drizzle Studio):
  ```bash
  cd server
  npm run db:studio
  ```

---

## 7. Cấu trúc Thư mục Dự án (Project Directory Structure)

```text
mini-jira-project/
├── client/                      # Mã nguồn Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/          # Layout & Reusable UI Components
│   │   ├── pages/               # Application Pages (Dashboard, Projects, Timeline, Profile)
│   │   │   └── admin/           # Admin Portal Pages (AdminDashboard, AdminProjects, etc.)
│   │   ├── services/            # Axios API Integration Layer
│   │   ├── App.tsx              # Main Router Configuration
│   │   ├── index.css            # Design System Tokens & Base Styles
│   │   └── main.tsx             # React Application Entry Point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Mã nguồn Backend (Express + Drizzle ORM + PostgreSQL)
│   ├── src/
│   │   ├── controllers/         # Request Handlers (Auth, User, Project, Task, Comment)
│   │   ├── db/                  # Database Connection & Schemas
│   │   │   └── schema/          # Schema Definitions (users, projects, tasks, etc.)
│   │   ├── middlewares/         # JWT Authentication & Authorization Middlewares
│   │   ├── routes/              # Express API Routes Definition
│   │   ├── services/            # Business Logic Layer
│   │   └── index.ts             # Express Application Entry Point
│   ├── drizzle.config.ts        # Drizzle ORM Configuration
│   └── package.json
│
├── drizzle/                     # Workspace Package dành riêng cho Drizzle Studio
│   └── package.json
│
├── turbo.json                   # Cấu hình Turborepo TUI Task Runner
├── package.json                 # Root Package Configuration & Workspaces Setup
└── README.md                    # Tài liệu Hướng dẫn Dự án
```

---

## 8. Danh mục API Chính (API Endpoint Reference)

### 8.1. Phân hệ Xác thực & Người dùng (Authentication & Users)
- `POST /api/auth/signup`: Đăng ký tài khoản mới.
- `POST /api/auth/signin`: Đăng nhập và nhận JWT token.
- `GET /api/users`: Lấy danh sách toàn bộ người dùng (Yêu cầu xác thực).
- `GET /api/users/profile`: Lấy thông tin cá nhân của người dùng hiện tại.
- `PUT /api/users/profile`: Cập nhật thông tin cá nhân.
- `PUT /api/users/:id/lock`: Khóa hoặc mở khóa tài khoản người dùng (Dành cho Admin).

### 8.2. Phân hệ Dự án (Projects)
- `GET /api/project/my`: Lấy danh sách dự án thuộc về người dùng đang đăng nhập.
- `GET /api/project/all`: Lấy danh sách tất cả dự án trong hệ thống (Dành cho Admin).
- `GET /api/project/:id`: Lấy chi tiết thông tin dự án theo ID.
- `POST /api/project/create`: Khởi tạo dự án mới.
- `POST /api/project/join`: Tham gia dự án bằng Mã dự án (Key).
- `GET /api/project/:projectId/tasks`: Lấy tất cả công việc thuộc dự án.

### 8.3. Phân hệ Công việc (Tasks)
- `GET /api/tasks/my-tasks`: Lấy danh sách công việc được giao cho cá nhân.
- `POST /api/tasks`: Tạo công việc mới trong dự án.
- `PUT /api/tasks/:id`: Cập nhật thông tin công việc.
- `PUT /api/tasks/:id/status`: Cập nhật trạng thái công việc (TODO, IN_PROGRESS, IN_REVIEW, DONE).
- `DELETE /api/tasks/:id`: Xóa công việc.

---

## 9. Tác giả & Giấy phép (Author & License)

- **Tác giả**: Đặng Xuân Quang
- **GitHub**: [XuanQuang1301](https://github.com/XuanQuang1301)
- **Giấy phép**: ISC License
