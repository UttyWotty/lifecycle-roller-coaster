/**
 * Domain errors raised while extracting events from a story.
 * Each error carries only a stable code, so story text and provider detail cannot leak through it.
 * This module is pure and shared by the extractor adapters and the request handler.
 */

export type ExtractionErrorCode =
  | "refused"
  | "truncated"
  | "not_configured"
  | "rate_limited"
  | "provider_failed";

export class ExtractionError extends Error {
  readonly code: ExtractionErrorCode;

  constructor(code: ExtractionErrorCode) {
    super(code);
    this.name = "ExtractionError";
    this.code = code;
  }
}
