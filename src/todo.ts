import dotenv from "dotenv";
import { AtpAgent } from "@atproto/api";
import {
  isThreadViewPost,
  type PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import type { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post.js";

export const getTodo = async (): Promise<string[]> => {
  dotenv.config();
  const handle = process.env.APP_HANDLE;
  const password = process.env.APP_PASSWORD;
  if (!handle || !password) {
    console.log("invalid handle or password");
    return [];
  }

  const agent = new AtpAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: handle, password });

  const startTrigger = "TODO";
  const replyTrigger = "DONE";

  if (!agent.did) {
    return [];
  }

  const searchResponse = await agent.app.bsky.feed.searchPosts({
    q: startTrigger,
    author: agent.did,
    limit: 100,
  });
  if (!searchResponse.success) {
    return [];
  }
  const posts = searchResponse.data.posts;

  // TODO: テスト書く
  const filterPost = async (post: PostView): Promise<boolean> => {
    const record = post.record as Record;

    if (!record.text.toLowerCase().startsWith(startTrigger.toLowerCase())) {
      return false;
    }

    if (post.replyCount === 0) {
      return true;
    }

    const threadResponse = await agent.app.bsky.feed.getPostThread({
      uri: post.uri,
    });
    if (!isThreadViewPost(threadResponse.data.thread)) {
      return false;
    }

    const replies = (threadResponse.data.thread.replies ?? []).filter((r) =>
      isThreadViewPost(r)
    );
    return !!replies.find((r) => {
      const record = r.post.record as Record;
      const result = record.text
        .toLowerCase()
        .startsWith(replyTrigger.toLowerCase());
      return result;
    });
  };

  const filtered = (
    await Promise.all(
      posts.map(async (p) => ((await filterPost(p)) ? p : null))
    )
  ).filter((p) => p !== null);

  return filtered.map((a) => a.uri);
};