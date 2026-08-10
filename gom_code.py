import os

# Danh sách các file được map chính xác từ cây thư mục
TARGET_FILES = [
    # --- 1. Backend ML ---
    "backend-ml/app/api/endpoints/parser.py",
    "backend-ml/app/services/text_extractor.py",
    "backend-ml/app/services/parser_service.py",
    "backend-ml/app/services/ner_postprocessor.py",
    "backend-ml/app/services/rule_based_extractor.py",
    "backend-ml/app/models/model_loader.py",
    "backend-ml/app/schemas/parser_schema.py",
    "backend-ml/app/main.py",
    "backend-ml/app/api/router.py",

    # --- 2. Backend Core ---
    "backend-core/api/src/main/java/com/worklify/api/file/FileController.java",
    "backend-core/api/src/main/java/com/worklify/api/candidate/CandidateController.java",
    "backend-core/application/src/main/java/com/worklify/application/candidate/service/impl/CandidateServiceImpl.java",
    "backend-core/application/src/main/java/com/worklify/application/candidate/service/CandidateService.java",
    "backend-core/application/src/main/java/com/worklify/application/candidate/dto/GeneratedCvRequest.java",
    "backend-core/application/src/main/java/com/worklify/application/candidate/dto/CvDocumentResponse.java",
    "backend-core/infrastructure/src/main/java/com/worklify/infrastructure/persistence/adapter/CvDocumentRepositoryAdapter.java",
    "backend-core/infrastructure/src/main/java/com/worklify/infrastructure/persistence/entity/CvDocumentJpaEntity.java",
    "backend-core/application/src/main/java/com/worklify/application/common/port/FileStoragePort.java",
    "backend-core/infrastructure/src/main/java/com/worklify/infrastructure/storage/LocalFileStorageService.java", # File Implement của port

    # --- 3. Frontend ---
    "frontend-app/src/pages/candidate/CVBuilderPage/index.jsx",
    "frontend-app/src/components/cv-builder/shared/mapParsedCvToCvData.js",
    "frontend-app/src/features/candidate/candidateService.js"
]

# Thư mục cần gom toàn bộ file bên trong
TARGET_DIRS = [
    "frontend-app/src/components/common/FileUpload"
]

OUTPUT_FILE = "exported_cv_feature_context.md"

def gather_files():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        outfile.write("# CV Feature Source Code Context\n\n")
        
        # Xử lý các file lẻ
        for filepath in TARGET_FILES:
            append_file_content(filepath, outfile)
            
        # Xử lý các thư mục (Quét tìm index.jsx, index.js, hoặc css)
        for directory in TARGET_DIRS:
            if os.path.exists(directory):
                for root, _, files in os.walk(directory):
                    for file in files:
                        file_path = os.path.join(root, file)
                        append_file_content(file_path, outfile)

def append_file_content(filepath, outfile):
    if os.path.exists(filepath):
        outfile.write(f"## File: `{filepath}`\n\n")
        outfile.write("```" + get_extension(filepath) + "\n")
        try:
            with open(filepath, "r", encoding="utf-8") as infile:
                outfile.write(infile.read() + "\n")
        except Exception as e:
            outfile.write(f"// Error reading file: {e}\n")
        outfile.write("```\n\n")
    else:
        print(f"⚠️ Warning: File not found: {filepath}")

def get_extension(filepath):
    ext = filepath.split('.')[-1].lower()
    if ext in ['py']: return 'python'
    if ext in ['java']: return 'java'
    if ext in ['js', 'jsx']: return 'javascript'
    return 'text'

if __name__ == "__main__":
    gather_files()
    print(f"✅ Đã gom code thành công vào file: {OUTPUT_FILE}")