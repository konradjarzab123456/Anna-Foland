export const LogoMark = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <rect width="36" height="36" rx="4" fill="#0A0D14" />
    <path d="M10 26V10L19 26V10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="square" />
    <path d="M26 10L20 18L26 26" stroke="#C5A059" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default function Logo({ content, onClick }) {
  return (
    <span
      className="flex cursor-pointer items-center gap-3"
      data-testid="logo-brand"
      onClick={onClick}
    >
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-2xl tracking-wide text-ink">{content.siteName}</span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.32em] text-graphite">
          {content.siteSuffix}
        </span>
      </span>
    </span>
  );
}
