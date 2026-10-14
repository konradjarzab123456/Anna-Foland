import { useState } from "react";
import { Mail, Facebook, Instagram, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";
import { serviceOptions } from "@/content/defaultContent";
import api, { formatApiError } from "@/lib/api";

export default function Contact() {
  const { content } = useSite();
  const c = content.contact;
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: serviceOptions[0], message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Zapytanie wysłane. Odezwię się w ciągu 24 godzin.");
      setForm({ name: "", email: "", phone: "", service: serviceOptions[0], message: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "mt-3 w-full border-b border-hairline bg-transparent py-3.5 text-ink outline-none transition-colors placeholder:text-steel focus:border-ink";
  const labelCls = "block";
  const labelSpan = "font-mono text-[11px] uppercase tracking-[0.2em] text-graphite";

  return (
    <main>
      <PageHeader eyebrow={c.eyebrow} title={c.title} />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Info */}
          <div className="lg:col-span-4">
            <Reveal>
              <div className="space-y-10" data-testid="contact-info">
                <div className="flex gap-5" data-testid="contact-info-email">
                  <Mail size={18} className="mt-1 shrink-0 text-gold" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">E-mail</p>
                    <a href={`mailto:${c.email || ""}`} className="link-underline mt-2 inline-block text-ink">
                      {c.email}
                    </a>
                  </div>
                </div>

                <a
                  href={c.booksy || "#"}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="contact-booksy-button"
                  className="group flex flex-col border border-hairline bg-white p-6 transition-all duration-300 hover:border-ink"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Rezerwacja terminów</span>
                    <CalendarCheck size={20} className="text-gold transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className="mt-2 block font-display text-2xl font-light text-ink">Zapis przez Booksy</span>
                  <span
                    data-testid="contact-consultation-button"
                    className="mt-5 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors group-hover:bg-[#1F2937]"
                  >
                    Umów konsultację
                  </span>
                </a>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Social media</p>
                  <div className="mt-4 flex items-center gap-3" data-testid="contact-socials">
                    <a
                      href={c.facebook || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      data-testid="contact-facebook-link"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-graphite transition-colors hover:border-ink hover:text-ink"
                    >
                      <Facebook size={17} />
                    </a>
                    <a
                      href={c.instagram || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      data-testid="contact-instagram-link"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-graphite transition-colors hover:border-ink hover:text-ink"
                    >
                      <Instagram size={17} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <Reveal delay={0.15}>
              <form onSubmit={submit} data-testid="contact-full-form">
                <div className="grid gap-8 sm:grid-cols-2">
                  <label className={labelCls}>
                    <span className={labelSpan}>Imię i nazwisko *</span>
                    <input
                      data-testid="contact-name-input"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jan Kowalski"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    <span className={labelSpan}>Adres e-mail *</span>
                    <input
                      data-testid="contact-email-input"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jan@example.com"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    <span className={labelSpan}>Telefon (opcjonalnie)</span>
                    <input
                      data-testid="contact-phone-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+48 600 000 000"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    <span className={labelSpan}>Zakres wsparcia</span>
                    <select
                      data-testid="contact-service-select"
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className={inputCls}
                    >
                      {serviceOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    <span className={labelSpan}>Wiadomość *</span>
                    <textarea
                      data-testid="contact-message-input"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Opisz krótko, w czym mogę pomóc: sport, cele, wyzwania…"
                      className={`${inputCls} resize-none`}
                    />
                  </label>
                </div>
                <button
                  data-testid="contact-submit-button"
                  disabled={sending}
                  className="mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-10 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937] disabled:opacity-50"
                >
                  {sending ? "Wysyłanie…" : "Wyślij zapytanie"}
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
