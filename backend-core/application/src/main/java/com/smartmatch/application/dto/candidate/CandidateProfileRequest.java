package com.smartmatch.application.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Size(max = 200, message = "Headline tối đa 200 ký tự")
    private String headline;

    @Size(max = 2000, message = "Giới thiệu tối đa 2000 ký tự")
    private String summary;

    @Size(max = 1000, message = "Kỹ năng tối đa 1000 ký tự")
    private String skills;

    @Size(max = 1000, message = "Học vấn tối đa 1000 ký tự")
    private String education;

    @Size(max = 2000, message = "Kinh nghiệm tối đa 2000 ký tự")
    private String experience;
}