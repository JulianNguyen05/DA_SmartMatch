package com.smartmatch.api.controller.publics;

import com.smartmatch.application.dto.PageResponse;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.JobSearchRequest;
import com.smartmatch.application.service.employer.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/jobs")
@RequiredArgsConstructor
@Tag(name = "Public - Jobs", description = "API công khai xem tin tuyển dụng (không cần đăng nhập)")
public class PublicJobController {

    private final JobService jobService;

    @Operation(
            summary = "Lấy tất cả tin tuyển dụng đang công khai",
            description = "Trả về danh sách tin PUBLISHED với phân trang nâng cao. Mặc định sort theo postedAt DESC (tin mới nhất trước)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống")
    })
    @GetMapping
    public ResponseEntity<PageResponse<JobResponse>> getAllPublishedJobs(
            @Parameter(hidden = true) // Pageable sẽ được Swagger tự render
            @PageableDefault(size = 20, sort = "postedAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {

        JobSearchRequest emptyRequest = new JobSearchRequest();
        PageResponse<JobResponse> page = jobService.searchPublishedJobs(emptyRequest, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(
            summary = "Tìm kiếm & lọc tin tuyển dụng nâng cao",
            description = "Hỗ trợ lọc theo keyword, location, jobType, experienceLevel, khoảng lương + phân trang."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống")
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<JobResponse>> searchJobs(
            @ModelAttribute
            @Parameter(description = "Các tham số lọc & phân trang")
            JobSearchRequest request,

            @Parameter(hidden = true)
            @PageableDefault(size = 20, sort = "postedAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {

        PageResponse<JobResponse> page = jobService.searchPublishedJobs(request, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(
            summary = "Xem chi tiết một tin tuyển dụng công khai",
            description = "Trả về đầy đủ thông tin của 1 Job theo ID (chỉ tin PUBLISHED)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công",
                    content = @Content(schema = @Schema(implementation = JobResponse.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy tin hoặc tin đã đóng")
    })
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getPublicJobById(
            @Parameter(description = "ID của tin tuyển dụng", example = "1", required = true)
            @PathVariable Long id) {

        return ResponseEntity.ok(jobService.getPublicJobById(id));
    }
}