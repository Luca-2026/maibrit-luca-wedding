// Verschlüsselt den Inhalt für src/lib/protected-content.ts.
// Nutzung:  PW='dein-passwort' node scripts/encrypt-content.mjs
// Danach die JSON-Ausgabe in PROTECTED_PAYLOAD einsetzen.

import { webcrypto as crypto } from "node:crypto";

const PASSWORD = process.env.PW || "diesandhoffs";

const content = {
  ablauf: [
    { time: "13:45", title: "ANKOMMEN DER GÄSTE", where: "Bitte 15 Minuten vor der Trauung vor Ort sein" },
    { time: "14:00", title: "STANDESAMTLICHE TRAUUNG", where: "Kulturzentrum Köllenhof, Wachtberg-Ließem" },
    { time: "14:30", title: "SEKTEMPFANG", where: "Kulturzentrum Köllenhof, Wachtberg-Ließem" },
    { time: "Ab 15.00", title: "ANKOMMEN IN DER LOCATION", where: "Hochzeitsfeier in der Caspar-David-Friedrich-Straße in Bonn Ückesdorf" },
    { time: "Ab 16:00", title: "KAFFEE & HOCHZEITSTORTE", where: "" },
    { time: "Ab 18:00", title: "ABENDESSEN", where: "" },
    { time: "Ab 19:00", title: "PARTY", where: "" },
  ],
  locations: [
    {
      label: "Trauung & Sektempfang",
      name: "Kulturzentrum Köllenhof",
      addressLines: ["Köllenhofweg", "53343 Wachtberg-Ließem"],
      maps: "https://maps.google.com/?q=Kulturzentrum+Köllenhof+Wachtberg-Ließem",
      note: "Bitte 15 Minuten vor Beginn vor Ort sein. Parkplätze sind vor Ort begrenzt — Fahrgemeinschaften werden empfohlen.",
    },
    {
      label: "Party — ab 15:30",
      name: "Party Bonn-Ückesdorf",
      addressLines: ["Kaspar-David-Friedrich-Straße 2", "53127 Bonn-Ückesdorf"],
      maps: "https://maps.google.com/?q=Kaspar-David-Friedrich-Stra%C3%9Fe+2,+53127+Bonn",
      note: "Parken in den umliegenden Seitenstraßen.",
    },
  ],
  hotels: [
    { name: "Aparthotel Kottenforst", description: "Am nächsten zur Feier, ruhig am Kottenforst. Apartments mit eigener Küche.", distance: "ca. 2 km zur Location", url: "https://www.kottenforst.de/" },
    { name: "V-Hotel", description: "Ausgefallenes Design-Hotel am Waldrand, u. a. mit Baumhaus-Zimmern.", distance: "ca. 4 km zur Location", url: "https://v-hotel.de/" },
    { name: "Hotel Nettekoven", description: "Familiengeführt in Duisdorf, sehr sauber und persönlich.", distance: "ca. 4 km zur Location", url: "https://hotel-nettekoven.de/" },
    { name: "Platzhirsch Hotel", description: "Renoviert und zentral in Duisdorf, Restaurants direkt vor der Tür.", distance: "ca. 4 km zur Location", url: "https://www.platzhirschhotel.de/" },
    { name: "B&B Hotel Bonn-West", description: "Günstig und unkompliziert, verschiedene Zimmertypen inkl. Familienzimmer.", distance: "ca. 7 km zur Location", url: "https://www.hotel-bb.com/de/hotel/bonn-west" },
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

