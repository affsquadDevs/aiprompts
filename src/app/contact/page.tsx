import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { buildMetadata, SITE_NAME, SITE_CONTACT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME} team — questions, feedback, privacy requests and content-removal (takedown) enquiries.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 pb-28">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Contact
      </h1>

      <div className="space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          {SITE_NAME} is run by a small team. We read every message and aim to
          reply within a few business days. Reach us by email for any of the
          following:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Questions, feedback or suggestions about the prompt library</li>
          <li>Privacy requests or questions about how we use cookies and ads</li>
          <li>
            Copyright or content-removal (takedown) requests — please include the
            page URL and details
          </li>
          <li>Partnership, advertising or press enquiries</li>
        </ul>
      </div>

      <a
        href={`mailto:${SITE_CONTACT_EMAIL}`}
        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        <Mail className="h-4 w-4" />
        {SITE_CONTACT_EMAIL}
      </a>
    </main>
  );
}
