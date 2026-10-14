import { useState } from "react";
import { MapPin, Phone, Mail, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";
import { serviceOptions } from "@/content/defaultContent";
import api, { formatApiError } from "@/lib/api";

const BUDGETS = ["Do 500 tys. zł", "500 tys. – 2 mln zł", "2 – 10 mln zł", "Powyżej 10 mln zł"];

export default function Contact() {
  const { content } = useSite();
  const c = content.contact;
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: serviceOptions[0], budget: BUDGETS[0], message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Zapytanie wysłane. Odezwiemy się w ciągu 24 godzin.");
      setForm({ name: "", email: "", phone: "", service: serviceOptions[0], budget: BUDGETS[0], message: "" });
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
              <div className="space-y-8" data-testid="contact-info">
                {[
                  { icon: MapPin, label: "Biuro", value: c.address, testid: "contact-info-address" },
                  { icon: Phone, label: "Telefon", value: c.phone, testid: "contact-info-phone" },
                  { icon: Mail, label: "E-mail", value: c.email, testid: "contact-info-email" },
                  { icon: Clock, label: "Godziny pracy", value: c.hours, testid: "contact-info-hours" },
                  { icon: FileText, label: "Dane rejestrowe", value: c.companyData, testid: "contact-info-company" },
                ].map((row, i) => (
                  <div key={i} className="flex gap-5 border-b border-hairline pb-8" data-testid={row.testid}>
                    <row.icon size={18} className="mt-1 shrink-0 text-gold" />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{row.label}</p>
                      <p className="mt-2 text-ink">{row.value}</p>
                    </div>
                  </div>
                ))}
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
                      placeholder="jan@firma.pl"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    <span className={labelSpan}>Telefon</span>
                    <input
                      data-testid="contact-phone-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+48 600 000 000"
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    <span className={labelSpan}>Zakres usług</span>
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
                    <span className={labelSpan}>Szacowany budżet inwestycji</span>
                    <select
                      data-testid="contact-budget-select"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className={inputCls}
                    >
                      {BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
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
                      placeholder="Opisz krótko swoją inwestycję: lokalizacja, metraż, etap…"
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
