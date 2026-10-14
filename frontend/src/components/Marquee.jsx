export default function Marquee({ items }) {
  const row = (hidden) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-8 font-display text-2xl font-light text-ink/60 sm:text-3xl">
            {t}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-hairline py-6" data-testid="editorial-marquee">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
