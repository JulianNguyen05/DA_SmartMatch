# Sử dụng Python 3.11 bản slim để tương thích với requirements.txt của bạn
FROM python:3.11-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cần thiết
RUN apt-get update && apt-get install -y build-essential

# Cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY app ./app

EXPOSE 8000

# Chạy server FastAPI qua uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]