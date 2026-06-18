package com.jobplus.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    private Long          id;
    private Long          authorId;
    private String        content;
    private String        mediaUrl;
    private int           likeCount;
    private int           commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
