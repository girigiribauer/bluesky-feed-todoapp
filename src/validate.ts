import {
  AuthRequiredError,
  parseReqNsid,
  verifyJwt,
} from "@atproto/xrpc-server";
import { DidResolver, MemoryCache } from "@atproto/identity";
import type { Context } from "hono";
import type { IncomingMessage } from "http";
import { parseUrlNsid } from "@atproto/xrpc-server/dist/util.js";

export const validateAuth = async (
  c: Context,
  serviceDid: string
): Promise<string> => {
  const authorization = c.req.header("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    throw new AuthRequiredError();
  }

  const didCache = new MemoryCache();
  const didResolver = new DidResolver({
    plcUrl: "https://plc.directory",
    didCache,
  });

  const jwt = authorization.replace("Bearer ", "").trim();
  const nsid = parseUrlNsid(c.req.path);

  const parsed = await verifyJwt(jwt, serviceDid, nsid, async (did: string) => {
    return didResolver.resolveAtprotoKey(did);
  });
  return parsed.iss;
};
