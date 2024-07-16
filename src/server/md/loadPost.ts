import { readFileSync } from "fs";
import matter from "gray-matter";

export const loadPost = (postString: string) => {
  const post = matter(
    readFileSync(
      `src/posts/${postString.endsWith(".md") ? postString : `${postString}.md`}`,
      "utf8",
    ),
  );

  return {
    ...post,
    data: {
      ...post.data,
      published: new Date(post.data.published as string),
    } as { title: string; published: Date },
  };
};
