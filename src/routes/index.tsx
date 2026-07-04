import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import aquarellAsset from "@/assets/aquarell.png.asset.json";
const aquarell = aquarellAsset.url;

export const Route = createFileRoute("/")({
  component: WeddingPage,
});

// PLACEHOLDER: replace with real Formspree (or similar) endpoint before going live.
const RSVP_ENDPOINT = "https://formspree.io/f/REPLACE_ME";

function WeddingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink overflow-x-hidden">
      <Nav />
      <Hero />
      <Ablauf />
      <Anfahrt />
      <Uebernachtung />
      <Dresscode />
      <Rsvp />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const items = [
    ["Ablauf", "#ablauf"],
    ["Anfahrt", "#anfahrt"],
    ["Übernachtung", "#uebernachtung"],
    ["Dresscode", "#dresscode"],
    ["RSVP", "#rsvp"],
  ];
  return (
    <nav
      aria-label="Hauptnavigation"
      className="sticky top-0 z-40 bg-cream/85 backdrop-blur-sm border-b border-rose/20"
    >
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4">
        <a href="#top" className="script text-2xl text-rose leading-none">
          M &amp; L
        </a>
        <ul className="hidden md:flex gap-8 caps text-xs text-rose">
          {items.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                className="hover:text-bordeaux transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <span className="caps text-xs text-rose hidden sm:inline">
          24 · 10 · 26
        </span>
      </div>
    </nav>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <header id="top" className="relative">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-24 md:pb-40 grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-6 items-center relative">
        <div className="relative z-10">
          <p className="script text-4xl md:text-5xl text-rose mb-6">
            save the date
          </p>
          <h1 className="display text-rose text-[22vw] md:text-[11rem] leading-[0.82]">
            <span className="block">24</span>
            <span className="block">10</span>
            <span className="block">26</span>
          </h1>
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px w-10 bg-olive" aria-hidden="true" />
            <p className="caps text-sm text-olive">Wir sagen ja</p>
          </div>
          <h2 className="mt-6 display text-bordeaux text-5xl md:text-7xl">
            Maibrit
            <span className="script text-rose text-4xl md:text-5xl mx-3 align-middle">
              &amp;
            </span>
            Luca
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/85">
            Nach vielen gemeinsamen Jahren wird es Zeit — wir heiraten. Und wir
            wünschen uns, dass ihr an unserer Seite seid, wenn wir am
            24. Oktober 2026 ja sagen.
          </p>
        </div>

        <div className="relative md:absolute md:right-0 md:top-0 md:h-full md:w-[55%] pointer-events-none">
          <img
            src={aquarell}
            alt=""
            aria-hidden="true"
            width={1280}
            height={1600}
            className="w-full h-auto md:h-full md:object-cover md:object-left-bottom mix-blend-multiply"
          />
        </div>
      </div>
    </header>
  );
}

/* ---------------- SECTION SHELL ---------------- */
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-5">
        <p className="caps text-xs text-olive mb-4">{eyebrow}</p>
        <h2 className="display text-rose text-5xl md:text-6xl mb-10">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/* ---------------- ABLAUF ---------------- */
