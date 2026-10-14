export const LOGO_URL = "/photos/logo.jpg";

export const LogoMark = ({ className = "h-10 w-10" }) => (
  <img
    src={LOGO_URL}
    alt="Psycholog sportu — logo"
    className={`${className} rounded-sm object-cover`}
    data-testid="logo-mark"
  />
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
        <span
          className="block whitespace-nowrap text-[1.8rem] leading-tight text-ink"
          style={{ fontFamily: "'Sacramento', cursive" }}
        >
          {content.siteName}
        </span>
        <span className="mt-1 block whitespace-nowrap text-[13px] font-semibold tracking-wide text-ink">
          {(content.siteSuffix || "").charAt(0).toUpperCase() + (content.siteSuffix || "").slice(1)}
        </span>
        <span className="mt-0.5 block whitespace-nowrap text-[8px] uppercase tracking-[0.28em] text-graphite">
          {content.tagline}
        </span>
      </span>
    </span>
  );
}
