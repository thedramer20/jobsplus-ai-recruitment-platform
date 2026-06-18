package com.jobplus.controller;

import com.jobplus.dto.request.CreatePostDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostCommentDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.service.PostService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<PostResponseDTO>>> getByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = null;
        try { currentUserId = SecurityUtil.getCurrentUserId(); } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success(
                postService.getByUser(userId, currentUserId, page, size)));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<PostResponseDTO>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                postService.getFeed(SecurityUtil.getCurrentUserId(), page, size)));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<PostResponseDTO>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                postService.getTrending(SecurityUtil.getCurrentUserId(), page, size)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PostResponseDTO>> create(
            @Valid @RequestBody CreatePostDTO dto) {
        return ResponseEntity.status(201).body(
                ApiResponse.success(postService.create(dto, SecurityUtil.getCurrentUserId()), "Post created"));
    }

    @PostMapping("/media")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.success(postService.uploadMedia(SecurityUtil.getCurrentUserId(), file), "Media uploaded"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        postService.delete(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> like(@PathVariable Long id) {
        postService.like(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Liked"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlike(@PathVariable Long id) {
        postService.unlike(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Unliked"));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<PostCommentDTO>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(postService.getComments(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<PostCommentDTO>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(201).body(
                ApiResponse.success(
                        postService.addComment(id, body.get("content"), SecurityUtil.getCurrentUserId()),
                        "Comment added"));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId) {
        postService.deleteComment(commentId, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }
}
