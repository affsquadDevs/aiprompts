import { LandingView } from "@/components/landing-view";
import { LiquidPromptBar } from "@/components/liquid-prompt-bar";
import {
  getCategories,
  getFeaturedPacks,
  getMeta,
  getPacksAcrossCategories,
} from "@/data";

export default function Home() {
  const categories = getCategories();
  const featuredPacks = getFeaturedPacks(8);
  const spotlightPacks = getPacksAcrossCategories(1, 12);
  const meta = getMeta();

  return (
    <main className="min-w-0 flex-1">
      <LandingView
        categories={categories}
        featuredPacks={featuredPacks}
        spotlightPacks={spotlightPacks}
        meta={meta}
      />
      <LiquidPromptBar />
    </main>
  );
}
