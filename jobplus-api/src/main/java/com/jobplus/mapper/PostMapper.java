package com.jobplus.mapper;

import com.jobplus.model.Post;
import com.jobplus.model.PostComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostMapper {

    List<Post> findFeedForUser(@Param("userId") Long userId,
                               @Param("limit") int limit,
                               @Param("offset") int offset);

    List<Post> findByUserId(@Param("userId") Long userId,
                            @Param("limit") int limit,
                            @Param("offset") int offset);

    List<Post> findTrending(@Param("limit") int limit,
                            @Param("offset") int offset);

    Post findById(Long id);

    int insert(Post post);

    int deleteById(@Param("id") Long id, @Param("authorId") Long authorId);

    int insertLike(@Param("userId") Long userId, @Param("postId") Long postId);

    int deleteLike(@Param("userId") Long userId, @Param("postId") Long postId);

    boolean isLiked(@Param("userId") Long userId, @Param("postId") Long postId);

    int incrementLikeCount(Long id);

    int decrementLikeCount(Long id);

    int incrementCommentCount(Long id);

    int decrementCommentCount(Long id);

    List<PostComment> findCommentsByPostId(Long postId);

    int insertComment(PostComment comment);

    PostComment findCommentById(Long id);

    int deleteComment(@Param("id") Long id, @Param("authorId") Long authorId);
}
