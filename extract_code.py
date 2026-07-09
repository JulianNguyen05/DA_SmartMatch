import os

# 1. Cấu hình đường dẫn và file đầu ra
PROJECT_DIR = r"D:\2025_2026_II\DuAn\da_Worklify\backend-core"
OUTPUT_FILE = "backend_code.txt"

# 2. Chỉ định các loại file muốn lấy code
ALLOWED_EXTENSIONS = {".java", ".yml", ".xml", ".properties", ".sql"}

# 3. Bỏ qua các thư mục build/cache không chứa code nguồn
IGNORED_DIRS = {"target", ".mvn", ".git", ".idea", "uploads", "demo_images"}

def extract_code():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk(PROJECT_DIR):
            # Lọc bỏ các thư mục nằm trong danh sách đen
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    file_path = os.path.join(root, file)
                    
                    # Tạo đường dẫn tương đối cho đẹp mắt (VD: \api\src\main\...)
                    relative_path = file_path.replace(PROJECT_DIR, "")
                    
                    # Ghi Header phân cách giữa các file
                    outfile.write("=" * 80 + "\n")
                    outfile.write(f"FILE: {relative_path}\n")
                    outfile.write("=" * 80 + "\n\n")

                    # Đọc nội dung file và ghi vào file txt
                    try:
                        with open(file_path, "r", encoding="utf-8") as infile:
                            outfile.write(infile.read() + "\n\n")
                    except Exception as e:
                        outfile.write(f"// [Lỗi khi đọc file này]: {e}\n\n")

if __name__ == "__main__":
    extract_code()
    print(f"✅ Đã gom code thành công! Bạn hãy mở file '{OUTPUT_FILE}' để xem.")