import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Maibrit & Luca" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export type RsvpRow = {
  id: string;
  created_at: string;
  name: string;
  attending: boolean;
  party_size: number;
  companions: string | null;
  message: string | null;
};

type Status = "loading" | "signed-out" | "no-role" | "ready";

function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadForCurrentUser() {
    setError(null);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setStatus("signed-out");
      setRows([]);
      return;
    }
    // Owner-E-Mail darf sich beim ersten Login selbst als Admin freischalten
    let { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      await (supabase.rpc as unknown as (fn: string) => Promise<unknown>)("claim_owner_admin");
      const retry = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id)
        .eq("role", "admin")
        .maybeSingle();
      roleRow = retry.data;
    }
    if (!roleRow) {
      setStatus("no-role");
      setRows([]);
      return;
    }
    const { data, error } = await supabase
      .from("rsvps")
      .select("id, created_at, name, attending, party_size, companions, message")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setStatus("no-role");
      setRows([]);
      return;
    }
    setRows((data ?? []) as RsvpRow[]);
    setStatus("ready");
  }

  useEffect(() => {
    loadForCurrentUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadForCurrentUser();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (error) throw error;
      setPw("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    setStatus("signed-out");
    setRows([]);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-cream text-olive flex items-center justify-center">
        <p className="caps text-xs text-olive/60">Lädt…</p>
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="min-h-screen bg-cream text-olive flex items-center justify-center px-5">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm border border-rose/30 bg-cream p-8 space-y-6"
        >
          <div className="text-center">
            <p className="script text-4xl text-rose">Admin</p>
            <p className="caps text-[10px] text-olive/70 mt-2">
              Maibrit &amp; Luca
            </p>
          </div>
          <label className="block">
            <span className="caps text-xs text-olive block mb-2">E-Mail</span>
            <input
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-rose/50 py-3 text-olive focus:border-bordeaux focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="caps text-xs text-olive block mb-2">Passwort</span>
            <input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-transparent border-b border-rose/50 py-3 text-olive focus:border-bordeaux focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="text-bordeaux text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full caps text-xs px-8 py-4 bg-bordeaux text-cream hover:bg-olive transition-colors disabled:opacity-60"
          >
            {busy ? "Bitte warten…" : mode === "signup" ? "Registrieren" : "Einloggen"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
            className="w-full caps text-[10px] text-olive/60 hover:text-bordeaux underline underline-offset-4"
          >
            {mode === "signup"
              ? "Ich habe bereits ein Konto"
              : "Erstmalig registrieren"}
          </button>
        </form>
      </div>
    );
  }

  if (status === "no-role") {
    return (
      <div className="min-h-screen bg-cream text-olive flex items-center justify-center px-5">
        <div className="w-full max-w-sm border border-bordeaux/30 bg-cream p-8 space-y-4 text-center">
          <p className="script text-3xl text-rose">Kein Zugriff</p>
          <p className="text-sm text-olive/80">
            Dieses Konto hat keine Admin-Berechtigung.
          </p>
          <button
            onClick={onSignOut}
            className="caps text-xs px-6 py-3 bg-bordeaux text-cream hover:bg-olive transition-colors"
          >
            Ausloggen
          </button>
        </div>
      </div>
    );
  }

  const yes = rows.filter((r) => r.attending);
  const no = rows.filter((r) => !r.attending);
  const yesGuests = yes.reduce((n, r) => n + (r.party_size || 1), 0);
  const allYesGuests: { name: string; from: string }[] = yes.flatMap((r) => {
    const list: { name: string; from: string }[] = [{ name: r.name, from: r.name }];
    if (r.companions) {
      const extras = r.companions
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const c of extras) list.push({ name: c, from: r.name });
    }
    return list;
  });

  return (
    <div className="min-h-screen bg-cream text-olive">
      <header className="border-b border-rose/20">
        <div className="mx-auto max-w-6xl px-5 py-6 flex items-center justify-between">
          <div>
            <p className="script text-3xl text-rose">Admin</p>
            <p className="caps text-[10px] text-olive/70">
              RSVP-Übersicht — Maibrit &amp; Luca
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadForCurrentUser}
              className="caps text-xs text-rose border-b border-rose pb-1 hover:text-bordeaux hover:border-bordeaux"
            >
              Aktualisieren
            </button>
            <button
              onClick={onSignOut}
              className="caps text-xs px-4 py-2 bg-bordeaux text-cream hover:bg-olive transition-colors"
            >
              Ausloggen
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 space-y-10">
        <section className="grid grid-cols-3 gap-4">
          <Stat label="Antworten gesamt" value={rows.length} />
          <Stat label="Zusagen (Personen)" value={yesGuests} accent />
          <Stat label="Absagen" value={no.length} />
        </section>

        {rows.length === 0 ? (
          <p className="text-olive/70">Noch keine Antworten eingegangen.</p>
        ) : (
          <>
            <section className="grid md:grid-cols-2 gap-6">
              <div className="border border-olive/30 bg-olive/5">
                <div className="px-5 py-3 border-b border-olive/20 flex items-baseline justify-between">
                  <p className="caps text-xs text-olive">Zusagen</p>
                  <p className="caps text-[10px] text-olive/70">
                    {yesGuests} {yesGuests === 1 ? "Person" : "Personen"} · {yes.length} {yes.length === 1 ? "Antwort" : "Antworten"}
                  </p>
                </div>
                {yes.length === 0 ? (
                  <p className="px-5 py-4 text-olive/60 text-sm">Noch keine Zusagen.</p>
                ) : (
                  <ul className="divide-y divide-olive/15">
                    {yes.map((r) => (
                      <li key={r.id} className="px-5 py-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-medium text-olive">{r.name}</p>
                          <span className="caps text-[10px] text-olive/70">
                            {r.party_size} {r.party_size === 1 ? "Person" : "Personen"}
                          </span>
                        </div>
                        {r.companions && (
                          <p className="text-sm text-olive/75 mt-1">
                            mit: {r.companions}
                          </p>
                        )}
                        {r.message && (
                          <p className="text-sm text-olive/60 mt-1 italic">
                            „{r.message}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border border-bordeaux/30 bg-bordeaux/5">
                <div className="px-5 py-3 border-b border-bordeaux/20 flex items-baseline justify-between">
                  <p className="caps text-xs text-bordeaux">Absagen</p>
                  <p className="caps text-[10px] text-olive/70">
                    {no.length} {no.length === 1 ? "Antwort" : "Antworten"}
                  </p>
                </div>
                {no.length === 0 ? (
                  <p className="px-5 py-4 text-olive/60 text-sm">Keine Absagen.</p>
                ) : (
                  <ul className="divide-y divide-bordeaux/15">
                    {no.map((r) => (
                      <li key={r.id} className="px-5 py-4">
                        <p className="font-medium text-olive">{r.name}</p>
                        {r.message && (
                          <p className="text-sm text-olive/60 mt-1 italic">
                            „{r.message}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="border border-rose/30">
              <div className="px-5 py-3 border-b border-rose/20 flex items-baseline justify-between">
                <p className="caps text-xs text-olive">Gästeliste (alle zusagenden Personen)</p>
                <p className="caps text-[10px] text-olive/70">
                  {allYesGuests.length} {allYesGuests.length === 1 ? "Gast" : "Gäste"}
                </p>
              </div>
              {allYesGuests.length === 0 ? (
                <p className="px-5 py-4 text-olive/60 text-sm">Noch keine Gäste.</p>
              ) : (
                <ol className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 px-5 py-4 list-decimal list-inside">
                  {allYesGuests.map((g, i) => (
                    <li key={`${g.from}-${i}`} className="py-1 text-olive">
                      {g.name}
                      {g.from !== g.name && (
                        <span className="text-olive/50 text-xs"> · via {g.from}</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <details className="border border-rose/20">
              <summary className="cursor-pointer px-5 py-3 caps text-xs text-olive/70 hover:text-bordeaux">
                Rohdaten anzeigen
              </summary>
              <div className="overflow-x-auto border-t border-rose/20">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-rose/30">
                    <tr className="text-left caps text-[10px] text-olive/70">
                      <th className="px-4 py-3">Datum</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Antwort</th>
                      <th className="px-4 py-3">Pers.</th>
                      <th className="px-4 py-3">Begleitung</th>
                      <th className="px-4 py-3">Nachricht</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t border-rose/15 align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-olive/70">
                          {new Date(r.created_at).toLocaleString("de-DE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3">
                          {r.attending ? (
                            <span className="caps text-[10px] px-2 py-1 bg-olive text-cream">Zusage</span>
                          ) : (
                            <span className="caps text-[10px] px-2 py-1 bg-bordeaux text-cream">Absage</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{r.party_size}</td>
                        <td className="px-4 py-3 whitespace-pre-wrap text-olive/80">{r.companions || "—"}</td>
                        <td className="px-4 py-3 whitespace-pre-wrap text-olive/80">{r.message || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border p-6 ${
        accent ? "border-bordeaux/40 bg-bordeaux/5" : "border-rose/30 bg-cream"
      }`}
    >
      <p className="caps text-[10px] text-olive/70">{label}</p>
      <p
        className={`body text-5xl font-light mt-2 tabular-nums ${
          accent ? "text-bordeaux" : "text-rose"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
