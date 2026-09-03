export interface PolicySection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

// Legal/policy text is meant to be read immediately, not scroll-revealed -
// Reveal's whileInView animation kept the long body text invisible until
// 20% of it scrolled into view, which on a tall page reads as "stuck
// loading". Render everything directly instead.
export default function PolicyPage({ title, sections }: { title: string; sections: PolicySection[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16" dir="rtl">
      <h1 className="font-playfair font-cairo text-3xl md:text-4xl font-bold text-center mb-12 text-gold-gradient">
        {title}
      </h1>
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 space-y-8 text-charcoal/80 leading-relaxed text-sm md:text-base">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h2 className="font-cairo font-bold text-lg text-charcoal mb-3">{section.heading}</h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mb-3 whitespace-pre-line">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pr-5 space-y-1.5 mt-2">
                {section.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
