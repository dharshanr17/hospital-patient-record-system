package com.hprs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDto {

    private Long departmentId;
    private Long hospitalId;
    private String hospitalName;
    private String name;
}
