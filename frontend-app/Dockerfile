# Sử dụng phiên bản Node 22 khớp với máy local của bạn
FROM node:22-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Chỉ copy file package trước để tận dụng Docker Cache cho node_modules
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng 5173 cho Vite
EXPOSE 5173

# Chạy lệnh dev với flag --host để truy cập được từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]