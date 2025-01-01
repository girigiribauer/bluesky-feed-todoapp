import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getTodo } from "./todo.js";
import { validateAuth } from "./validate.js";

const app = new Hono();

app.get("/", (c) =>
  c.text(
    "TODOフィードです https://github.com/girigiribauer/bluesky-feed-todoapp"
  )
);

app.get("/.well-known/did.json", (c) => {
  const tmp = JSON.stringify(c.req, null, 2);
  console.log(tmp);
  const tmp2 = JSON.stringify(c.req.header(), null, 2);
  console.log(tmp2);
  const tmp3 = JSON.stringify(c.req.query(), null, 2);
  console.log(tmp3);

  return c.json({
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: "did:web:todoapp.bsky.girigiribauer.com",
    service: [
      {
        id: "#bsky_fg",
        type: "BskyFeedGenerator",
        serviceEndpoint: "https://todoapp.bsky.girigiribauer.com",
      },
    ],
  });
});

app.get("/xrpc/app.bsky.feed.getFeedSkeleton", async (c) => {
  const tmp = JSON.stringify(c.req, null, 2);
  console.log(tmp);
  const tmp2 = JSON.stringify(c.req.header(), null, 2);
  console.log(tmp2);
  const tmp3 = JSON.stringify(c.req.query(), null, 2);
  console.log(tmp3);

  const did = await validateAuth(c, "did:web:todoapp.bsky.girigiribauer.com");
  const todoPosts = await getTodo(did);

  return c.json({
    feed: todoPosts.map((uri) => ({
      post: uri,
    })),
  });
});

const port = parseInt(process.env.PORT ?? "", 10) || 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
