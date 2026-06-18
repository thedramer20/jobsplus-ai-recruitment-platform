package com.jobplus.service;

import com.jobplus.dto.request.CreatePostDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.PostMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Post;
import com.jobplus.model.User;
import com.jobplus.service.impl.PostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock PostMapper postMapper;
    @Mock UserMapper userMapper;

    @InjectMocks PostServiceImpl postService;

    private static final Long AUTHOR_ID = 1L;
    private static final Long OTHER_USER_ID = 2L;
    private static final Long POST_ID = 100L;

    private User author;
    private Post existingPost;

    @BeforeEach
    void setUp() {
        author = User.builder().id(AUTHOR_ID).name("Alice").email("alice@example.com").build();

        existingPost = Post.builder()
                .id(POST_ID)
                .authorId(AUTHOR_ID)
                .content("Hello world")
                .likeCount(0)
                .commentCount(0)
                .build();
    }

    // ── create() ─────────────────────────────────────────────────────────────

    @Test
    void create_happyPath_insertsPostAndReturnsDTO() {
        CreatePostDTO dto = new CreatePostDTO();
        dto.setContent("Hello world");
        dto.setMediaUrl(null);

        // After insert (id set by MyBatis), findById returns the full record
        when(postMapper.findById(any())).thenReturn(existingPost);
        when(userMapper.findById(AUTHOR_ID)).thenReturn(author);
        when(postMapper.isLiked(AUTHOR_ID, POST_ID)).thenReturn(false);

        PostResponseDTO result = postService.create(dto, AUTHOR_ID);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello world");
        verify(postMapper, times(1)).insert(any(Post.class));
    }

    // ── delete() ─────────────────────────────────────────────────────────────

    @Test
    void delete_authorDeletesOwnPost_callsDeleteById() {
        when(postMapper.findById(POST_ID)).thenReturn(existingPost);

        postService.delete(POST_ID, AUTHOR_ID);

        verify(postMapper, times(1)).deleteById(POST_ID, AUTHOR_ID);
    }

    @Test
    void delete_postNotFound_throwsResourceNotFoundException() {
        when(postMapper.findById(POST_ID)).thenReturn(null);

        assertThatThrownBy(() -> postService.delete(POST_ID, AUTHOR_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(POST_ID.toString());

        verify(postMapper, never()).deleteById(anyLong(), anyLong());
    }

    @Test
    void delete_nonAuthorTriesToDelete_throwsForbiddenException() {
        when(postMapper.findById(POST_ID)).thenReturn(existingPost);

        assertThatThrownBy(() -> postService.delete(POST_ID, OTHER_USER_ID))
                .isInstanceOf(ForbiddenException.class);

        verify(postMapper, never()).deleteById(anyLong(), anyLong());
    }

    // ── like() ────────────────────────────────────────────────────────────────

    @Test
    void like_happyPath_insertsLikeRecordAndIncrementsCount() {
        when(postMapper.insertLike(AUTHOR_ID, POST_ID)).thenReturn(1);

        postService.like(POST_ID, AUTHOR_ID);

        verify(postMapper, times(1)).insertLike(AUTHOR_ID, POST_ID);
        verify(postMapper, times(1)).incrementLikeCount(POST_ID);
    }

    @Test
    void like_alreadyLiked_dataIntegrityViolationSwallowed_noIncrement() {
        // Simulates the unique constraint firing; impl swallows it silently
        when(postMapper.insertLike(AUTHOR_ID, POST_ID))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        // Should not throw; duplicate like is silently ignored
        postService.like(POST_ID, AUTHOR_ID);

        verify(postMapper, never()).incrementLikeCount(anyLong());
    }

    @Test
    void like_insertReturnsZeroRows_doesNotIncrementCount() {
        // insertLike returns 0 (no row affected for some reason)
        when(postMapper.insertLike(AUTHOR_ID, POST_ID)).thenReturn(0);

        postService.like(POST_ID, AUTHOR_ID);

        verify(postMapper, never()).incrementLikeCount(anyLong());
    }

    // ── unlike() ─────────────────────────────────────────────────────────────

    @Test
    void unlike_existingLike_deletesRecordAndDecrementsCount() {
        when(postMapper.deleteLike(AUTHOR_ID, POST_ID)).thenReturn(1);

        postService.unlike(POST_ID, AUTHOR_ID);

        verify(postMapper, times(1)).deleteLike(AUTHOR_ID, POST_ID);
        verify(postMapper, times(1)).decrementLikeCount(POST_ID);
    }

    @Test
    void unlike_likeDidNotExist_doesNotDecrementCount() {
        when(postMapper.deleteLike(AUTHOR_ID, POST_ID)).thenReturn(0);

        postService.unlike(POST_ID, AUTHOR_ID);

        verify(postMapper, never()).decrementLikeCount(anyLong());
    }
}
