import { Link } from "react-router-dom";
import type { Post } from "@/features/posts/types/post.types";

interface PostContextProps {
  post: Post;
  showFullContent?: boolean;
  postDetailPath?: string;
}

function containsHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

function getPlainText(content: string): string {
  if (!containsHtml(content)) {
    return content;
  }
  const parsedDocument = new DOMParser().parseFromString(content, "text/html");
  return parsedDocument.body.textContent || "";
}

export default function PostContext({
  post,
  showFullContent = false,
  postDetailPath,
}: PostContextProps) {
  const tags = post.tags ?? [];
  const content = post.content?.trim() || post.excerpt?.trim() || "";

  const isHtml = containsHtml(content);
  const plainText = getPlainText(content).trim();

  const previewLimit = 280;
  const isLongPreview = plainText.length > previewLimit;

  const displayedText =
    !showFullContent && isLongPreview
      ? `${plainText.slice(0, previewLimit).trimEnd()}…`
      : plainText;

  const contentStyles =
    "[&_a]:font-medium [&_a]:text-orange-500 [&_a]:underline " +
    "[&_a]:underline-offset-2 [&_a:hover]:text-orange-600 " +
    "[&_blockquote]:border-l-2 [&_blockquote]:border-orange-200 " +
    "[&_blockquote]:pl-4 [&_ol]:list-decimal [&_ol]:pl-5 " +
    "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:max-w-full " +
    "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#161312] " +
    "[&_pre]:text-stone-300 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 " +
    "dark:[&_a]:text-orange-400 dark:[&_blockquote]:border-orange-900/50 ";

  return (
    <section className="min-w-0">
      {post.title && (
        <h2 className="break-words text-xl font-bold leading-snug text-[#0B192C] dark:text-white">
          {postDetailPath ? (
            <Link
              to={postDetailPath}
              className="transition-colors hover:text-orange-500 dark:hover:text-orange-400"
            >
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h2>
      )}

      {post.subtitle && (
        <p className="mt-2 break-words text-base leading-6 text-stone-600 dark:text-stone-400">
          {post.subtitle}
        </p>
      )}

      {content && (
        <div className="mt-3 break-words text-sm leading-7 text-stone-700 dark:text-stone-300">
          {showFullContent && isHtml ? (
            <div
              className={contentStyles}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{displayedText}</p>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400"
            >
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      )}

      {/* Read full post - Removed box/ring, only text hover effect */}
      {postDetailPath && (
        <Link
          to={postDetailPath}
          className="mt-3 inline-block text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
        >
          Read full post →
        </Link>
      )}
    </section>
  );
}