import dotenv from "dotenv";
import { AtpAgent } from "@atproto/api";

(async () => {
  dotenv.config();
  const handle = process.env.APP_HANDLE;
  const password = process.env.APP_PASSWORD;
  if (!handle || !password) {
    console.log("invalid handle or password");
    return;
  }

  const agent = new AtpAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: handle, password });

  console.log(`login by ${handle}`);

  await agent.com.atproto.repo.putRecord({
    repo: agent.session?.did ?? "",
    collection: "app.bsky.feed.generator",
    rkey: "todoapp",
    record: {
      did: "did:web:todoapp.bsky.girigiribauer.com",
      displayName: "TODO feed",
      description:
        "TODO と頭につけた自分の投稿だけが表示されます\nDONE と返信すると消えます（テスト中）",
      createdAt: new Date().toISOString(),
    },
  });

  console.log("publish");
})();
