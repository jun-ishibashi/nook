"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function PostViewTracker({ post }: { post: { id: string; title: string; thumbnail: string | null } }) {
  const { addPost } = useRecentlyViewed();

  useEffect(() => {
    addPost({
      id: post.id,
      title: post.title,
      thumbnail: post.thumbnail,
    });
  }, [addPost, post.id, post.title, post.thumbnail]);

  return null;
}
