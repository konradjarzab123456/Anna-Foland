import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/Logo";
import api, { formatApiError } from "@/lib/api";
import { defaultContent } from "@/content/defaultContent";

const TABS = ["Start", "O firmie", "Oferta", "Realizacje", "Kontakt", "Wiadomości"];

const inputCls =
  "mt-2 w-full border border-hairline bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

function TextField({ label, value, onChange, area = false, testid, rows = 3 }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{label}</span>
      {area ? (
        <textarea rows={rows} data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " resize-y"} />
      ) : (
        <input data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </label>
  );
}

function ObjectList({ label, items, fields, make, onChange }) {
  const upd = (i, k, v) => {
    const next = items.map((it, j) => (j === i ? { ...it, [k]: v } : it));
    onChange(next);
  };
  const asText = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  const asArr = (v) => v.split("\n").filter((x) => x.trim() !== "");
  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{label}</span>
      <div className="mt-3 space-y-4">
        {items.map((it, i) => (
          <div key={i} className="border border-hairline bg-white p-5" data-testid={`${label}-item-${i}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.k} className={`block ${f.area || f.lines ? "sm:col-span-2" : ""}`}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{f.label}</span>
                  {f.area ? (
                    <textarea
                      rows={f.rows || 3}
                      value={it[f.k] || ""}
                      onChange={(e) => upd(i, f.k, e.target.value)}
                      className={inputCls + " resize-y"}
                    />
                  ) : f.lines ? (
                    <textarea
                      rows={f.rows || 4}
                      value={asText(it[f.k])}
                      onChange={(e) => upd(i, f.k, asArr(e.target.value))}
                      className={inputCls + " resize-y"}
                    />
                  ) : f.sublist ? (
                    <div className="mt-2 space-y-3">
                      {(Array.isArray(it[f.k]) ? it[f.k] : []).map((sub, j) => (
                        <div key={j} className="flex items-start gap-3 border border-hairline p-3">
                          <div className="flex-1 space-y-2">
                            {f.sublist.fields.map((sf) => (
                              <label key={sf.k} className={`block ${sf.area ? "" : ""}`}>
                                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">{sf.label}</span>
                                {sf.area ? (
                                  <textarea
                                    rows={sf.rows || 2}
                                    value={sub[sf.k] || ""}
                                    onChange={(e) => {
                                      const arr = (it[f.k] || []).map((x, j2) => (j2 === j ? { ...x, [sf.k]: e.target.value } : x));
                                      upd(i, f.k, arr);
                                    }}
                                    className={inputCls + " resize-y"}
                                  />
                                ) : (
                                  <input
                                    value={sub[sf.k] || ""}
                                    onChange={(e) => {
                                      const arr = (it[f.k] || []).map((x, j2) => (j2 === j ? { ...x, [sf.k]: e.target.value } : x));
                                      upd(i, f.k, arr);
                                    }}
                                    className={inputCls}
                                  />
                                )}
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={() => upd(i, f.k, (it[f.k] || []).filter((_, j2) => j2 !== j))}
                            className="mt-6 text-red-500 hover:text-red-600"
                            data-testid={`${label}-item-${i}-point-remove-${j}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => upd(i, f.k, [...(it[f.k] || []), f.sublist.make()])}
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink hover:text-gold"
                        data-testid={`${label}-item-${i}-point-add`}
                      >
                        <Plus size={12} /> Dodaj punkt
                      </button>
                    </div>
                  ) : (
                    <input value={it[f.k] || ""} onChange={(e) => upd(i, f.k, e.target.value)} className={inputCls} />
                  )}
                </label>
              ))}
            </div>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-red-500 hover:text-red-600"
              data-testid={`${label}-remove-${i}`}
            >
              <Trash2 size={13} /> Usuń
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, make()])}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-paper"
        data-testid={`${label}-add`}
      >
        <Plus size={13} /> Dodaj
      </button>
    </div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState(0);
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  const { data: contentData } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => (await api.get("/content")).data.data,
    enabled: !!authed,
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await api.get("/messages")).data,
    enabled: !!authed,
  });

  useEffect(() => {
    if (authed && !draft) {
      const merged = JSON.parse(JSON.stringify(defaultContent));
      if (contentData) Object.assign(merged, contentData);
      setDraft(merged);
    }
  }, [authed, contentData, draft]);

  const upd = (path, value) => {
    setDraft((d) => {
      const next = JSON.parse(JSON.stringify(d));
      const keys = path.split(".");
      let o = next;
      keys.slice(0, -1).forEach((k) => (o = o[k]));
      o[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const lines = (arr) => (arr || []).join("\n");
  const toLines = (v) => v.split("\n").filter((x) => x.trim() !== "");

  const login = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/login", creds);
      setAuthed(true);
      toast.success("Zalogowano.");
    } catch (err) {
      toast.error(formatApiError(err, "Błąd logowania."));
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAuthed(false);
    setDraft(null);
  };

  const save = async () => {
    try {
      await api.put("/content", { data: draft });
      toast.success("Zapisano. Strona zaktualizowana.");
      queryClient.invalidateQueries(["site-content"]);
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center bg-paper font-sans text-graphite">Sprawdzanie sesji…</div>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6" data-testid="admin-login-view">        <form onSubmit={login} className="w-full max-w-sm border border-hairline bg-white p-10" data-testid="admin-login-form">
          <div className="flex items-center gap-3">
            <LogoMark />
            <h1 className="font-display text-3xl font-light text-ink">Panel administracyjny</h1>
          </div>
          <label className="mt-8 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">E-mail</span>
            <input
              data-testid="admin-email-input"
              type="email"
              required
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="mt-5 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Hasło</span>
            <input
              data-testid="admin-password-input"
              type="password"
              required
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              className={inputCls}
            />
          </label>
          <button
            data-testid="admin-login-button"
            className="mt-8 w-full rounded-full bg-ink py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937]"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    );
  }

  if (authed && !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-sans text-graphite" data-testid="admin-loading">
        Ładowanie treści…
      </div>
    );
  }

  const draftTabs = {
    "Start": (
      <div className="space-y-6">
        <TextField label="Nazwa firmy" value={draft.siteName} onChange={(v) => upd("siteName", v)} testid="field-siteName" />
        <TextField label="Podtytuł nazwy" value={draft.siteSuffix} onChange={(v) => upd("siteSuffix", v)} testid="field-siteSuffix" />
        <TextField label="Manifest / hasło" area value={draft.tagline} onChange={(v) => upd("tagline", v)} testid="field-tagline" />
        <TextField label="Hero — nadtytuł" value={draft.hero.eyebrow} onChange={(v) => upd("hero.eyebrow", v)} testid="field-hero-eyebrow" />
        <TextField label="Hero — linie (każda w nowej linii)" area value={lines(draft.hero.lines)} onChange={(v) => upd("hero.lines", toLines(v))} testid="field-hero-lines" />
        <TextField label="Hero — podtytuł" area value={draft.hero.subtitle} onChange={(v) => upd("hero.subtitle", v)} testid="field-hero-subtitle" />
        <TextField label="Hero — przycisk główny" value={draft.hero.ctaPrimary} onChange={(v) => upd("hero.ctaPrimary", v)} testid="field-hero-cta1" />
        <TextField label="Hero — przycisk drugi" value={draft.hero.ctaSecondary} onChange={(v) => upd("hero.ctaSecondary", v)} testid="field-hero-cta2" />
        <TextField label="Hero — zdjęcie (URL)" value={draft.hero.image} onChange={(v) => upd("hero.image", v)} testid="field-hero-image" />
        <ObjectList
          label="Statystyki"
          items={draft.stats}
          onChange={(v) => upd("stats", v)}
          make={() => ({ value: "0", label: "opis" })}
          fields={[
            { k: "value", label: "Wartość" },
            { k: "label", label: "Opis" },
          ]}
        />
        <TextField label="Marquee (elementy w liniach)" area value={lines(draft.marquee)} onChange={(v) => upd("marquee", toLines(v))} testid="field-marquee" />
      </div>
    ),
    "O firmie": (
      <div className="space-y-6">
        <TextField label="Nagłówek" area value={draft.about.title} onChange={(v) => upd("about.title", v)} testid="field-about-title" />
        <TextField label="Akapity (każdy w nowej linii)" area rows={6} value={lines(draft.about.paragraphs)} onChange={(v) => upd("about.paragraphs", toLines(v))} testid="field-about-paragraphs" />
        <TextField label="Zdjęcie (URL)" value={draft.about.image} onChange={(v) => upd("about.image", v)} testid="field-about-image" />
        <ObjectList
          label="Wartości"
          items={draft.about.values}
          onChange={(v) => upd("about.values", v)}
          make={() => ({ title: "Tytuł", desc: "Opis" })}
          fields={[
            { k: "title", label: "Tytuł" },
            { k: "desc", label: "Opis", area: true, rows: 2 },
          ]}
        />
        <ObjectList
          label="Zespół"
          items={draft.about.team}
          onChange={(v) => upd("about.team", v)}
          make={() => ({ name: "Imię Nazwisko", role: "Stanowisko" })}
          fields={[
            { k: "name", label: "Imię i nazwisko" },
            { k: "role", label: "Stanowisko" },
          ]}
        />
        <TextField label="Nagrody (każda w nowej linii)" area value={lines(draft.about.awards)} onChange={(v) => upd("about.awards", toLines(v))} testid="field-about-awards" />
      </div>
    ),
    "Oferta": (
      <div className="space-y-6">
        <TextField label="Nagłówek" area value={draft.offer.title} onChange={(v) => upd("offer.title", v)} testid="field-offer-title" />
        <TextField label="Podtytuł" area value={draft.offer.subtitle} onChange={(v) => upd("offer.subtitle", v)} testid="field-offer-subtitle" />
        <ObjectList
          label="Usługi"
          items={draft.offer.services}
          onChange={(v) => upd("offer.services", v)}
          make={() => ({ slug: "nowa-zakladka", tab: "Nazwa zakładki", title: "Nagłówek", desc: "", items: [] })}
          fields={[
            { k: "slug", label: "Adres URL (slug)" },
            { k: "tab", label: "Nazwa zakładki" },
            { k: "title", label: "Nagłówek", area: true, rows: 2 },
            { k: "desc", label: "Opis", area: true, rows: 4 },
            {
              k: "items",
              label: "Co obejmuje współpraca",
              sublist: {
                make: () => ({ title: "Nowy punkt", desc: "" }),
                fields: [
                  { k: "title", label: "Tytuł punktu" },
                  { k: "desc", label: "Opis", area: true, rows: 2 },
                ],
              },
            },
          ]}
        />
      </div>
    ),
    "Realizacje": (
      <div className="space-y-6">
        <TextField label="Nagłówek" value={draft.works.title} onChange={(v) => upd("works.title", v)} testid="field-works-title" />
        <TextField label="Podtytuł" value={draft.works.subtitle} onChange={(v) => upd("works.subtitle", v)} testid="field-works-subtitle" />
        <ObjectList
          label="Projekty"
          items={draft.works.items}
          onChange={(v) => upd("works.items", v)}
          make={() => ({ title: "Nowy projekt", category: "Rezydencje", year: "2025", location: "Warszawa", image: "", desc: "" })}
          fields={[
            { k: "title", label: "Tytuł" },
            { k: "category", label: "Kategoria" },
            { k: "year", label: "Rok" },
            { k: "location", label: "Lokalizacja" },
            { k: "image", label: "Zdjęcie (URL)" },
            { k: "desc", label: "Opis", area: true, rows: 3 },
          ]}
        />
      </div>
    ),
    "Kontakt": (
      <div className="space-y-6">
        <TextField label="Nagłówek" area value={draft.contact.title} onChange={(v) => upd("contact.title", v)} testid="field-contact-title" />
        <TextField label="E-mail" value={draft.contact.email || ""} onChange={(v) => upd("contact.email", v)} testid="field-contact-email" />
        <TextField label="Booksy — adres rezerwacji" value={draft.contact.booksy || ""} onChange={(v) => upd("contact.booksy", v)} testid="field-contact-booksy" />
        <TextField label="Facebook — adres" value={draft.contact.facebook || ""} onChange={(v) => upd("contact.facebook", v)} testid="field-contact-facebook" />
        <TextField label="Instagram — adres" value={draft.contact.instagram || ""} onChange={(v) => upd("contact.instagram", v)} testid="field-contact-instagram" />
        <TextField label="Stopka — nota" area rows={2} value={draft.footer.note} onChange={(v) => upd("footer.note", v)} testid="field-footer-note" />
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink" data-testid="admin-editor-view">
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Edytor treści</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              data-testid="admin-save-button"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-paper transition-colors hover:bg-[#1F2937]"
            >
              <Save size={13} /> Zapisz
            </button>
            <button
              onClick={logout}
              data-testid="admin-logout-button"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              <LogOut size={13} /> Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap gap-2" data-testid="admin-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              data-testid={`admin-tab-${t.toLowerCase().replace(" ", "-")}`}
              onClick={() => setTab(i)}
              className={`rounded-full border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-all ${
                tab === i ? "border-ink bg-ink text-paper" : "border-hairline text-graphite hover:border-ink hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10" data-testid="admin-tab-content">
          {tab < 5 ? (
            draftTabs[TABS[tab]]
          ) : (
            <div data-testid="admin-messages-list">
              {(messages || []).length === 0 ? (
                <p className="text-sm text-graphite">Brak wiadomości.</p>
              ) : (
                (messages || []).map((m) => (
                  <div key={m.id} className="mb-4 border border-hairline bg-white p-5" data-testid="admin-message-item">
                    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-graphite">
                      {m.name} · {m.email} {m.phone && `· ${m.phone}`} {m.service && `· ${m.service}`} ·{" "}
                      {new Date(m.created_at).toLocaleString("pl-PL")}
                    </p>
                    <p className="mt-3 text-sm text-ink">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
