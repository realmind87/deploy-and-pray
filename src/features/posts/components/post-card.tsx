import Link from "next/link";
import { formatRelativeTime } from "@/lib/time";
import type { PostListItem } from "@/features/posts/queries";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { resolveAvatarPublicUrl } from "@/lib/storage-url";

type PostCardProps = {
  post: PostListItem;
};

/** 글 목록 카드 — 제목, 메타 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-zinc-200 py-4 dark:border-zinc-800">
      <div className="min-w-0 px-2">
        <div className="mb-2 flex items-center gap-1.5">
          <ProfileAvatar
            name={post.author.username}
            avatarUrl={resolveAvatarPublicUrl(post.author.avatarUrl)}
            size="xs"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{post.author.username}</span>
        </div>

        <div className="flex justify-between gap-1">
          <Link
            href={`/posts/${post.id}`}
            className="block font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {post.title}
          </Link>

        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.createdAt.toISOString()}>{formatRelativeTime(post.createdAt)}</time>
          <span className="mx-1">·</span>
          <span>조회 {post.viewCount}</span>
          <span className="mx-1">·</span>
          <span>좋아요 {post.likeCount}</span>
          <span className="mx-1">·</span>
          <span>댓글 {post.commentCount}</span>
        </p>
      </div>
    </article>
  );
}
