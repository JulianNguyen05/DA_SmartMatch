import os

# Đường dẫn thư mục backend-core
ROOT_DIR = "backend-core"
# Thư mục chứa các file .txt sau khi xuất ra (khớp với cấu trúc hiện tại của bạn)
OUTPUT_DIR = "exported_code"

# Định nghĩa đường dẫn source code của 4 tầng và tên file output tương ứng
LAYERS = {
    "api": {
        "path": os.path.join(ROOT_DIR, "api", "src", "main", "java"),
        "output": os.path.join(OUTPUT_DIR, "1_api_layer.txt")
    },
    "application": {
        "path": os.path.join(ROOT_DIR, "application", "src", "main", "java"),
        "output": os.path.join(OUTPUT_DIR, "2_application_layer.txt")
    },
    "domain": {
        "path": os.path.join(ROOT_DIR, "domain", "src", "main", "java"),
        "output": os.path.join(OUTPUT_DIR, "3_domain_layer.txt")
    },
    "infrastructure": {
        "path": os.path.join(ROOT_DIR, "infrastructure", "src", "main", "java"),
        "output": os.path.join(OUTPUT_DIR, "4_infrastructure_layer.txt")
    }
}

# Đuôi file cần gom (ở đây backend-core viết bằng Java)
ALLOWED_EXTENSIONS = [".java"]

def gom_code():
    # Tạo thư mục output nếu chưa tồn tại
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Đã tạo thư mục '{OUTPUT_DIR}' để chứa file kết quả.")

    if not os.path.exists(ROOT_DIR):
        print(f"LỖI: Không tìm thấy thư mục '{ROOT_DIR}'. Hãy đảm bảo script đang chạy ở thư mục gốc (da_Worklify).")
        return

    for layer_name, config in LAYERS.items():
        source_dir = config["path"]
        output_file = config["output"]
        
        print(f"🔄 Đang gom code tầng '{layer_name.upper()}' từ '{source_dir}'...")
        
        if not os.path.exists(source_dir):
            print(f"  ❌ Bỏ qua: Thư mục {source_dir} không tồn tại.")
            continue

        with open(output_file, "w", encoding="utf-8") as outfile:
            file_count = 0
            # Duyệt đệ quy tất cả các thư mục và file
            for root, _, files in os.walk(source_dir):
                for file in files:
                    if any(file.endswith(ext) for ext in ALLOWED_EXTENSIONS):
                        file_path = os.path.join(root, file)
                        
                        # Ghi header để ngăn cách và dễ phân biệt giữa các file code
                        outfile.write(f"{'='*80}\n")
                        # Thay thế dấu \ thành / để đường dẫn đồng nhất dễ đọc
                        formatted_path = file_path.replace('\\', '/')
                        outfile.write(f"FILE: {formatted_path}\n")
                        outfile.write(f"{'='*80}\n\n")
                        
                        # Đọc và ghi nội dung code vào file output
                        try:
                            with open(file_path, "r", encoding="utf-8") as infile:
                                outfile.write(infile.read())
                                outfile.write("\n\n")
                            file_count += 1
                        except Exception as e:
                            print(f"  ⚠️ Lỗi khi đọc file {file_path}: {e}")
            
        print(f"  ✅ Đã gom thành công {file_count} file vào '{output_file}'\n")

if __name__ == "__main__":
    print("BẮT ĐẦU GOM CODE...\n" + "-"*30)
    gom_code()
    print("-"*30 + "\nHOÀN TẤT!")