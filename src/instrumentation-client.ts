/**
 * Browser start-up hook that turns on Vercel BotID for the story reader.
 * It attaches a challenge to every POST to /api/extract, which the server checks before spending any tokens.
 * It runs only in builds made on Vercel; elsewhere the challenge script does not exist and the server skips the check.
 */
import { initBotId } from "botid/client/core";

/** Set at build time in next.config.ts: "on" for Vercel builds, "off" everywhere else. */
const BOT_PROTECTION_ON = "on";

if (process.env.NEXT_PUBLIC_BOT_PROTECTION === BOT_PROTECTION_ON) {
  initBotId({ protect: [{ path: "/api/extract", method: "POST" }] });
}
