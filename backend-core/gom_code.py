import os
import shutil

# Ép script quét vào thư mục backend-core thay vì thư mục hiện tại của terminal
ROOT_DIR = "./backend-core"
OUTPUT_DIR = "exported_code"

LAYERS = {
    "api": "1_api_layer.txt",
    "application": "2_application_layer.txt",
    "domain": "3_domain_layer.txt",
    "infrastructure": "4_infrastructure_layer.txt",
}

CONFIG_OUTPUT = "5_configs.txt"
CONFIG_EXTENSIONS = (".xml", ".yml", ".properties", ".sql")
CONFIG_SPECIFIC_FILES = ("Dockerfile", "docker-compose.yml")

IGNORE_DIRS = ["uploads", "test", ".mvn", "target", ".git", OUTPUT_DIR]


def create_output_dir():
    """Xóa toàn bộ thư mục output cũ rồi tạo lại."""
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)

    os.makedirs(OUTPUT_DIR, exist_ok=True)


def write_file_content(filepath, outfile):
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            outfile.write(f"\n\n{'=' * 80}\n")
            outfile.write(f"FILE: {filepath}\n")
            outfile.write(f"{'=' * 80}\n\n")
            outfile.write(content)
    except Exception as e:
        outfile.write(f"\n[LỖI ĐỌC FILE {filepath}: {str(e)}]\n")


def is_ignored(path):
    for ignored in IGNORE_DIRS:
        if (
            f"{os.sep}{ignored}{os.sep}" in path
            or path.endswith(ignored)
            or path.startswith(f".{os.sep}{ignored}")
        ):
            return True
    return False


def export_layers():
    for layer_name, out_filename in LAYERS.items():
        out_filepath = os.path.join(OUTPUT_DIR, out_filename)
        layer_src_path = os.path.join(ROOT_DIR, layer_name, "src", "main", "java")

        with open(out_filepath, "w", encoding="utf-8") as outfile:
            outfile.write(f"=== TẦNG {layer_name.upper()} ===\n")

            if not os.path.exists(layer_src_path):
                outfile.write(
                    f"Không tìm thấy thư mục source code tại: {layer_src_path}\n"
                )
                continue

            for root, _, files in os.walk(layer_src_path):
                for file in files:
                    if file.endswith(".java"):
                        filepath = os.path.join(root, file)
                        write_file_content(filepath, outfile)

        print(f"✅ Đã gôm xong tầng {layer_name} -> {out_filename}")


def export_configs():
    out_filepath = os.path.join(OUTPUT_DIR, CONFIG_OUTPUT)

    with open(out_filepath, "w", encoding="utf-8") as outfile:
        outfile.write("=== FILES CẤU HÌNH ===\n")

        for root, _, files in os.walk(ROOT_DIR):
            if is_ignored(root):
                continue

            for file in files:
                if file.endswith(CONFIG_EXTENSIONS) or file in CONFIG_SPECIFIC_FILES:
                    filepath = os.path.join(root, file)
                    write_file_content(filepath, outfile)

    print(f"✅ Đã gôm xong cấu hình -> {CONFIG_OUTPUT}")


if __name__ == "__main__":
    print("🗑️ Đang xóa dữ liệu export cũ...")
    create_output_dir()

    print("🚀 Đang gôm code...")
    export_layers()
    export_configs()

    print(f"🎉 Hoàn tất! Code đã được gộp tại thư mục: {OUTPUT_DIR}")