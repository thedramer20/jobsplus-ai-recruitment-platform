package com.jobplus.service;

import com.jobplus.dto.request.CreatePostDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostCommentDTO;
import com.jobplus.dto.response.PostResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    PaginatedResponseDTO<PostResponseDTO> getFeed(Long userId, int page, int size);

    PaginatedResponseDTO<PostResponseDTO> getByUser(Long profileUserId, Long currentUserId, int page, int size);

    PaginatedResponseDTO<PostResponseDTO> getTrending(Long userId, int page, int size);

    PostResponseDTO create(CreatePostDTO dto, Long authorId);

    String uploadMedia(Long authorId, MultipartFile file);

    void delete(Long id, Long currentUserId);

    void like(Long postId, Long userId);

    void unlike(Long postId, Long userId);

    List<PostCommentDTO> getComments(Long postId);

    PostCommentDTO addComment(Long postId, String content, Long authorId);

    void deleteComment(Long commentId, Long currentUserId);
}
