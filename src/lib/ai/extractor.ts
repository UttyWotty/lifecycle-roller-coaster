/**
 * Provider-agnostic interface for turning a story into draft events.
 * The request handler depends on this interface rather than on any AI vendor.
 * Adding a provider or a local model means writing a new implementation of it.
 */
import type { TokenUsage } from "@/lib/limits/usageLimits";
import type { ExtractionDraft } from "./extraction";

/** Called once the provider has answered, with what the reading used, so spending can be counted. */
export type UsageReporter = (usage: TokenUsage) => void;

export interface EventExtractor {
  /** True when output is sample data rather than a real reading of the story. */
  readonly isDemo: boolean;
  /** onUsage is optional; extractors that cost nothing never call it. */
  extract(story: string, signal: AbortSignal, onUsage?: UsageReporter): Promise<ExtractionDraft>;
}
