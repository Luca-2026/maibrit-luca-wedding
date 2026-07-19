import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import aquarellAsset from "@/assets/aquarell.png.asset.json";
import datumAsset from "@/assets/datum.png.asset.json";
import {
  decryptContent,
  type ProtectedContent,
} from "@/lib/protected-content";
import { adminUnlock } from "@/lib/admin.functions";

const aquarell = aquarellAsset.url;
const datum = datumAsset.url;

export const Route = createFileRoute("/")({
  component: WeddingPage,
});

// RSVP-Antworten werden in Lovable Cloud gespeichert und im Admin-Bereich angezeigt.

// Session-only key — Passwort selbst wird nie gespeichert, nur der entschlüsselte Inhalt für die aktuelle Session.
const SESSION_KEY = "mul-unlocked-content-v13";

function WeddingPage() {
  const [content, setContent] = useState<ProtectedContent | null>(null);

  // Session persistieren, damit Refresh nicht erneut Passwort verlangt.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setContent(JSON.parse(raw) as ProtectedContent);
    } catch {
      /* ignore */
    }
  }, []);

  function handleUnlock(c: ProtectedContent) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
    setContent(c);
  }

  function handleLock() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setContent(null);
  }

  return (
    <div className="min-h-screen bg-cream text-olive overflow-x-clip">
      <Nav unlocked={!!content} onLock={handleLock} />
      <Hero />
      {content ? (
        <>
          <Ablauf items={content.ablauf} />
          <Anfahrt locations={content.locations} />
          <Uebernachtung hotels={content.hotels} />
          <Dresscode />
          <Trauzeugen people={content.trauzeugen} />
          <Wuensche />
          <Geschenke />
          <Rsvp deadline={content.rsvpDeadline} email={content.contactEmail} />
          <Footer email={content.contactEmail} phone={content.contactPhone} />

        </>
      ) : (
        <>
          <Gate onUnlock={handleUnlock} />
          <PublicFooter />
        </>
      )}
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav({ unlocked, onLock }: { unlocked: boolean; onLock: () => void }) {
  const items = [
    ["Ablauf", "#ablauf"],
    ["Anfahrt", "#anfahrt"],
    ["Übernachtung", "#uebernachtung"],
    ["Dresscode", "#dresscode"],
    ["Trauzeugen", "#trauzeugen"],
    ["Geschenke", "#geschenke"],
    ["RSVP", "#rsvp"],
  ];

  return (
    <nav
      aria-label="Hauptnavigation"
      className="sticky top-0 z-40 bg-cream/85 backdrop-blur-sm border-b border-rose/20"
    >
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
        <span className="caps text-xs text-rose">24 · 10 · 2026</span>
        {unlocked ? (
          <>
            <ul className="hidden md:flex gap-8 caps text-xs text-rose">
              {items.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="hover:text-bordeaux transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={onLock}
              className="caps text-[10px] text-rose/70 hover:text-bordeaux transition-colors"
              aria-label="Ausloggen"
            >
              Sperren
            </button>
          </>
        ) : (
          <span className="display text-base md:text-lg text-rose">
            Maibrit &amp; Luca
          </span>
        )}
      </div>
    </nav>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const [progress, setProgress] = useState(0); // 0 = date, 1 = flower
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function update() {
      raf = 0;
      // Der Hero bleibt während des gesamten Crossfades sticky.
      // Erst wenn progress = 1 erreicht ist, darf der normale Seiteninhalt hochscrollen.
      const range = window.innerHeight * 0.92;
      const stageTop = stageRef.current?.offsetTop ?? 0;
      const y = Math.max(0, Math.min(range, window.scrollY - stageTop));
      setProgress(reduced ? 1 : y / range);
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Weiche Easing-Kurven für den Übergang
  const dateOpacity = Math.max(0, 1 - progress * 1.4);
  const dateScale = 1 - progress * 0.12;
  const dateBlur = progress * 6;

  const florStart = 0.2; // Blume beginnt, wenn Zahl schon deutlich schwächer wird
  const florEnd = 0.85;  // Blume steht komplett, bevor Sticky freigibt
  const florP = Math.max(0, Math.min(1, (progress - florStart) / (florEnd - florStart)));
  const florOpacity = florP;
  const florScale = 0.55 + florP * 0.55; // wächst von klein zu groß

  // Intro-Text erscheint, sobald die Blume komplett steht
  const introOpacity = florP;

  return (
    <header id="top" className="relative">
      {/* Scroll-Bühne: Sticky bleibt fixiert, bis Zahl vollständig in Blume übergeblendet ist. */}
      <div ref={stageRef} className="relative h-[192svh] min-h-[1120px]">
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* Datum — mittig, startet groß */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: dateOpacity,
              transform: `scale(${dateScale})`,
              filter: `blur(${dateBlur}px)`,
              transition: "opacity 120ms linear, filter 120ms linear",
              willChange: "opacity, transform, filter",
            }}
          >
            <div className="anim-hero-date">
              <img
                src={datum}
                alt="24. 10. 2026"
                width={1058}
                height={1920}
                className="h-[68svh] md:h-[82svh] w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Blume — wächst mittig ein */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: florOpacity,
              transform: `scale(${florScale})`,
              transition: "opacity 120ms linear",
              willChange: "opacity, transform",
            }}
            aria-hidden="true"
          >
            <div className="anim-float">
              <img
                src={aquarell}
                alt=""
                width={2860}
                height={5084}
                className="h-[75svh] md:h-[90svh] w-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Scroll-Hinweis unten — verschwindet mit der Zahl */}
          <div
            className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none"
            style={{ opacity: Math.max(0, 1 - progress * 2) }}
            aria-hidden="true"
          >
            <span className="caps text-[10px] tracking-[0.3em] text-olive/70">
              scrollen
            </span>
          </div>
        </div>
      </div>

      {/* Intro-Text unter dem Cross-Fade */}
      <div
        className="mx-auto max-w-2xl px-5 pb-24 md:pb-32 text-center"
        style={{ opacity: introOpacity, transition: "opacity 200ms linear" }}
      >
        <div className="flex items-center gap-4 justify-center">
          <span className="h-px w-10 bg-olive" aria-hidden="true" />
          <p className="caps text-sm text-olive">Wir sagen ja</p>
          <span className="h-px w-10 bg-olive" aria-hidden="true" />
        </div>
        <h2 className="mt-6 display text-rose text-5xl md:text-7xl">
          Maibrit &amp; Luca
        </h2>
        <p className="mt-8 max-w-md mx-auto text-lg leading-relaxed text-olive/85">
          Wir heiraten und wünschen uns, dass ihr an unserer Seite seid, wenn wir am 24. Oktober 2026 Ja sagen.
        </p>
      </div>
    </header>
  );
}

