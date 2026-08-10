package com.worklify.application.common.port;

import com.worklify.application.candidate.dto.ParsedCvResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CvParsingPort {
    /**
     * Gửi file CV (ảnh/PDF/docx) sang backend-ml để OCR + NER, trả về dữ liệu
     * đã trích xuất kèm confidence — KHÔNG lưu vào DB, chỉ dùng để prefill
     * CV Builder cho người dùng review.
     */
    ParsedCvResponse extractCv(MultipartFile file);
}