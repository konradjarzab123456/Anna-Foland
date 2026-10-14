import { Link } from "react-router-dom";
import { LogoMark } from "@/components/Logo";
import { useSite } from "@/context/SiteContext";
import Reveal from "@/components/Reveal";

const TABS = [
  { label: "Start", path: "/" },
  { label: "O firmie", path: "/o-firmie" },
  { label: "Oferta", path: "/oferta" },
  { label: "Realizacje", path: "/realizacje" },
  { label: "Kontakt", path: "/kontakt" },
];

export default function Footer() {
  const { content } = useSite();
  return (
    <footer className="bg-dark text-paper" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <Reveal>
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark />
                <span className="font-display text-3xl font-light">{content.siteName}</span>
              </div>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/60">{content.tagline}</p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {TABS.map((t) => (
                <Link
                  key={t.path}
                  to={t.path}
                  data-testid={`footer-link-${t.label.toLowerCase().replace(" ", "-")}`}
                  className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-paper/70 hover:text-paper"
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 border-t border-paper/10 pt-8 text-sm text-paper/60 sm:grid-cols-3">
          <p data-testid="footer-address">{content.contact.address}</p>
          <p data-testid="footer-contact">
            {content.contact.phone} · {content.contact.email}
          </p>
          <p className="sm:text-right" data-testid="footer-company">{content.contact.companyData}</p>
        </div>

        <p className="mt-8 text-xs text-paper/40" data-testid="footer-note">{content.footer.note}</p>
      </div>
    </footer>
  );
}
