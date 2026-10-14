export const LOGO_URL =
  "https://customer-assets-agu9un31.emergentagent.net/job_website-tabs-app/artifacts/f692c7d781c09792_1000059810.jpg";

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
        <span className="block whitespace-nowrap font-display text-xl tracking-wide text-ink">
          {content.siteName}
        </span>
        <span className="mt-1 block whitespace-nowrap text-[8px] uppercase tracking-[0.28em] text-graphite">
          {content.siteSuffix}
        </span>
      </span>
    </span>
  );
}
