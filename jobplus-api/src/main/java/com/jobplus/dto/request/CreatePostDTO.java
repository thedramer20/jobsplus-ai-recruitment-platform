package com.jobplus.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostDTO {

    @Size(max = 3000)
    private String content;

    private String mediaUrl;
}
