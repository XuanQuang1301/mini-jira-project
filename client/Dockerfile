# Bước 1: Build ứng dụng React bằng Node
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Chạy ứng dụng bằng Nginx (server web nhẹ)
FROM nginx:stable-alpine
# Copy file đã build từ bước 1 vào thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Mở cổng 80 bên trong container
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]