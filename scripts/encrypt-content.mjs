// Verschlüsselt den Inhalt für src/lib/protected-content.ts.
// Nutzung:  PW='dein-passwort' node scripts/encrypt-content.mjs
// Danach die JSON-Ausgabe in PROTECTED_PAYLOAD einsetzen.

import { webcrypto as crypto } from "node:crypto";

const PASSWORD = process.env.PW || "diesandhoffs";

const content = {
  ablauf: [
    { time: "13:45", title: "Ankommen der Gäste", where: "Bitte 15 Minuten vor der Trauung vor Ort sein" },
    { time: "14:00", title: "Standesamtliche Trauung", where: "Kulturzentrum Köllenhof, Wachtberg-Ließem" },
    { time: "16:30", title: "Gartenfest", where: "Kaspar-David-Friedrich-Straße 2, Bonn-Ückesdorf" },
  ],
  locations: [
    {
      label: "Trauung — 14:00",
      name: "Kulturzentrum Köllenhof",
      addressLines: ["Köllenhofweg", "53343 Wachtberg-Ließem"],
      maps: "https://maps.google.com/?q=Kulturzentrum+Köllenhof+Wachtberg-Ließem",
      note: "Bitte 15 Minuten vor Beginn vor Ort sein. Parkplätze sind vor Ort begrenzt — Fahrgemeinschaften werden empfohlen.",
    },
    {
      label: "Gartenfest — ab 16:30",
      name: "Gartenfest Bonn-Ückesdorf",
      addressLines: ["Kaspar-David-Friedrich-Straße 2", "53127 Bonn-Ückesdorf"],
      maps: "https://maps.google.com/?q=Kaspar-David-Friedrich-Stra%C3%9Fe+2,+53127+Bonn",
      note: "Parken in den umliegenden Seitenstraßen.",
    },
  ],
  hotels: [
    { name: "[Hotel 1]", distance: "ca. 5 km zur Location", url: "#" },
    { name: "[Hotel 2]", distance: "ca. 8 km zur Location", url: "#" },
    { name: "[Pension / B&B]", distance: "ca. 3 km zur Location", url: "#" },
  ],
  rsvpDeadline: "15. September 2026",
  contactEmail: "maibritbreuer@gmail.com",
};

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const iterations = 250000;

const baseKey = await crypto.subtle.importKey(
  "raw",
  enc.encode(PASSWORD),
  "PBKDF2",
  false,
  ["deriveKey"],
);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"],
);
const ct = new Uint8Array(
  await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(content))),
);
const b64 = (u8) => Buffer.from(u8).toString("base64");

console.log(
  JSON.stringify(
    { salt: b64(salt), iv: b64(iv), ciphertext: b64(ct), iterations },
    null,
    2,
  ),
);
