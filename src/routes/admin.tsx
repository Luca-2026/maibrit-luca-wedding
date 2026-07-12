import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  adminLock,
  adminStatus,
  adminUnlock,
  listRsvps,
  type RsvpRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Maibrit & Luca" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminPage() {
  const status = useServerFn(adminStatus);
  const unlock = useServerFn(adminUnlock);
  const lock = useServerFn(adminLock);
  const list = useServerFn(listRsvps);

  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await list();
      setUnlocked(res.unlocked);
      setRows(res.rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const s = await status();
      setUnlocked(s.unlocked);
      if (s.unlocked) await refresh();
    })().catch((e) => setError((e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await unlock({ data: { password: pw } });
      if (!res.ok) {
        setError("Passwort stimmt nicht.");
      } else {
        setPw("");
        await refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onLock() {
    await lock();
    setUnlocked(false);
    setRows([]);
  }

  if (unlocked === null) {
    return (
      <div className="min-h-screen bg-cream text-olive flex items-center justify-center">
        <p className="caps text-xs text-olive/60">Lädt…</p>
      </div>
    );
  }

  if (!unlocked) {
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
            <span className="caps text-xs text-olive block mb-2">Passwort</span>
            <input
              type="password"
              autoFocus
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
            disabled={loading}
            className="w-full caps text-xs px-8 py-4 bg-bordeaux text-cream hover:bg-olive transition-colors disabled:opacity-60"
          >
            {loading ? "Prüfe…" : "Einloggen"}
          </button>
        </form>
      </div>
    );
  }

  const yes = rows.filter((r) => r.attending);
  const no = rows.filter((r) => !r.attending);
  const yesGuests = yes.reduce((n, r) => n + (r.party_size || 1), 0);

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
              onClick={refresh}
              className="caps text-xs text-rose border-b border-rose pb-1 hover:text-bordeaux hover:border-bordeaux"
            >
              Aktualisieren
            </button>
            <button
              onClick={onLock}
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

        {error && (
          <p role="alert" className="text-bordeaux text-sm">
            {error}
          </p>
        )}

        {loading && (
          <p className="caps text-xs text-olive/60">Lade Antworten…</p>
        )}

        {rows.length === 0 ? (
          <p className="text-olive/70">Noch keine Antworten eingegangen.</p>
        ) : (
          <div className="overflow-x-auto border border-rose/30">
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
                  <tr
                    key={r.id}
                    className="border-t border-rose/15 align-top"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-olive/70">
                      {new Date(r.created_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      {r.attending ? (
                        <span className="caps text-[10px] px-2 py-1 bg-olive text-cream">
                          Zusage
                        </span>
                      ) : (
                        <span className="caps text-[10px] px-2 py-1 bg-bordeaux text-cream">
                          Absage
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.party_size}</td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-olive/80">
                      {r.companions || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-olive/80">
                      {r.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        className={`display text-4xl mt-2 ${
          accent ? "text-bordeaux" : "text-rose"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