function Ablauf() {
  const items = [
    {
      time: "14:00",
      title: "Standesamtliche Trauung",
      where: "Köllenhof, Wachtberg-Ließem",
    },
    {
      time: "16:30",
      title: "Gartenfest",
      where: "Bonn-Ückesdorf",
    },
  ];
  return (
    <Section id="ablauf" eyebrow="Der Tag" title="Ablauf">
      <ul className="space-y-8">
        {items.map((it) => (
          <li
            key={it.time}
            className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 items-baseline border-t border-rose/25 pt-6"
          >
            <span className="display text-bordeaux text-5xl md:text-6xl">
              {it.time}
            </span>
            <div>
              <p className="caps text-sm text-olive mb-1">{it.title}</p>
              <p className="text-lg">{it.where}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-ink/70 italic">
        Den ausführlichen Ablauf findet ihr auf eurer Einladungskarte.
      </p>
    </Section>
  );
}

/* ---------------- ANFAHRT ---------------- */
function Anfahrt() {
  return (
    <Section id="anfahrt" eyebrow="So findet ihr uns" title="Anfahrt & Parken">
      <div className="grid md:grid-cols-2 gap-10">
        <LocationCard
          label="Trauung — 14:00"
          name="Köllenhof"
          address={
            <>
              [Straße + Nr.]
              <br />
              53343 Wachtberg-Ließem
            </>
          }
          maps="https://maps.google.com/?q=Köllenhof+Wachtberg-Ließem"
          note="Parkplätze sind vor Ort begrenzt vorhanden — Fahrgemeinschaften werden empfohlen."
        />
        <LocationCard
          label="Gartenfest — ab 16:30"
          name="[Location Bonn-Ückesdorf]"
          address={
            <>
              [Straße + Nr.]
              <br />
              53127 Bonn-Ückesdorf
            </>
          }
          maps="https://maps.google.com/?q=Bonn-Ückesdorf"
          note="Parken in den umliegenden Seitenstraßen."
        />
      </div>
    </Section>
  );
}

function LocationCard({
  label,
  name,
  address,
  maps,
  note,
}: {
  label: string;
  name: string;
  address: React.ReactNode;
  maps: string;
  note: string;
}) {
  return (
    <article className="border-t border-rose/25 pt-6">
      <p className="caps text-xs text-olive mb-3">{label}</p>
      <h3 className="display text-3xl text-bordeaux mb-3">{name}</h3>
      <address className="not-italic text-ink/85 mb-4">{address}</address>
      <p className="text-sm text-ink/70 mb-4">{note}</p>
      <a
        href={maps}
        target="_blank"
        rel="noopener noreferrer"
        className="caps text-xs text-rose border-b border-rose pb-1 hover:text-bordeaux hover:border-bordeaux transition-colors"
      >
        In Google Maps öffnen
      </a>
    </article>
  );
}

/* ---------------- ÜBERNACHTUNG ---------------- */
function Uebernachtung() {
  const hotels = [
    {
      name: "[Hotel 1]",
      distance: "ca. 5 km zur Location",
      url: "#",
    },
    {
      name: "[Hotel 2]",
      distance: "ca. 8 km zur Location",
      url: "#",
    },
    {
      name: "[Pension / B&B]",
      distance: "ca. 3 km zur Location",
      url: "#",
    },
  ];
  return (
    <Section
      id="uebernachtung"
      eyebrow="Bleibt über Nacht"
      title="Übernachtung"
    >
      <p className="text-ink/80 mb-10 max-w-2xl">
        Damit ihr entspannt feiern könnt, hier drei Vorschläge in der Nähe.
        Bitte kümmert euch selbst um die Buchung — Kontingente haben wir nicht
        reserviert.
      </p>
      <ul className="grid md:grid-cols-3 gap-6">
        {hotels.map((h) => (
          <li
            key={h.name}
            className="border border-rose/30 p-6 bg-cream flex flex-col"
          >
            <h3 className="display text-2xl text-bordeaux mb-2">{h.name}</h3>
            <p className="text-sm text-ink/70 mb-6">{h.distance}</p>
            <a
              href={h.url}
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
  const swatches = [
    { hex: "#FFF5EB", label: "Cream" },
    { hex: "#97637A", label: "Altrosa" },
    { hex: "#4F132E", label: "Bordeaux" },
    { hex: "#303F11", label: "Olive" },
  ];
  return (
    <Section id="dresscode" eyebrow="Was ihr tragt" title="Dresscode">
      <p className="script text-4xl text-rose mb-8">Soft &amp; Golden Autumn</p>
      <p className="text-ink/85 max-w-2xl mb-10">
        Herbstlich, warm, festlich. Denkt an weiche Stoffe, gedeckte Töne und
        goldenes Licht. <strong className="text-bordeaux">Bitte kein Weiß</strong> — das
        heben wir uns für Maibrit auf.
      </p>
      <ul className="flex flex-wrap gap-6">
        {swatches.map((s) => (
          <li key={s.hex} className="flex flex-col items-center gap-3">
            <span
              aria-hidden="true"
              className="block w-20 h-20 rounded-full border border-ink/10 shadow-sm"
              style={{ backgroundColor: s.hex }}
            />
            <span className="caps text-xs text-olive">{s.label}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------- RSVP ---------------- */
function Rsvp() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [attending, setAttending] = useState<"yes" | "no">("yes");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("attending", attending);
    try {
      const res = await fetch(RSVP_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
      setAttending("yes");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id="rsvp" eyebrow="Antwort erbeten" title="RSVP">
      <p className="text-ink/85 mb-2 max-w-2xl">
        Bitte gebt uns bis zum{" "}
        <strong className="text-bordeaux">15. September 2026</strong> Bescheid,
        ob ihr dabei sein könnt.
      </p>

      {status === "ok" ? (
        <div className="mt-10 border border-olive/40 p-8 bg-muted text-center">
          <p className="script text-4xl text-rose mb-2">danke!</p>
          <p className="text-ink/80">
            Eure Antwort ist bei uns angekommen. Wir freuen uns.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 space-y-8 max-w-xl">
          <Field label="Name" name="name" required />

          <fieldset>
            <legend className="caps text-xs text-olive mb-3">
              Kommt ihr?
            </legend>
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

          <Field
            label="Begleitung (Namen falls Plus 1)"
            name="companions"
            as="textarea"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="caps text-xs px-8 py-4 bg-bordeaux text-cream hover:bg-ink transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Antwort abschicken"}
          </button>

          {status === "error" && (
            <p role="alert" className="text-bordeaux text-sm">
              Das hat nicht geklappt. Bitte versucht es erneut oder schreibt uns
              direkt.
            </p>
          )}

          {RSVP_ENDPOINT.includes("REPLACE_ME") && (
            <p className="text-xs text-olive/80 italic">
              ⚠︎ Platzhalter-Endpunkt aktiv. Vor Livegang RSVP_ENDPOINT in
              src/routes/index.tsx durch echten Formspree-Link ersetzen.
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
    "w-full bg-transparent border-b border-rose/50 py-3 text-ink placeholder:text-rose/50 focus:border-bordeaux focus:outline-none transition-colors";
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

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="relative mt-16 border-t border-rose/20 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-[1fr_auto] gap-10 items-end">
        <div>
          <p className="script text-5xl text-rose mb-2">
            Maibrit &amp; Luca
          </p>
          <p className="caps text-xs text-olive">24 · 10 · 2026</p>
          <p className="mt-6 text-sm text-ink/70 max-w-sm">
            Fragen? Schreibt uns:{" "}
            <a
              href="mailto:hallo@maibritundluca.de"
              className="text-bordeaux underline underline-offset-4 decoration-rose/60"
            >
              hallo@maibritundluca.de
            </a>
          </p>
          <div className="mt-8 flex flex-wrap gap-6 caps text-xs text-rose">
            <a href="#impressum" className="hover:text-bordeaux">
              Impressum
            </a>
            <a href="#datenschutz" className="hover:text-bordeaux">
              Datenschutz
            </a>
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

      <div className="border-t border-rose/20">
        <div className="mx-auto max-w-6xl px-5 py-10 space-y-8 text-sm text-ink/75">
          <section id="impressum">
            <h3 className="caps text-xs text-olive mb-2">Impressum</h3>
            <p>
              Maibrit [Nachname] &amp; Luca [Nachname]
              <br />
              [Straße + Nr.], [PLZ Ort]
              <br />
              Kontakt: hallo@maibritundluca.de
            </p>
          </section>
          <section id="datenschutz">
            <h3 className="caps text-xs text-olive mb-2">Datenschutz</h3>
            <p>
              Diese Seite ist privat und nicht über Suchmaschinen auffindbar.
              Die per RSVP-Formular übermittelten Angaben (Name, Zu-/Absage,
              Begleitung) verarbeiten wir ausschließlich zur Organisation
              unserer Hochzeit und löschen sie spätestens einen Monat nach dem
              24.10.2026. Es findet kein Tracking, keine Analyse und keine
              Weitergabe an Dritte statt — abgesehen vom Formular-Dienstleister
              (Formspree), der die Zustellung technisch abwickelt.
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
}
