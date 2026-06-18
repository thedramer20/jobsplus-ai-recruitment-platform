package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostResponseDTO {
    private Long            id;
    private UserResponseDTO author;
    private String          content;
    private String          mediaUrl;
    private int             likeCount;
    private int             commentCount;
    private boolean         likedByCurrentUser;
    private String          createdAt;
}
