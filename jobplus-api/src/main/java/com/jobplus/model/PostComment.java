package com.jobplus.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostComment {
    private Long          id;
    private Long          postId;
    private Long          authorId;
    private String        content;
    private LocalDateTime createdAt;
}
