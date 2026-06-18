package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostCommentDTO {
    private Long            id;
    private UserResponseDTO author;
    private String          content;
    private String          createdAt;
}
