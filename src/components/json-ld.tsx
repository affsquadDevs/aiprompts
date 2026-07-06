/**
 * Renders a schema.org JSON-LD <script> block. Server component — safe to drop
 * into any page or layout. Pass a plain object (or array) matching schema.org.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; we control the input shape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
