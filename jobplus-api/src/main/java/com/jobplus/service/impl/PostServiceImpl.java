package com.jobplus.service.impl;

import com.jobplus.dto.request.CreatePostDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostCommentDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.PostMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Post;
import com.jobplus.model.PostComment;
import com.jobplus.model.User;
import com.jobplus.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of("video/mp4", "video/webm", "video/quicktime");
    private static final long MAX_IMAGE_BYTES = 5 * 1024 * 1024L;
    private static final long MAX_VIDEO_BYTES = 25 * 1024 * 1024L;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.base-url}")
    private String uploadBaseUrl;

    private final PostMapper postMapper;
    private final UserMapper userMapper;

    @Override
    public PaginatedResponseDTO<PostResponseDTO> getFeed(Long userId, int page, int size) {
        int offset = page * size;
        List<Post> posts = postMapper.findFeedForUser(userId, size, offset);
        List<PostResponseDTO> content = posts.stream()
                .map(p -> toDTO(p, userId))
                .collect(Collectors.toList());
        return buildPage(content, page, size, offset);
    }

    @Override
    public PaginatedResponseDTO<PostResponseDTO> getTrending(Long userId, int page, int size) {
        int offset = page * size;
        List<Post> posts = postMapper.findTrending(size, offset);
        List<PostResponseDTO> content = posts.stream()
                .map(p -> toDTO(p, userId))
                .collect(Collectors.toList());
        return buildPage(content, page, size, offset);
    }

    @Override
    public PaginatedResponseDTO<PostResponseDTO> getByUser(Long profileUserId, Long currentUserId, int page, int size) {
        int offset = page * size;
        List<Post> posts = postMapper.findByUserId(profileUserId, size, offset);
        List<PostResponseDTO> content = posts.stream()
                .map(p -> toDTO(p, currentUserId))
                .collect(Collectors.toList());
        return buildPage(content, page, size, offset);
    }

    @Override
    @Transactional
    public PostResponseDTO create(CreatePostDTO dto, Long authorId) {
        String content = dto.getContent() == null ? "" : dto.getContent().trim();
        if (content.isEmpty() && (dto.getMediaUrl() == null || dto.getMediaUrl().isBlank())) {
            throw new ValidationException("Please add text or attach a photo or video");
        }

        Post post = Post.builder()
                .authorId(authorId)
                .content(content)
                .mediaUrl(dto.getMediaUrl())
                .build();
        postMapper.insert(post);
        log.info("User {} created post {}", authorId, post.getId());
        return toDTO(postMapper.findById(post.getId()), authorId);
    }

    @Override
    @Transactional
    public String uploadMedia(Long authorId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ValidationException("No file provided");

        String contentType = file.getContentType();
        boolean isImage = ALLOWED_IMAGE_TYPES.contains(contentType);
        boolean isVideo = ALLOWED_VIDEO_TYPES.contains(contentType);

        if (!isImage && !isVideo) {
            throw new ValidationException("Only JPG, PNG, WEBP, MP4, MOV, and WEBM files are allowed");
        }

        long maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (file.getSize() > maxBytes) {
            throw new ValidationException(isVideo
                    ? "Video exceeds the 25 MB limit"
                    : "Image exceeds the 5 MB limit");
        }

        try {
            Path dir = Paths.get(uploadPath).toAbsolutePath();
            Files.createDirectories(dir);

            String extension = mediaExtension(contentType);
            String prefix = isVideo ? "post_video_" : "post_image_";
            String filename = prefix + authorId + "_" + System.currentTimeMillis() + "." + extension;
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());

            String mediaUrl = uploadBaseUrl.stripTrailing() + "/" + filename;
            log.info("Post media uploaded for user {}: {}", authorId, mediaUrl);
            return mediaUrl;
        } catch (IOException e) {
            log.error("Post media upload failed for user {}", authorId, e);
            throw new RuntimeException("Failed to save post media", e);
        }
    }

    @Override
    @Transactional
    public void delete(Long id, Long currentUserId) {
        Post post = postMapper.findById(id);
        if (post == null) throw new ResourceNotFoundException("Post not found: " + id);
        if (!post.getAuthorId().equals(currentUserId))
            throw new ForbiddenException("Not your post");
        postMapper.deleteById(id, currentUserId);
        log.info("User {} deleted post {}", currentUserId, id);
    }

    @Override
    @Transactional
    public void like(Long postId, Long userId) {
        try {
            int rows = postMapper.insertLike(userId, postId);
            if (rows > 0) {
                postMapper.incrementLikeCount(postId);
            }
        } catch (DataIntegrityViolationException e) {
            // already liked — ignore
            log.debug("User {} already liked post {}", userId, postId);
        }
    }

    @Override
    @Transactional
    public void unlike(Long postId, Long userId) {
        int rows = postMapper.deleteLike(userId, postId);
        if (rows > 0) {
            postMapper.decrementLikeCount(postId);
        }
    }

    @Override
    public List<PostCommentDTO> getComments(Long postId) {
        return postMapper.findCommentsByPostId(postId).stream()
                .map(c -> toCommentDTO(c))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostCommentDTO addComment(Long postId, String content, Long authorId) {
        PostComment comment = PostComment.builder()
                .postId(postId)
                .authorId(authorId)
                .content(content)
                .build();
        postMapper.insertComment(comment);
        postMapper.incrementCommentCount(postId);
        log.info("User {} commented on post {}", authorId, postId);
        // Re-fetch to get DB-generated timestamps
        PostComment saved = postMapper.findCommentById(comment.getId());
        return toCommentDTO(saved != null ? saved : comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        PostComment comment = postMapper.findCommentById(commentId);
        if (comment == null) throw new ResourceNotFoundException("Comment not found: " + commentId);
        if (!comment.getAuthorId().equals(currentUserId))
            throw new ForbiddenException("Not your comment");
        postMapper.deleteComment(commentId, currentUserId);
        postMapper.decrementCommentCount(comment.getPostId());
        log.info("User {} deleted comment {}", currentUserId, commentId);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private PostResponseDTO toDTO(Post post, Long currentUserId) {
        User author = userMapper.findById(post.getAuthorId());
        UserResponseDTO authorDTO = author != null ? UserResponseDTO.fromUser(author) : null;
        boolean liked = currentUserId != null && postMapper.isLiked(currentUserId, post.getId());
        return PostResponseDTO.builder()
                .id(post.getId())
                .author(authorDTO)
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(liked)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
                .build();
    }

    private PostCommentDTO toCommentDTO(PostComment c) {
        User author = userMapper.findById(c.getAuthorId());
        UserResponseDTO authorDTO = author != null ? UserResponseDTO.fromUser(author) : null;
        return PostCommentDTO.builder()
                .id(c.getId())
                .author(authorDTO)
                .content(c.getContent())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .build();
    }

    private static <T> PaginatedResponseDTO<T> buildPage(List<T> content, int page, int size, int offset) {
        // For infinite-scroll feeds we don't run a COUNT query.
        // totalElements encodes "at least this many exist"; frontend uses content.size() < size to detect last page.
        long totalElements = (long) offset + content.size();
        int totalPages = content.size() < size ? page + 1 : page + 2;
        return PaginatedResponseDTO.<T>builder()
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private static String mediaExtension(String contentType) {
        if (contentType == null) return "bin";
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "video/mp4" -> "mp4";
            case "video/webm" -> "webm";
            case "video/quicktime" -> "mov";
            default -> "jpg";
        };
    }
}
