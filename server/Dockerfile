# Sử dụng Node.js bản 20
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý thư viện trước để tối ưu build cache
COPY package*.json ./

# Cài đặt các thư viện cần thiết
RUN npm install

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Biên dịch TypeScript sang JavaScript
RUN npm run build

# Mở cổng 5000 cho backend
EXPOSE 5000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]