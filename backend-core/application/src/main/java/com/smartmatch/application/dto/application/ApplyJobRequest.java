package com.smartmatch.application.dto.application;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyJobRequest {

    @NotNull(message = "Job ID không được để trống")
    private Long jobId;

    @Size(max = 2000, message = "Thư xin việc tối đa 2000 ký tự")
    private String coverLetter;
    private String customAnswers;
}