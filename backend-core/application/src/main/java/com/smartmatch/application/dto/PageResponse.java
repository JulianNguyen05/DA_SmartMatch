package com.smartmatch.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Đối tượng phân trang chuẩn cho toàn bộ API SmartMatch")
public class PageResponse<T> {

    @Schema(description = "Danh sách dữ liệu trên trang hiện tại", example = "[{...}]")
    private List<T> content;

    @Schema(description = "Trang hiện tại (bắt đầu từ 0)", example = "0", defaultValue = "0")
    private int page;

    @Schema(description = "Số lượng phần tử mỗi trang", example = "20", defaultValue = "20")
    private int size;

    @Schema(description = "Tổng số phần tử", example = "145")
    private long totalElements;

    @Schema(description = "Tổng số trang", example = "8")
    private int totalPages;

    @Schema(description = "Có trang kế tiếp không?", example = "true")
    private boolean hasNext;

    @Schema(description = "Có trang trước không?", example = "false")
    private boolean hasPrevious;

    @Schema(description = "Là trang đầu tiên?", example = "true")
    private boolean isFirst;

    @Schema(description = "Là trang cuối cùng?", example = "false")
    private boolean isLast;

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious(),
                page.isFirst(),
                page.isLast()
        );
    }
}