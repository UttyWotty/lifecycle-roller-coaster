/**
 * Shared shapes for the story-level insights: life chapters and the fun life report.
 * Like events, they are the contract between AI and rendering, so sample lives can supply them too.
 * This module holds schemas and types only.
 */
import { z } from "zod";

export const lifeChapterSchema = z.object({
  title: z.string().min(1),
  eventIds: z.array(z.string().min(1)),
});

export const lifeReportSchema = z.object({
  headline: z.string().min(1),
  highlights: z.array(z.string().min(1)),
});

export type LifeChapter = z.infer<typeof lifeChapterSchema>;
export type LifeReport = z.infer<typeof lifeReportSchema>;