/* ---------------- GATE (Passwort-Login) ---------------- */
function Gate({ onUnlock }: { onUnlock: (c: ProtectedContent) => void }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const navigate = useNavigate();
  const unlockAdmin = useServerFn(adminUnlock);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = password.trim();
    if (!pw) return;
    setStatus("checking");
    // 1) Gäste-Code: versuch, den geschützten Inhalt zu entschlüsseln.
    try {
      const content = await decryptContent(pw);
      onUnlock(content);
      return;
    } catch {
      /* kein Gäste-Code — evtl. Admin */
    }
    // 2) Admin-Passwort: Server-Fn prüft und setzt Session-Cookie.
    try {
      const res = await unlockAdmin({ data: { password: pw } });
      if (res.ok) {
        try {
          window.sessionStorage.setItem(
            "mul-admin-primed",
            JSON.stringify({ rows: res.rows, t: Date.now() }),
          );
        } catch {
          /* ignore */
        }
        await navigate({ to: "/admin" });
        return;
      }
    } catch {
      /* Netzwerk-/Serverfehler → als falsch behandeln */
    }
    setStatus("error");
  }

  return (
    <section
      id="login"
      aria-labelledby="login-heading"
      className="anim-fade-up anim-delay-4 mx-auto max-w-md px-5 pb-24"
    >
      <div className="border-t border-rose/25 pt-10 text-center">
        <p className="caps text-xs text-olive mb-3">Persönlicher Zugang</p>
        <h2 id="login-heading" className="display text-rose text-3xl md:text-4xl mb-4">
          Bitte einloggen
        </h2>
        <p className="text-sm text-olive/80 mb-8 leading-relaxed">
          Alle Details zu Ablauf, Location und Anfahrt sind nur für unsere Gäste
          sichtbar. Bitte gebt den Code ein, den ihr auf eurer Einladung findet.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-left">
            <span className="sr-only">Zugangscode</span>
            <input
              type="password"
              autoComplete="current-password"
              inputMode="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Zugangscode"
              className="w-full bg-cream border border-rose/40 px-4 py-3 text-center text-olive placeholder:text-rose/50 focus:border-bordeaux focus:outline-none transition-colors rounded-sm"
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "gate-error" : undefined}
            />
          </label>
          <button
            type="submit"
            disabled={status === "checking" || !password.trim()}
            className="w-full caps text-xs px-8 py-4 bg-bordeaux text-cream hover:bg-olive transition-colors disabled:opacity-60"
          >
            {status === "checking" ? "Prüfen…" : "Einloggen"}
          </button>
          {status === "error" && (
            <p id="gate-error" role="alert" className="text-bordeaux text-sm">
              Code stimmt nicht. Bitte prüft eure Einladung.
            </p>
          )}
        </form>
        <p className="mt-8 text-xs text-olive/70 leading-relaxed">
          Aus Datenschutzgründen sind Ort, Adressen und weitere Details Ende-zu-Ende
          verschlüsselt (AES-GCM, PBKDF2) und werden erst nach erfolgreicher
          Eingabe entschlüsselt.
        </p>
      </div>
    </section>
  );
}

