export const feedKeys = {
  feed: (page: number) => ['feed', page] as const,
  trending: (page: number) => ['trending', page] as const,
  comments: (postId: number) => ['comments', postId] as const,
}
