import Reveal, { MaskedLines } from "@/components/Reveal";

export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <header className="border-b border-hairline pb-16 pt-40 sm:pb-20 sm:pt-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal y={16}>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-graphite">{eyebrow}</p>
        </Reveal>
        <MaskedLines
          lines={Array.isArray(title) ? title : [title]}
          className="mt-6 font-display text-2xl font-light leading-[1.15] tracking-tight text-ink sm:text-3xl lg:text-4xl"
          delay={0.1}
        />
        {subtitle && (
          <Reveal delay={0.45}>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-graphite sm:text-lg">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
