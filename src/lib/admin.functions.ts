import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: String(data?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!expected) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
    if (!sessionSecret) throw new Error("ADMIN_SESSION_SECRET ist nicht gesetzt.");

    const inputHash = createHash("sha256").update(data.password, "utf8").digest();
    const expectedHash = createHash("sha256").update(expected, "utf8").digest();
    const matches = timingSafeEqual(inputHash, expectedHash);

    if (!data.password || !matches) {
      return { ok: false as const };
    }
    const session = await useSession<AdminSession>({
      password: sessionSecret,
      name: "mul-admin",
      maxAge: 60 * 60 * 8,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
        path: "/",
      },
    });
    await session.update({ unlocked: true });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("rsvps")
      .select("id, created_at, name, attending, party_size, companions, message")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { ok: true as const, rows: (rows ?? []) as RsvpRow[] };
  });

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) throw new Error("ADMIN_SESSION_SECRET ist nicht gesetzt.");
  const session = await useSession<AdminSession>({
    password: sessionSecret,
    name: "mul-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      path: "/",
    },
  });
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) throw new Error("ADMIN_SESSION_SECRET ist nicht gesetzt.");
  const session = await useSession<AdminSession>({
    password: sessionSecret,
    name: "mul-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      path: "/",
    },
  });
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
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) throw new Error("ADMIN_SESSION_SECRET ist nicht gesetzt.");
  const session = await useSession<AdminSession>({
    password: sessionSecret,
    name: "mul-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      path: "/",
    },
  });
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
