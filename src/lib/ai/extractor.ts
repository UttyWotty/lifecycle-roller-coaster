/**
 * Provider-agnostic interface for turning a story into draft events.
 * The request handler depends on this interface rather than on any AI vendor.
 * Adding a provider or a local model means writing a new implementation of it.
 */
import type { ExtractionDraft } from "./extraction";

export interface EventExtractor {
  extract(story: string, signal: AbortSignal): Promise<ExtractionDraft>;
}
