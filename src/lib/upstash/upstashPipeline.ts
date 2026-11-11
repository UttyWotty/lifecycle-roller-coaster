/**
 * Sends a batch of Redis commands to Upstash's REST pipeline in one request and returns each command's reply.
 * The limit counters and the feedback list both use it, so the request, the timeout and the checks live in one place.
 * Any network, auth or reply-shape problem becomes UpstashError, which each store turns into its own error.
 */

export interface UpstashSettings {
  url: string;
  token: string;
}

export interface PipelineReply {
  result?: unknown;
  error?: string;
}

export class UpstashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstashError";
  }
}

const PIPELINE_PATH = "/pipeline";
/** A slow store must not hold a request open; past this the request is refused instead. */
const STORE_TIMEOUT_MS = 3000;

export async function runPipeline({ url, token }: UpstashSettings, commands: readonly (readonly string[])[]): Promise<PipelineReply[]> {
  const endpoint = `${url.replace(/\/+$/, "")}${PIPELINE_PATH}`;
  let replies: unknown;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new UpstashError(`Store answered ${response.status}`);
    }
    replies = await response.json();
  } catch (error) {
    throw error instanceof UpstashError ? error : new UpstashError("Store unreachable");
  }
  if (!Array.isArray(replies) || replies.length !== commands.length) {
    throw new UpstashError("Store sent an unexpected reply");
  }
  return replies as PipelineReply[];
}
