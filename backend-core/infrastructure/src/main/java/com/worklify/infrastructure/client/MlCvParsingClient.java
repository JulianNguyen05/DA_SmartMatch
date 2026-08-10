package com.worklify.infrastructure.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worklify.application.candidate.dto.ParsedCvResponse;
import com.worklify.application.common.port.CvParsingPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Duration;

/**
 * Gọi sang backend-ml POST /parser/extract. Không cần header API key —
 * endpoint này không permitAll-protected phía ML (khác /api/internal/**
 * bên backend-core mà InternalReferenceValueController đang bảo vệ).
 */
@Slf4j
@Component
public class MlCvParsingClient implements CvParsingPort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${worklify.ml.base-url}")
    private String mlBaseUrl;

    public MlCvParsingClient(RestTemplateBuilder builder, ObjectMapper objectMapper) {
        // Timeout dài hơn các call nội bộ khác vì OCR ảnh/PDF scan + inference
        // NER có thể mất vài giây, nhất là lần đầu load model (lazy-load).
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public ParsedCvResponse extractCv(MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", toResource(file));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ParsedCvResponse response = restTemplate.postForObject(
                    mlBaseUrl + "/parser/extract", requestEntity, ParsedCvResponse.class);

            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Không nhận được phản hồi từ dịch vụ phân tích CV.");
            }
            return response;

        } catch (HttpStatusCodeException ex) {
            // backend-ml trả 415 (sai định dạng file) / 413 (quá 10MB) / 400 (không đọc được nội dung)
            // kèm body FastAPI dạng {"detail": "..."} — bóc ra để trả thẳng message cho frontend.
            log.warn("backend-ml từ chối file CV: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ResponseStatusException(
                    HttpStatus.valueOf(ex.getStatusCode().value()),
                    extractDetailMessage(ex.getResponseBodyAsString())
            );
        } catch (RestClientException ex) {
            log.error("Lỗi khi gọi backend-ml /parser/extract", ex);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không thể phân tích CV lúc này, vui lòng thử lại sau.", ex);
        }
    }

    private String extractDetailMessage(String responseBody) {
        try {
            JsonNode node = objectMapper.readTree(responseBody);
            return node.has("detail") ? node.get("detail").asText() : "Không thể phân tích file CV.";
        } catch (Exception e) {
            return "Không thể phân tích file CV.";
        }
    }

    private ByteArrayResource toResource(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            return new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (IOException e) {
            throw new RuntimeException("Không đọc được nội dung file tải lên.", e);
        }
    }
}