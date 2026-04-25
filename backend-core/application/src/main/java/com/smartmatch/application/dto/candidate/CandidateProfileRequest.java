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

    private Long id;

    @NotBlank(message = "Tên hồ sơ không được để trống")
    @Size(max = 50, message = "Tên hồ sơ tối đa 50 ký tự")
    private String profileName;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Size(max = 200, message = "Headline tối đa 200 ký tự")
    private String headline;

    private String sections;
}