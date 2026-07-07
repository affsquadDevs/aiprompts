import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_NAME, SITE_CONTACT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: `The terms that govern your use of ${SITE_NAME}, a free, ad-supported AI prompt library.`,
  path: "/terms",
});

const UPDATED = "7 July 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 pb-28">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Terms of Use
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: {UPDATED}
        </p>
      </header>

      <div className="space-y-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        <Section title="Acceptance">
          <p>
            By accessing or using {SITE_NAME} (the &ldquo;site&rdquo;), you agree
            to these Terms of Use and our{" "}
            <Link
              href="/privacy"
              className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
            >
              Privacy Policy
            </Link>
            . If you do not agree, please do not use the site.
          </p>
        </Section>

        <Section title="The service">
          <p>
            {SITE_NAME} is a free, ad-supported library of AI prompt templates
            provided for informational and productivity purposes. The site is
            offered on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            basis and may change or be discontinued at any time.
          </p>
        </Section>

        <Section title="Prompt content and licenses">
          <p>
            The catalog combines prompts from openly-licensed public collections
            (used under their respective CC0 / MIT licenses, with attribution
            shown on each pack where applicable) and original playbook content
            created for this site. You are free to copy, adapt and use the
            prompts, including for commercial projects. Where a pack lists an
            original source and license, please honor that license.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              scrape, bulk-download or republish the catalog in a way that
              competes with or duplicates the site;
            </li>
            <li>
              use the site to break the law or to generate content that is
              harmful, deceptive, or infringes others&rsquo; rights;
            </li>
            <li>
              interfere with the site&rsquo;s operation or its advertising, or
              attempt to generate invalid ad activity.
            </li>
          </ul>
        </Section>

        <Section title="No professional advice">
          <p>
            Prompts and any AI-generated output are not a substitute for
            professional judgment. Nothing on this site constitutes legal,
            medical, financial or other professional advice. AI models can
            produce inaccurate or misleading output — always review and verify
            before relying on it.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            The {SITE_NAME} name, design, layout and original playbook content
            are protected by intellectual-property rights. Product and company
            names (including ChatGPT, Claude, Gemini and Midjourney) are
            trademarks of their respective owners; {SITE_NAME} is not affiliated
            with or endorsed by them.
          </p>
        </Section>

        <Section title="Disclaimer and limitation of liability">
          <p>
            To the maximum extent permitted by law, we disclaim all warranties,
            express or implied, and will not be liable for any indirect,
            incidental or consequential damages arising from your use of the
            site or reliance on any prompt or AI output.
          </p>
        </Section>

        <Section title="Third-party links and ads">
          <p>
            The site contains advertising and may link to third-party sites. We
            are not responsible for the content, products or practices of those
            third parties.
          </p>
        </Section>

        <Section title="Copyright / takedown">
          <p>
            If you believe content on this site infringes your rights or was
            included from a source in error, contact us at{" "}
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
            >
              {SITE_CONTACT_EMAIL}
            </a>{" "}
            and we will review and, where appropriate, remove it promptly.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these Terms from time to time. Continued use of the
            site after changes take effect constitutes acceptance of the revised
            Terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
            >
              {SITE_CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {children}
    </section>
  );
}
