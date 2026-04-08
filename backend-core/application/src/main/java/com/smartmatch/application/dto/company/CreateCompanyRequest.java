package com.smartmatch.application.dto.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompanyRequest {

    @NotBlank(message = "Tên công ty không được để trống")
    @Size(max = 150, message = "Tên công ty tối đa 150 ký tự")
    private String name;

    @Size(max = 3000, message = "Mô tả tối đa 3000 ký tự")
    private String description;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String address;

    @Size(max = 100, message = "Vị trí tối đa 100 ký tự")
    private String location;

    @Size(max = 150, message = "Website tối đa 150 ký tự")
    private String website;

    private String logoUrl;

    @Size(max = 100, message = "Ngành nghề tối đa 100 ký tự")
    private String industry;

    @Size(max = 50, message = "Quy mô tối đa 50 ký tự")
    private String companySize;
}