import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env.ADMIN_SESSION_SECRET!,
    name: "mul-admin",
    maxAge: 60 * 60 * 8, // 8 Stunden
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: String(data?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
    if (!data.password || !passwordMatches(data.password, expected)) {
      return { ok: false as const };
    }
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { unlocked: !!session.data.unlocked };
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

export const listRsvps = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.unlocked) {
    return { unlocked: false as const, rows: [] as RsvpRow[] };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("rsvps")
    .select("id, created_at, name, attending, party_size, companions, message")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { unlocked: true as const, rows: (data ?? []) as RsvpRow[] };
});
