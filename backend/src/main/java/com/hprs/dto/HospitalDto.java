package com.hprs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalDto {

    private Long hospitalId;
    private String name;
    private String address;
    private String phone;
    private String registrationNo;
    private Boolean active;
}
