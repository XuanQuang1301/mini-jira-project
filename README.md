# 🚀 Mini Jira - Hệ Thống Quản Lý Dự Án & Công Việc Agile/Kanban

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-v6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

> **Mini Jira** là hệ thống quản lý công việc và dự án fullstack đa nền tảng (**Web + Mobile + Backend Server**) được xây dựng theo kiến trúc **Monorepo** hiện đại. Ứng dụng tích hợp Bảng Kanban Kéo - Thả, Sơ đồ Lộ trình (Timeline/Gantt Chart), Quản lý Checklist (Subtasks), Bình luận (Comments), Hệ thống Thông báo (In-App Notifications) và Cổng Quản trị Viên (Admin Portal) toàn diện.

---

## 📑 Mục lục

1. [Giới thiệu Tổng quan](#1-gioi-thieu-tong-quan)
2. [Kiến trúc & Công nghệ (Tech Stack)](#2-kien-truc--cong-nghe-tech-stack)
3. [Các Tính năng & Phân hệ Chính](#3-cac-tinh-nang--phan-he-chinh)
4. [Cấu trúc Thư mục Dự án (Monorepo)](#4-cau-truc-thu-muc-du-an-monorepo)
5. [Cấu hình Biến môi trường (Environment Variables)](#5-cau-hinh-bien-moi-truong-environment-variables)
6. [Hướng dẫn Cài đặt & Khởi chạy](#6-huong-dan-cai-dat--khoi-chay)
7. [Tài liệu Chi tiết API Endpoints](#7-tai-lieu-chi-tiet-api-endpoints)
8. [Cơ sở Dữ liệu & Drizzle Schema](#8-co-so-du-lieu--drizzle-schema)
9. [Tác giả & Giấy phép](#9-tac-gia--giay-phep)

---

<a id="1-gioi-thieu-tong-quan"></a>
## 1. Giới thiệu Tổng quan

**Mini Jira** được thiết kế nhằm mang lại trải nghiệm quản trị công việc chuẩn mực theo phương pháp Agile/Kanban tương tự như Jira và Trello. Hệ thống đồng bộ hóa dữ liệu thời gian thực giữa Web và Mobile, cung cấp các công cụ trực quan hóa tiến độ và báo cáo số liệu phân tích chuyên sâu.

### 🌟 Điểm nổi bật:
- 🏗️ **Kiến trúc Monorepo Đồng bộ**: Quản lý đồng thời Backend API, Frontend Web, Mobile App và Database GUI qua **Turborepo** & **NPM Workspaces**.
- 📋 **Bảng Kanban Kéo - Thả mượt mà**: Sử dụng `@hello-pangea/dnd`, cập nhật tức thì trạng thái (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) và vị trí sắp xếp công việc.
- 📅 **Lộ trình Dự án (Timeline/Roadmap)**: Trực quan hóa tiến độ dự án theo biểu đồ thanh Gantt theo từng ngày/tháng/năm.
- ✅ **Checklist Đầu việc con (Subtasks)**: Tạo và theo dõi danh sách việc con, tự động đồng bộ tỷ lệ hoàn thành (%) của Task cha.
- 💬 **Thảo luận & Bình luận (Comments)**: Trao đổi trực tiếp trên từng thẻ công việc kèm định danh người dùng và mốc thời gian.
- 🔔 **Trung tâm Thông báo In-App**: Tự động thông báo khi được giao việc, mời tham gia dự án hoặc duyệt thành viên.
- 🛡️ **Cổng Quản trị Chuyên sâu (Admin Portal - `/admin`)**: Bảng điều khiển phân tích số liệu Recharts, quản lý người dùng (Khóa/Mở khóa tài khoản) và giám sát toàn bộ dự án hệ thống.
- 📱 **Ứng dụng Di động (Mobile App)**: Xây dựng với **React Native & Expo**, theo dõi công việc cá nhân và kiểm tra trạng thái máy chủ mọi lúc mọi nơi.

---

<a id="2-kien-truc--cong-nghe-tech-stack"></a>
## 2. Kiến trúc & Công nghệ (Tech Stack)

### 🔹 Monorepo Orchestration
- **Workspaces Manager**: NPM Workspaces
- **Monorepo Build Engine**: Turborepo (`turbo dev --ui=tui`)

### 🔹 Backend API (`apps/server`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5)
- **Language**: TypeScript (v5)
- **Database**: PostgreSQL
- **ORM / Query Builder**: Drizzle ORM (`drizzle-orm`)
- **Database Migrations & Studio**: Drizzle Kit (`drizzle-kit`)
- **Bảo mật & Xác thực**: JSON Web Token (JWT), Bcrypt password hashing, CORS
- **Dev Tools**: `tsx`, `nodemon`

### 🔹 Frontend Web (`apps/web`)
- **Core Library**: React.js (v19)
- **Build Tool**: Vite (v6)
- **Language**: TypeScript
- **Styling**: TailwindCSS (v4) & Modern Responsive CSS
- **Routing**: React Router DOM (v7)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Charts & Data Viz**: Recharts (v3)
- **Icons**: Lucide React
- **HTTP Client**: Axios (với Request Interceptor tự động gắn Bearer Token)

### 🔹 Mobile App (`apps/mobile`)
- **Framework**: React Native (`0.76.6`)
- **Platform Engine**: Expo SDK 52
- **Language**: TypeScript
- **HTTP Client**: Axios

### 🔹 Database Management (`drizzle/`)
- **GUI Manager**: Drizzle Studio chạy độc lập tại cổng `http://localhost:4984` (hoặc `https://local.drizzle.studio`)

---

<a id="3-cac-tinh-nang--phan-he-chinh"></a>
## 3. Các Tính năng & Phân hệ Chính

### 3.1. Phân hệ Xác thực & Quản lý Tài khoản (Authentication & Profile)
- **Đăng ký / Đăng nhập**: Mã hóa mật khẩu bằng Bcrypt, cấp phát JWT Token phiên làm việc.
- **Hồ sơ Cá nhân (Profile Page)**: Xem thông tin tài khoản, ngày tham gia, email và vai trò.
- **Đổi mật khẩu an toàn**: Kiểm tra mật khẩu hiện tại trước khi cập nhật mật khẩu mới.
- **Tùy chỉnh Ảnh đại diện (Avatar)**: Chọn từ kho avatar mẫu có sẵn hoặc cập nhật URL ảnh đại diện tùy ý.

### 3.2. Phân hệ Quản lý Dự án & Thành viên (Project & Member Management)
- **Tạo Dự án Mới**: Tự động sinh mã Key dự án độc bản (viết hoa), người tạo tự động nhận vai trò `OWNER`.
- **Tham gia Dự án bằng Mã (Join by Key)**: Gửi yêu cầu gia nhập với trạng thái `PENDING`.
- **Quy trình Phê duyệt Thành viên (Approval Workflow)**: Chủ dự án / Quản lý có quyền Duyệt hoặc Từ chối các yêu cầu đang chờ (`PENDING` -> `MEMBER`).
- **Mời Thành viên qua Email**: Mời trực tiếp người dùng trong hệ thống vào dự án theo vai trò.
- **Quản lý & Xóa Thành viên**: Xem danh sách thành viên theo quyền hạn và gỡ thành viên khỏi dự án khi cần.

### 3.3. Phân hệ Bảng Công việc Kanban (Kanban Board)
- **4 Cột Trạng thái Tiêu chuẩn**:
  - 📝 **TODO**: Công việc cần thực hiện
  - ⏳ **IN_PROGRESS**: Đang thực hiện
  - 🔍 **IN_REVIEW**: Chờ đánh giá / kiểm thử
  - ✅ **DONE**: Đã hoàn thành
- **Kéo - Thả trực quan**: Di chuyển thẻ công việc linh hoạt giữa các cột trạng thái.
- **Quản lý Thông tin Công việc chi tiết**:
  - Tiêu đề & Mô tả chi tiết.
  - Mức độ ưu tiên: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - Hạn chót hoàn thành (`dueDate`), người được giao (`assignee`), người tạo (`reporter`).
  - Thanh trượt tiến độ (% hoàn thành).
  - Ước lượng thời gian (`estimatedHours`) & Thời gian thực tế (`actualHours`).

### 3.4. Phân hệ Checklist Công việc con (Subtasks)
- Tạo danh sách các đầu việc nhỏ trực thuộc một Task.
- Checkbox hoàn thành / hủy hoàn thành công việc con tức thì.
- Tự động tính toán và đồng bộ tỷ lệ hoàn thành của Task chính.

### 3.5. Phân hệ Bình luận & Thảo luận (Comments)
- Bình luận trao đổi trực tiếp trong từng Task.
- Lưu trữ lịch sử trao đổi kèm thông tin người gửi, avatar và mốc thời gian.
- Cho phép chỉnh sửa hoặc xóa bình luận của chính mình.

### 3.6. Trung tâm Thông báo Thời gian thực (Notifications)
- **Notification Bell**: Chuông thông báo trên thanh điều hướng hiển thị số lượng tin chưa đọc.
- **Tự động gửi thông báo khi**:
  - Được giao một Task mới (`TASK_ASSIGNED`).
  - Được duyệt hoặc mời tham gia dự án (`PROJECT_INVITED`).
  - Các sự kiện hệ thống (`SYSTEM`).
- Đánh dấu đã đọc từng thông báo hoặc Đánh dấu đã đọc tất cả (`Mark all as read`).
- Điều hướng nhanh đến trang dự án tương ứng khi nhấn vào thông báo.

### 3.7. Phân hệ Lộ trình & Dòng thời gian (Timeline / Gantt View)
- Trực quan hóa kế hoạch làm việc trên biểu đồ thanh tiến độ Gantt.
- Theo dõi mốc bắt đầu, thời hạn kết thúc và tiến độ thực tế theo từng ngày/tháng/năm.
- Bộ lọc thông minh theo Dự án, Trạng thái và Mức độ ưu tiên.

### 3.8. Phân hệ Công việc Cá nhân (My Tasks)
- Bảng tổng hợp tất cả công việc được giao cho cá nhân từ mọi dự án đang tham gia.
- Hỗ trợ lọc nhanh theo Trạng thái (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) và Mức độ ưu tiên.
- Cập nhật nhanh trạng thái và tiến độ mà không cần mở từng dự án riêng lẻ.

### 3.9. Cổng Quản trị Hệ thống (Admin Portal - `/admin`)
- **Admin Dashboard**:
  - Giám sát tổng số Người dùng, Dự án, Công việc và Tài khoản bị khóa.
  - Biểu đồ tròn (Donut Chart) và biểu đồ cột (Bar Chart) phân tích phân bổ dữ liệu hệ thống.
- **Quản lý Toàn bộ Dự án (Admin Projects)**:
  - Tra cứu, xem chi tiết tất cả các dự án trên toàn hệ thống và danh sách công việc liên quan.
- **Quản lý Tài khoản (User Management)**:
  - Xem danh sách toàn bộ người dùng, tìm kiếm theo tên/email.
  - Chức năng **Khóa / Mở khóa tài khoản (Lock/Unlock)** để ngăn chặn các truy cập vi phạm.
- **Cấu hình & Tình trạng Hệ thống (System Settings)**:
  - Kiểm tra trạng thái máy chủ Backend Server, Cơ sở dữ liệu và tài nguyên hệ thống.

### 3.10. Ứng dụng Di động (Mobile App - React Native / Expo)
- Kiểm tra trạng thái kết nối máy chủ Backend Server trong thời gian thực.
- Thống kê nhanh số lượng công việc cá nhân phân theo các trạng thái.
- Hỗ trợ chạy trên thiết bị vật lý qua **Expo Go** hoặc trình giả lập (Android Emulator / iOS Simulator).

---

<a id="4-cau-truc-thu-muc-du-an-monorepo"></a>
## 4. Cấu trúc Thư mục Dự án (Monorepo)

```text
mini-jira-project/
├── apps/                               # Không gian chứa các ứng dụng độc lập
│   ├── server/                         # Backend REST API Server (Express 5 + TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/            # Controller xử lý Request/Response
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── comment.controller.ts
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── project.controller.ts
│   │   │   │   ├── subtask.controller.ts
│   │   │   │   ├── task.controller.ts
│   │   │   │   └── user.controller.ts
│   │   │   ├── db/                     # Cấu hình Cơ sở dữ liệu & Schema Drizzle
│   │   │   │   ├── schema/             # Định nghĩa cấu trúc các bảng PostgreSQL
│   │   │   │   │   ├── comments.ts
│   │   │   │   │   ├── notifications.ts
│   │   │   │   │   ├── project_members.ts
│   │   │   │   │   ├── projects.ts
│   │   │   │   │   ├── subtasks.ts
│   │   │   │   │   ├── task_history.ts
│   │   │   │   │   ├── tasks.ts
│   │   │   │   │   └── users.ts
│   │   │   │   ├── index.ts            # Kết nối Drizzle ORM qua Pool PostgreSQL
│   │   │   │   └── schema.ts           # Re-export toàn bộ schema
│   │   │   ├── middlewares/            # Middleware xác thực JWT Bearer Token
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── routes/                 # Định tuyến API
│   │   │   │   ├── auth.route.ts
│   │   │   │   ├── comment.route.ts
│   │   │   │   ├── notification.route.ts
│   │   │   │   ├── project.route.ts
│   │   │   │   ├── subtask.route.ts
│   │   │   │   ├── task.route.ts
│   │   │   │   ├── user.route.ts
│   │   │   │   └── index.ts            # Root API Router (`/api`)
│   │   │   ├── services/               # Tầng xử lý Logic Nghiệp vụ (Business Logic)
│   │   │   │   ├── comment.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── subtask.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   └── user.service.ts
│   │   │   └── index.ts                # Điểm khởi chạy Backend Express
│   │   ├── drizzle.config.ts           # Cấu hình Drizzle Kit
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                            # Frontend Web Application (React 19 + Vite 6)
│   │   ├── src/
│   │   │   ├── components/             # Reusable UI Components
│   │   │   │   ├── profile/            # Modal đổi avatar & đổi mật khẩu
│   │   │   │   │   ├── ChangeAvatarModal.tsx
│   │   │   │   │   └── ChangePasswordModal.tsx
│   │   │   │   ├── AdminLayout.tsx     # Layout điều hướng dành riêng cho Admin
│   │   │   │   ├── Layout.tsx          # Main Shell Layout cho người dùng
│   │   │   │   └── NotificationBell.tsx# Chuông thông báo Header
│   │   │   ├── pages/                  # Các trang chính của Web
│   │   │   │   ├── admin/              # Phân hệ Quản trị (Admin Portal)
│   │   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   │   ├── AdminProjects.tsx
│   │   │   │   │   └── AdminSystemSettings.tsx
│   │   │   │   ├── Dashboard.tsx       # Bảng điều khiển người dùng & thống kê
│   │   │   │   ├── Login.tsx           # Trang Đăng nhập
│   │   │   │   ├── MyTasks.tsx         # Trang Công việc của tôi
│   │   │   │   ├── Profile.tsx         # Trang Hồ sơ cá nhân
│   │   │   │   ├── ProjectDetail.tsx   # Trang Chi tiết Dự án (Kanban, Thành viên, Task Modal)
│   │   │   │   ├── Projects.tsx        # Danh sách Dự án & Tạo mới / Tham gia
│   │   │   │   ├── Register.tsx        # Trang Đăng ký
│   │   │   │   ├── Timeline.tsx        # Trang Lộ trình (Roadmap / Gantt)
│   │   │   │   └── UserManagement.tsx  # Trang Quản lý Người dùng
│   │   │   ├── services/               # Axios Instance cấu hình Interceptor
│   │   │   │   └── api.ts
│   │   │   ├── App.tsx                 # Cấu hình Tuyến đường (Routes)
│   │   │   ├── index.css               # Hệ thống Style Design System & TailwindCSS
│   │   │   └── main.tsx                # Entry Point React
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                         # Mobile Application (React Native + Expo SDK 52)
│       ├── App.tsx                     # Giao diện chính Mobile App
│       ├── app.json                    # Cấu hình Expo App
│       ├── tsconfig.json               # Cấu hình TypeScript
│       └── package.json
│
├── drizzle/                            # Workspace hỗ trợ chạy Drizzle Studio GUI
│   └── package.json
│
├── turbo.json                          # Cấu hình điều phối Turborepo TUI
├── package.json                        # Cấu hình Root Monorepo
├── LICENSE                             # Giấy phép bản quyền mã nguồn (ISC License)
└── README.md                           # Tài liệu Hướng dẫn Hệ thống
```

---

<a id="5-cau-hinh-bien-moi-truong-environment-variables"></a>
## 5. Cấu hình Biến môi trường (Environment Variables)

### 5.1. Cấu hình Backend (`apps/server/.env`)

Tạo file `.env` tại thư mục `apps/server/` với nội dung mẫu:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_jira_db
JWT_SECRET=bi_mat_jira_secret_key_2026
```

> **Ghi chú**: Thay đổi `password`, cổng và tên cơ sở dữ liệu `mini_jira_db` phù hợp với thông tin kết nối PostgreSQL của bạn.

### 5.2. Cấu hình Frontend Web (`apps/web/.env`)

Tạo file `.env` tại thư mục `apps/web/` nếu cần tùy chỉnh địa chỉ Backend API:

```env
VITE_API_URL=http://localhost:5000
```

### 5.3. Cấu hình Mobile App (`apps/mobile/App.tsx`)

Trong file `apps/mobile/App.tsx`, cập nhật địa chỉ API phù hợp với môi trường thử nghiệm:
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Thiết bị thật (Expo Go)**: `http://<IP_LAN_MAY_TINH>:5000/api` (Ví dụ: `http://192.168.1.15:5000/api`)

---

<a id="6-huong-dan-cai-dat--khoi-chay"></a>
## 6. Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Clone Kho lưu trữ (Clone Repository)

```bash
git clone https://github.com/XuanQuang1301/mini-jira-project.git
cd mini-jira-project
```

### Bước 2: Cài đặt Dependencies

Cài đặt tất cả các gói thư viện cho toàn bộ dự án từ thư mục gốc:

```bash
npm install
```

### Bước 3: Đồng bộ Cơ sở dữ liệu (Database Migration)

Đẩy toàn bộ cấu trúc Schema lên Cơ sở dữ liệu PostgreSQL:

```bash
cd apps/server
npx drizzle-kit push
cd ../..
```

*(Hoặc chạy lệnh `npm run db:push --prefix apps/server` ngay tại thư mục gốc).*

### Bước 4: Khởi chạy Ứng dụng

#### 🔹 Cách 1: Khởi chạy toàn bộ hệ thống bằng Turborepo TUI (Khuyên dùng)

```bash
npm run dev
```

Lệnh này sẽ tự động khởi động giao diện **Turborepo Terminal User Interface (TUI)** quản lý đồng thời tất cả các phân hệ:

| Phân hệ | Lệnh Task | Địa chỉ Truy cập / Cổng |
| :--- | :--- | :--- |
| 🌐 **Frontend Web** | `web#dev` | `http://localhost:5173` |
| ⚙️ **Backend Server** | `server#dev` | `http://localhost:5000` |
| 📱 **Mobile App** | `mobile#dev` | `http://localhost:8081` (Expo Bundler) |
| 🗄️ **Drizzle Studio** | `drizzle#dev` | `http://localhost:4984` (hoặc `https://local.drizzle.studio`) |

*👉 Dùng các phím mũi tên **↑ / ↓** trong Terminal để chuyển đổi xem log giữa các ứng dụng.*

---

#### 🔹 Cách 2: Khởi chạy riêng lẻ từng phân hệ theo nhu cầu

Nếu muốn mở từng terminal riêng biệt:

- **Khởi chạy Backend Server**:
  ```bash
  npm run server
  ```
- **Khởi chạy Frontend Web**:
  ```bash
  npm run web
  ```
- **Khởi chạy Mobile Expo App**:
  ```bash
  npm run mobile
  ```
- **Mở Giao diện Quản lý CSDL (Drizzle Studio)**:
  ```bash
  npm run drizzle
  ```

---

<a id="7-tai-lieu-chi-tiet-api-endpoints"></a>
## 7. Tài liệu Chi tiết API Endpoints

Tất cả các API đều có tiền tố chung là `/api`. Các yêu cầu ngoại trừ Đăng ký / Đăng nhập đều yêu cầu truyền Token xác thực tại Header: `Authorization: Bearer <token>`.

### 7.1. Xác thực (Authentication) - `/api/auth`

| Phương thức | Endpoint | Mô tả | Request Body Mẫu |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/signin` | Đăng nhập tài khoản, trả về thông tin user & JWT Token | `{ "email": "...", "password": "..." }` |

### 7.2. Người dùng & Hồ sơ (Users & Profile) - `/api/users`

| Phương thức | Endpoint | Mô tả | Quyền / Xác thực |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Lấy thông tin cá nhân của người dùng hiện tại | Authenticated |
| `PUT` | `/api/users/profile` | Cập nhật thông tin cá nhân (Tên, Email) | Authenticated |
| `PUT` | `/api/users/profile/password` | Đổi mật khẩu tài khoản (Xác thực mật khẩu cũ) | Authenticated |
| `POST` | `/api/users/profile/avatar` | Cập nhật URL ảnh đại diện | Authenticated |
| `GET` | `/api/users` | Lấy danh sách tất cả người dùng trong hệ thống | Authenticated |
| `PUT` | `/api/users/:userId/lock` | Khóa hoặc Mở khóa tài khoản người dùng | Admin / Manager |
| `DELETE` | `/api/users/:id` | Xóa tài khoản người dùng | Admin |

### 7.3. Dự án & Quản lý Thành viên (Projects & Members) - `/api/project`

| Phương thức | Endpoint | Mô tả | Chi tiết / Tham số |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/project/my` | Lấy danh sách dự án mà người dùng đang tham gia | Authenticated |
| `GET` | `/api/project/all` | Lấy tất cả dự án trong toàn bộ hệ thống | Dành cho Admin |
| `GET` | `/api/project/:id` | Lấy chi tiết thông tin 1 dự án theo ID | Authenticated |
| `POST` | `/api/project/create` | Tạo mới dự án (người tạo tự động làm `OWNER`) | `{ "name": "...", "key": "...", "description": "..." }` |
| `PATCH` | `/api/project/:id` | Cập nhật thông tin dự án (Tên, Mã Key, Mô tả) | `{ "name": "...", "key": "...", "description": "..." }` |
| `DELETE` | `/api/project/delete/:id` | Xóa toàn bộ dự án | Chỉ dành cho Owner |
| `POST` | `/api/project/join` | Gửi yêu cầu gia nhập dự án bằng Mã Key (`PENDING`) | `{ "projectCode": "PROJ-KEY" }` |
| `GET` | `/api/project/:id/pending` | Xem danh sách thành viên đang chờ phê duyệt | Owner / Admin |
| `POST` | `/api/project/approve` | Phê duyệt hoặc Từ chối thành viên gia nhập | `{ "memberRecordId": 1 }` |
| `GET` | `/api/project/:id/members` | Lấy danh sách tất cả thành viên trong dự án | Authenticated |
| `POST` | `/api/project/:id/members` | Mời trực tiếp thành viên vào dự án qua Email | `{ "email": "...", "role": "MEMBER" }` |
| `DELETE` | `/api/project/:id/members/:memberId` | Xóa thành viên ra khỏi dự án | Owner / Admin |

### 7.4. Công việc (Tasks) - `/api/tasks` & `/api/project/:projectId/tasks`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/tasks/my-tasks` *(hoặc `/api/project/tasks/my-tasks`)* | Lấy toàn bộ danh sách công việc được giao cho cá nhân |
| `GET` | `/api/tasks/project/:projectId` *(hoặc `/api/project/:projectId/tasks`)* | Lấy danh sách toàn bộ công việc thuộc một dự án |
| `GET` | `/api/tasks/:id` | Xem thông tin chi tiết một công việc |
| `POST` | `/api/tasks` *(hoặc `/api/project/:projectId/tasks`)* | Tạo công việc mới trong dự án |
| `PUT` | `/api/tasks/:id` *(hoặc `/api/project/:projectId/tasks/:id`)* | Cập nhật toàn diện công việc (Hạn, Ước tính, Giờ thực tế,...) |
| `PATCH` | `/api/tasks/:id/status` *(hoặc `/api/project/:projectId/tasks/:id/status`)* | Cập nhật trạng thái (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) & vị trí |
| `PATCH` | `/api/tasks/:id/assign` *(hoặc `/api/project/:projectId/tasks/:id/assignee`)* | Giao việc hoặc chuyển đổi người thực hiện |
| `DELETE` | `/api/tasks/:id` *(hoặc `/api/project/:projectId/tasks/:id`)* | Xóa công việc khỏi dự án |

### 7.5. Công việc con (Subtasks) - `/api/subtasks`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/subtasks/task/:taskId` | Lấy danh sách checklist công việc con của một Task |
| `POST` | `/api/subtasks` | Thêm mới một subtask vào Task (`{ "taskId": 1, "content": "..." }`) |
| `PATCH` | `/api/subtasks/:id` | Đánh dấu hoàn thành / chưa hoàn thành subtask (`{ "isDone": true }`) |
| `DELETE` | `/api/subtasks/:id` | Xóa một subtask |

### 7.6. Bình luận (Comments) - `/api/comments`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/comments/task/:taskId` *(hoặc `/api/project/:projectId/tasks/:taskId/comments`)* | Lấy danh sách bình luận của Task |
| `POST` | `/api/comments` *(hoặc `/api/project/:projectId/tasks/:taskId/comments`)* | Gửi bình luận mới vào Task |
| `PUT` | `/api/comments/:id` | Chỉnh sửa nội dung bình luận của bản thân |
| `DELETE` | `/api/comments/:id` | Xóa bình luận của bản thân |

### 7.7. Thông báo (Notifications) - `/api/notifications`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | Lấy danh sách thông báo của người dùng đăng nhập |
| `PATCH` | `/api/notifications/read-all` | Đánh dấu tất cả thông báo là đã đọc |
| `PATCH` | `/api/notifications/:id/read` | Đánh dấu 1 thông báo cụ thể là đã đọc |

---

<a id="8-co-so-du-lieu--drizzle-schema"></a>
## 8. Cơ sở Dữ liệu & Drizzle Schema

Hệ thống sử dụng **PostgreSQL** kết hợp với **Drizzle ORM**, gồm 8 bảng quan hệ:

1. **`users`**: Lưu trữ thông tin tài khoản, mật khẩu mã hóa Bcrypt, avatar và cờ trạng thái khóa tài khoản (`isLocked`).
2. **`projects`**: Thông tin dự án, mã định danh `key` độc nhất, mô tả và liên kết với `ownerId`.
3. **`project_members`**: Bảng quan hệ N-N giữa User và Project kèm vai trò (`OWNER`, `ADMIN`, `MEMBER`, `PENDING`).
4. **`tasks`**: Chi tiết công việc, độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), tiến độ (`progress`), trạng thái (`status`), vị trí sắp xếp (`position`), thời gian bắt đầu/kết thúc/hạn chót, liên kết với `projectId`, `assigneeId`, `reporterId`.
5. **`subtasks` (`sub_tasks`)**: Các đầu việc nhỏ trong task kèm trạng thái `isDone` và liên kết khóa ngoại với `tasks`.
6. **`comments`**: Nội dung thảo luận trên task, lưu `userId`, `taskId`, thời gian tạo.
7. **`task_history`**: Nhật ký lịch sử thay đổi trạng thái và tiến độ của từng task theo thời gian.
8. **`notifications`**: Thông báo người dùng (`title`, `message`, `type`, `link`, `isRead`).

---

<a id="9-tac-gia--giay-phep"></a>
## 9. Tác giả & Giấy phép

- **Tác giả**: Đặng Xuân Quang
- **GitHub**: [@XuanQuang1301](https://github.com/XuanQuang1301)
- **Repository**: [https://github.com/XuanQuang1301/mini-jira-project](https://github.com/XuanQuang1301/mini-jira-project)
- **Giấy phép**: [ISC License](LICENSE)
