export type Medium = "text" | "image" | "video" | "audio" | "3d";

export type Category = {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  packCount: number;
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
};

export type PackSource = {
  name: string;
  url: string;
  license: string;
} | null;

/** Lightweight pack record used in listings/search (no prompt bodies). */
export type PackSummary = {
  id: string;
  title: string;
  subtitle: string;
  categoryId: string;
  categoryName: string;
  medium: Medium;
  models: string[];
  tags: string[];
  promptCount: number;
  popularity: number;
};

/** Full pack record including every prompt. */
export type Pack = PackSummary & {
  description: string;
  source: PackSource;
  prompts: Prompt[];
};

export type CatalogMeta = {
  generatedFrom: string[];
  realPrompts: number;
  packCount: number;
  promptCount: number;
};
