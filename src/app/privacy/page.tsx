import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_NAME, SITE_CONTACT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles cookies, advertising and your data. We use Google AdSense; this page explains what is collected and how to control it.`,
  path: "/privacy",
});

const UPDATED = "7 July 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 pb-28">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: {UPDATED}
        </p>
      </header>

      <div className="space-y-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;) collects, uses and shares information when you visit
          this website. {SITE_NAME} is a free, ad-supported library of AI prompt
          packs. We do not sell products, and you do not need an account to use
          the site.
        </p>

        <Section title="Information we collect">
          <p>
            <strong>Information you provide.</strong> The site has no accounts,
            sign-up or checkout, so we do not ask for your name, email or payment
            details. If you email us, we receive whatever you choose to send.
          </p>
          <p className="mt-3">
            <strong>Information collected automatically.</strong> Like most
            websites, our hosting provider and our advertising partner may log
            standard technical data such as your IP address, browser type,
            device, referring page and the pages you view. We store a small
            amount of data in your browser&rsquo;s local storage to remember your
            theme (light/dark) preference and your cookie-consent choice.
          </p>
        </Section>

        <Section title="Cookies and similar technologies">
          <p>
            We and our advertising partner use cookies and similar technologies
            (including browser local storage) to keep the site working, remember
            your preferences, and — with your consent where required — to serve
            and measure advertising. You can control or delete cookies through
            your browser settings; doing so may affect ad relevance but not your
            access to the content.
          </p>
        </Section>

        <Section title="Advertising (Google AdSense)">
          <p>
            This site is supported by advertising served through{" "}
            <strong>Google AdSense</strong>.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on your prior visits to this and other websites.
            </li>
            <li>
              Google&rsquo;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visits. You can opt out
              of personalized advertising by visiting{" "}
              <ExtLink href="https://www.google.com/settings/ads">
                Google Ads Settings
              </ExtLink>
              .
            </li>
            <li>
              You can opt out of a third-party vendor&rsquo;s use of cookies for
              personalized advertising at{" "}
              <ExtLink href="https://www.aboutads.info/choices/">
                aboutads.info/choices
              </ExtLink>{" "}
              and, in Europe,{" "}
              <ExtLink href="https://www.youronlinechoices.eu/">
                youronlinechoices.eu
              </ExtLink>
              .
            </li>
            <li>
              For more detail, see{" "}
              <ExtLink href="https://policies.google.com/technologies/partner-sites">
                How Google uses information from sites or apps that use our
                services
              </ExtLink>
              .
            </li>
          </ul>
        </Section>

        <Section title="Your consent choices">
          <p>
            When you first visit, we show a consent banner. For visitors in the
            European Economic Area, the United Kingdom and Switzerland,
            advertising and analytics storage is set to <em>denied</em> by
            default until you choose. If you select &ldquo;Reject
            non-essential&rdquo;, ads may still appear but are non-personalized.
            You can change your choice at any time by clearing this site&rsquo;s
            data in your browser, which will make the banner appear again.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Depending on where you live, you may have rights under laws such as
            the EU/UK <strong>GDPR</strong> or the California{" "}
            <strong>CCPA/CPRA</strong>, including the right to access, correct or
            delete personal data, and to opt out of the &ldquo;sale&rdquo; or
            &ldquo;sharing&rdquo; of personal information for targeted
            advertising. Because we do not maintain accounts, most requests
            relate to advertising cookies, which you can control using the opt-out
            links above or by contacting us.
          </p>
        </Section>

        <Section title="Data retention and security">
          <p>
            We do not maintain a database of personal information about visitors.
            Server logs and advertising data are retained by our hosting and
            advertising providers according to their own policies. We apply
            reasonable technical measures (including HTTPS) to protect the site.
          </p>
        </Section>

        <Section title="Children's privacy">
          <p>
            This site is intended for a general, adult audience and is not
            directed to children under 13 (or the equivalent minimum age in your
            country). We do not knowingly collect personal information from
            children.
          </p>
        </Section>

        <Section title="International visitors">
          <p>
            The site may be operated from, and data processed in, countries other
            than yours. By using the site you understand that your information may
            be processed in those countries.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be
            reflected by updating the &ldquo;Last updated&rdquo; date above.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data? Email{" "}
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
            >
              {SITE_CONTACT_EMAIL}
            </a>{" "}
            or use our{" "}
            <Link
              href="/contact"
              className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
            >
              contact page
            </Link>
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

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
    >
      {children}
    </a>
  );
}
