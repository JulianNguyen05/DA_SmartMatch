import os

# Tên file đầu ra chứa code
OUTPUT_FILE = "job_feature_all_code.txt"

# Danh sách toàn bộ 13 file theo yêu cầu
ALL_FILES = [
    # --- BACKEND ---
    "backend-core/application/src/main/java/com/worklify/application/job/dto/JobPostingRequest.java",  # 1
    "backend-core/application/src/main/java/com/worklify/application/job/dto/JobPostingResponse.java", # 2
    "backend-core/domain/src/main/java/com/worklify/domain/job/model/JobPosting.java",               # 3
    "backend-core/infrastructure/src/main/java/com/worklify/infrastructure/persistence/entity/JobPostingJpaEntity.java", # 4
    "backend-core/infrastructure/src/main/java/com/worklify/infrastructure/persistence/mapper/JobPostingEntityMapper.java", # 5
    "backend-core/api/src/main/java/com/worklify/api/controller/job/JobController.java",             # 6
    "backend-core/application/src/main/java/com/worklify/application/job/service/impl/JobServiceImpl.java", # 7
    
    # --- FRONTEND ---
    "frontend-app/src/pages/employer/JobCreatePage/index.jsx",    # 8
    "frontend-app/src/pages/employer/JobEditPage/index.jsx",      # 9
    "frontend-app/src/features/job/jobService.js",                # 10
    "frontend-app/src/pages/public/JobDetailPage/index.jsx",      # 11
    "frontend-app/package.json",                                  # 12
    
    # --- COMPONENTS (Neo UI) ---
    "frontend-app/src/components/common/neo/NeoInput.jsx",        # 13a
    "frontend-app/src/components/common/neo/NeoButton.jsx",       # 13b
    "frontend-app/src/components/common/neo/NeoModal.jsx"         # 13c
]

def gather_files(file_list, output_filename):
    root_dir = os.getcwd()
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        outfile.write("=================================================================\n")
        outfile.write("            TỔNG HỢP FULL CODE - TÍNH NĂNG JOB (1-13)\n")
        outfile.write("=================================================================\n\n")
        
        for filepath in file_list:
            full_path = os.path.join(root_dir, filepath)
            outfile.write(f"\n{'='*80}\n")
            outfile.write(f"FILE: {filepath}\n")
            outfile.write(f"{'='*80}\n\n")
            
            try:
                with open(full_path, 'r', encoding='utf-8') as infile:
                    outfile.write(infile.read())
                    outfile.write("\n")
                print(f"✅ Đã gom: {filepath}")
            except FileNotFoundError:
                outfile.write("// ❌ LỖI: Không tìm thấy file này!\n")
                print(f"❌ Không tìm thấy: {filepath}")
            except Exception as e:
                outfile.write(f"// ❌ LỖI đọc file: {e}\n")
                print(f"❌ Lỗi đọc file {filepath}: {e}")

if __name__ == "__main__":
    print("Đang tạo file tổng hợp code...")
    gather_files(ALL_FILES, OUTPUT_FILE)
    print(f"\n🎉 Hoàn tất! Đã lưu toàn bộ nội dung vào file: {OUTPUT_FILE}")