/* ---------------- SECTION SHELL ---------------- */
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {

  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-28 anim-fade-up">
      <div className="mx-auto max-w-4xl px-5">
        <p className="caps text-xs text-olive mb-4">{eyebrow}</p>
        <h2 className="display text-rose text-5xl md:text-6xl mb-10">{title}</h2>
        {children}
      </div>
    </section>
  );
}

/* ---------------- ABLAUF ---------------- */
function Ablauf({ items }: { items: ProtectedContent["ablauf"] }) {
  return (
    <Section id="ablauf" eyebrow="Der Tag" title="Ablauf">
      <ol className="mx-auto max-w-md text-center">
        {items.map((it, i) => (
          <li key={it.time + it.title} className="relative">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="mx-auto block h-16 w-px bg-rose/30"
              />
            )}
            <div className="py-6">
              <p className="display text-bordeaux text-5xl md:text-6xl leading-none tabular-nums">
                {it.time}
              </p>
              <p className="caps text-[10px] text-rose tracking-[0.3em] mt-2">
                Uhr
              </p>
              <p className="caps text-sm text-olive tracking-[0.22em] mt-6">
                {it.title}
              </p>
              {it.where && (
                <p className="mt-2 text-olive/70 italic text-sm whitespace-pre-wrap">
                  {it.where}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}


/* ---------------- ANFAHRT ---------------- */
function Anfahrt({ locations }: { locations: ProtectedContent["locations"] }) {
  return (
    <Section id="anfahrt" eyebrow="So findet ihr uns" title="Anfahrt & Parken">
      <div className="grid md:grid-cols-2 gap-10">
        {locations.map((loc) => (
          <article key={loc.name} className="border-t border-rose/25 pt-6">
            <p className="caps text-xs text-olive mb-3">{loc.label}</p>
            <h3 className="display text-3xl text-bordeaux mb-3">{loc.name}</h3>
            <address className="not-italic text-olive/85 mb-4">
              {loc.addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < loc.addressLines.length - 1 && <br />}
                </span>
              ))}
            </address>
            <p className="text-sm text-olive/70 mb-4 whitespace-pre-wrap">{loc.note}</p>
            <a
              href={loc.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="caps text-xs text-rose border-b border-rose pb-1 hover:text-bordeaux hover:border-bordeaux transition-colors"
            >
              In Google Maps öffnen
            </a>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- ÜBERNACHTUNG ---------------- */
function Uebernachtung({ hotels }: { hotels: ProtectedContent["hotels"] }) {
  return (
    <Section id="uebernachtung" eyebrow="IHR BRAUCHT EIN HOTEL?" title="Übernachtung">
      <p className="text-olive/80 mb-10 max-w-2xl">
        Falls ihr den Abend entspannt ausklingen lassen und nicht mehr fahren
        möchtet, haben wir euch ein paar Hotels in der Nähe herausgesucht.
      </p>
      <ul className="grid md:grid-cols-3 gap-6">
        {hotels.map((h) => (
          <li
            key={h.name}
            className="border border-rose/30 p-6 bg-cream flex flex-col"
          >
            <h3 className="display text-2xl text-bordeaux mb-2">{h.name}</h3>
            <p className="text-sm text-olive/70 mb-4 whitespace-pre-wrap">{h.description}</p>
            <p className="text-sm text-olive/60 mb-6">{h.distance}</p>
            <a
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto caps text-xs text-rose border-b border-rose self-start pb-1 hover:text-bordeaux hover:border-bordeaux transition-colors"
            >
              Zur Website
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------- DRESSCODE ---------------- */
function Dresscode() {
  return (
    <Section id="dresscode" eyebrow="WAS IHR TRAGT" title="Dresscode">
      <div className="max-w-2xl text-lg leading-relaxed text-olive/85">
        <p>
          <span className="text-rose">Leger, aber schick.</span>&nbsp;
          Zieht an, worin ihr euch wohlfühlt und den Tag genießen könnt.
        </p>
        
        <p className="mt-4">
          Wer Lust hat, darf sich gern farblich an unseren Tönen orientieren,
          ein schönes Extra, aber definitiv kein Muss.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-start gap-8 md:gap-10">
        {[
          { name: "Zartrosa", hex: "#C6A9B6", border: "border-black/16" },
          { name: "Altrosa", hex: "#97637A" },
          { name: "Bordeaux", hex: "#4F132E" },
          { name: "Eukalyptus", hex: "#AEBDA6" },
          { name: "Salbei", hex: "#7E8C6C" },
          { name: "Olivgrün", hex: "#46531F" },
        ].map((color) => (
          <div key={color.name} className="flex flex-col items-center gap-3">
            <div
              className={`h-14 w-14 rounded-full border-[0.5px] shadow-sm ${color.border ?? "border-black/12"}`}
              style={{ backgroundColor: color.hex }}
              aria-hidden="true"
            />
            <span className="caps text-[11px] text-olive/80 tracking-[0.18em]">
              {color.name}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- TRAUZEUGEN ---------------- */
function Trauzeugen({ people }: { people: ProtectedContent["trauzeugen"] }) {
  return (
    <Section id="trauzeugen" eyebrow="An unserer Seite" title="Trauzeugen">
      <div className="max-w-2xl text-lg leading-relaxed text-olive/85">
        <p>
          &nbsp;
        </p>
      </div>
      <ul className="grid sm:grid-cols-2 gap-6 max-w-3xl">
        {people.map((p) => (
          <li
            key={p.name}
            className="border border-rose/30 p-8 bg-cream text-center"
          >
            <p className="caps text-[10px] text-rose tracking-[0.3em]">
              {p.role}
            </p>
            <p className="display text-3xl text-bordeaux mt-3 whitespace-pre-wrap">{p.name}</p>
            {p.note && (
              <p className="mt-3 text-sm text-olive/70 italic">{p.note}</p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------- WÜNSCHE (keine Überraschungen) ---------------- */
function Wuensche() {
  return (
    <Section eyebrow="Eine kleine Bitte" title="Ohne Überraschungen">
      <div className="max-w-2xl text-lg leading-relaxed text-olive/85">
        <p>
          Wir möchten unseren Tag ganz bewusst so verbringen, wie wir ihn uns
          vorstellen, entspannt und ohne Programm.
        </p>
        <p className="mt-4 whitespace-pre-wrap">
          Bitte plant keine Spiele oder Brautentführungen. Wir freuen uns, wenn ihr einfach mit uns feiert.
        </p>
        <p className="mt-4">
          Für Überraschungen sind unsere Familien und Trauzeugen für euch erreichbar.&nbsp;
        </p>
      </div>
    </Section>
  );
}

/* ---------------- GESCHENKE ---------------- */
function Geschenke() {
  return (
    <Section id="geschenke" eyebrow="FALLS IHR UNS WAS SCHENKEN MÖCHTET" title="Geschenke">
      <div className="max-w-2xl text-lg leading-relaxed text-olive/85">
        <p>
          Dass ihr an dem Tag mit uns feiert, ist Geschenk genug.&nbsp;
        </p>
        <p className="mt-4">
          Solltet ihr uns dennoch etwas schenken wollen, freuen wir uns über einen Beitrag zu unseren Flitterwochen.
        </p>
        <p className="mt-4 italic text-olive/70">
          &nbsp;
        </p>
      </div>
    </Section>
  );
}

/* ---------------- RSVP ---------------- */

function Rsvp({ deadline, email }: { deadline: string; email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [companionNames, setCompanionNames] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const cleanedCompanions =
      attending === "yes"
        ? companionNames.map((n) => n.trim()).filter(Boolean)
        : [];
    const partySize = attending === "yes" ? 1 + cleanedCompanions.length : 1;
    const companions = cleanedCompanions.join(", ");

    if (!name) {
      setStatus("error");
      setErrorMsg("Bitte gebt euren Namen an.");
      return;
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("rsvps").insert({
        name,
        attending: attending === "yes",
        party_size: partySize,
        companions: companions || null,
        message: message || null,
      });
      if (error) throw error;
      setStatus("ok");
      form.reset();
      setAttending("yes");
      setCompanionNames([]);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        "Das hat leider nicht geklappt. Bitte versucht es noch einmal oder schreibt uns eine Mail.",
      );
      console.error(err);
    }
  }


  return (
    <Section id="rsvp" eyebrow="SEID IHR DABEI?&nbsp;" title="RSVP">
      <p className="text-olive/85 mb-2 max-w-2xl">
        Bitte gebt uns bis zum{" "}
        <strong className="text-bordeaux">{deadline}</strong> Bescheid, ob ihr
        dabei sein könnt.
      </p>
      <p className="text-olive/70 mb-2 max-w-2xl text-sm whitespace-pre-wrap">
        Bei Rückfragen erreicht ihr uns unter{" "}
        <a href={`mailto:${email}`} className="text-bordeaux underline">
          {email}
        </a>{" "}
        oder +49 151 42360784
      </p>

      {status === "ok" ? (
        <div className="mt-10 border border-olive/40 p-8 bg-muted text-center max-w-xl">
          <p className="script text-4xl text-rose mb-2">danke!</p>
          <p className="text-olive/80">
            Eure Antwort ist bei uns angekommen. Wir freuen uns sehr, von euch
            zu hören.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 caps text-xs text-rose border-b border-rose pb-1 hover:text-bordeaux hover:border-bordeaux"
          >
            Weitere Antwort abschicken
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 space-y-8 max-w-xl">
          <Field label="Name" name="name" required />

          <fieldset>
            <legend className="caps text-xs text-olive mb-3">Kommt ihr?</legend>
            <div
              role="radiogroup"
              className="inline-flex border border-rose/40 rounded-full p-1 bg-cream"
            >
              {(
                [
                  ["yes", "Ja, sehr gern"],
                  ["no", "Leider nein"],
                ] as const
              ).map(([val, label]) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={attending === val}
                  key={val}
                  onClick={() => setAttending(val)}
                  className={`caps text-xs px-5 py-2 rounded-full transition-colors ${
                    attending === val
                      ? "bg-bordeaux text-cream"
                      : "text-rose hover:text-bordeaux"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {attending === "yes" && (
            <fieldset>
              <legend className="caps text-xs text-olive mb-3">
                Wer kommt mit?
              </legend>
              <p className="text-olive/70 text-sm mb-4">
                Gib bitte die Namen aller weiteren Personen an, die dich
                begleiten. Wenn du alleine kommst, lass das Feld einfach leer.
              </p>
              <div className="space-y-3">
                {companionNames.map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const next = [...companionNames];
                        next[i] = e.target.value;
                        setCompanionNames(next);
                      }}
                      placeholder={`Name der ${i + 1}. Begleitung`}
                      className="flex-1 bg-transparent border-b border-rose/40 focus:border-bordeaux outline-none py-2 text-olive placeholder:text-olive/40"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCompanionNames(
                          companionNames.filter((_, idx) => idx !== i),
                        )
                      }
                      aria-label="Person entfernen"
                      className="caps text-xs text-rose hover:text-bordeaux border-b border-rose/40 hover:border-bordeaux pb-0.5"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
                {companionNames.length < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCompanionNames([...companionNames, ""])
                    }
                    className="caps text-xs text-rose hover:text-bordeaux border-b border-rose/40 hover:border-bordeaux pb-0.5"
                  >
                    + Weitere Person hinzufügen
                  </button>
                )}
              </div>
            </fieldset>
          )}


          <Field
            label="Nachricht an uns (optional)"
            name="message"
            as="textarea"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="caps text-xs px-8 py-4 bg-bordeaux text-cream hover:bg-olive transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Antwort abschicken"}
          </button>

          {status === "error" && errorMsg && (
            <p role="alert" className="text-bordeaux text-sm">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </Section>
  );
}

function Field({
  label,
  name,
  required,
  as = "input",
}: {
  label: string;
  name: string;
  required?: boolean;
  as?: "input" | "textarea";
}) {
  const shared =
    "w-full bg-transparent border-b border-rose/50 py-3 text-olive placeholder:text-rose/50 focus:border-bordeaux focus:outline-none transition-colors";
  return (
    <label className="block">
      <span className="caps text-xs text-olive block mb-2">
        {label}
        {required && <span className="text-bordeaux"> *</span>}
      </span>
      {as === "textarea" ? (
        <textarea name={name} rows={3} className={shared} />
      ) : (
        <input type="text" name={name} required={required} className={shared} />
      )}
    </label>
  );
}

/* ---------------- FOOTER (unlocked) ---------------- */
function Footer({ email, phone }: { email: string; phone?: string }) {
  const telHref = phone ? "tel:" + phone.replace(/[^+\d]/g, "") : "";

  return (
    <footer className="relative mt-16 border-t border-rose/20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-[1fr_auto] gap-10 items-end">
        <div>
          <p className="display text-5xl text-rose mb-2">Maibrit &amp; Luca</p>
          <p className="caps text-xs text-olive">24 · 10 · 2026</p>
          <p className="mt-6 text-sm text-olive/70 max-w-sm">
            Fragen? Schreibt oder ruft uns gern an:
          </p>
          <p className="mt-2 text-sm text-olive/85">
            <a
              href={`mailto:${email}`}
              className="text-bordeaux underline underline-offset-4 decoration-rose/60"
            >
              {email}
            </a>
            {phone && (
              <>
                <br />
                <a
                  href={telHref}
                  className="text-bordeaux underline underline-offset-4 decoration-rose/60"
                >
                  {phone}
                </a>
              </>
            )}
          </p>


          <div className="mt-8 flex flex-wrap gap-6 caps text-xs text-rose">
            <a href="#datenschutz" className="hover:text-bordeaux">Datenschutz</a>
          </div>
        </div>
        <img
          src={aquarell}
          alt=""
          aria-hidden="true"
          width={1280}
          height={1600}
          loading="lazy"
          className="w-40 md:w-56 h-auto justify-self-end mix-blend-multiply opacity-90"
        />
      </div>

      <LegalSections />
    </footer>
  );
}

/* ---------------- FOOTER (locked / public) ---------------- */
function PublicFooter() {
  return (
    <footer className="mt-8 border-t border-rose/20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-olive/80">
        <p className="caps">Maibrit &amp; Luca · 24 · 10 · 2026</p>
        <div className="flex gap-6 caps text-rose">
          <a href="#datenschutz" className="hover:text-bordeaux">Datenschutz</a>
        </div>
      </div>
      <LegalSections email="hallo@maibritundluca.de" />
    </footer>
  );
}

function LegalSections({ email }: { email: string }) {
  return (
    <div className="border-t border-rose/20">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-olive/75">
        <section id="datenschutz">
          <h3 className="caps text-xs text-olive mb-2">Datenschutz</h3>
          <p>
            Diese Seite ist privat und nicht über Suchmaschinen auffindbar
            (noindex). Details zu Ort, Ablauf und Adressen liegen ausschließlich
            als AES-GCM-verschlüsseltes Chiffrat im Client-Bundle und werden
            erst nach Eingabe des Gäste-Codes lokal im Browser entschlüsselt —
            das Passwort verlässt euer Gerät nicht. Die per RSVP-Formular
            übermittelten Angaben (Name, Zu-/Absage, Personenzahl, Begleitung,
            optionale Nachricht) speichern wir in unserer verschlüsselten
            Datenbank ausschließlich zur Organisation unserer Hochzeit und
            löschen sie spätestens einen Monat nach dem 24.10.2026. Es findet
            kein Tracking, keine Analyse und keine Weitergabe an Dritte statt.
          </p>
        </section>
      </div>
    </div>
  );
}
