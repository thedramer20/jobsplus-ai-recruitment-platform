package com.jobplus.dto.request;

import lombok.Data;

@Data
public class UpdateUserDTO {
    private String name;
    private String headline;
    private String avatarUrl;
    private String location;
}
