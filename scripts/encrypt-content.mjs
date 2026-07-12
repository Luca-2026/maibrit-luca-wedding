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
    { time: "Ab 15.00", title: "ANKOMMEN IN DER LOCATION", where: "Hochzeitsfeier in der Caspar-David-Friedrich-Straße in Bonn-Ückesdorf" },
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
      addressLines: ["Caspar-David-Friedrich-Straße 2", "53125 Bonn-Ückesdorf"],
      maps: "https://maps.google.com/?q=Caspar-David-Friedrich-Stra%C3%9Fe+2,+53125+Bonn",
      note: "Parken in den umliegenden Seitenstraßen.",
    },
  ],
  hotels: [
    { name: "Aparthotel Kottenforst", description: "Am nächsten zur Feier, ruhig am Kottenforst. Apartments mit eigener Küche.", distance: "ca. 2 km zur Location", url: "https://www.google.com/search?kgmid=/g/1tffymr6&hl=de-DE&q=Aparthotel+Kottenforst&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=0283c22257fa060d&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "V-Hotel", description: "Ausgefallenes Design-Hotel am Waldrand, u. a. mit Baumhaus-Zimmern.", distance: "ca. 4 km zur Location", url: "https://www.google.com/search?client=safari&hs=BWu&sca_esv=fb69676b9d29ec17&cs=0&output=search&kgmid=/g/11b6gg3jgs&q=V-Hotel&shem=epsd1,ltae,rimspwouoe&shndl=30&source=sh/x/loc/uni/m1/1&kgs=c3ac610014de3034&utm_source=epsd1,ltae,rimspwouoe,sh/x/loc/uni/m1/1" },
    { name: "Hotel Nettekoven", description: "Familiengeführt in Duisdorf, sehr sauber und persönlich.", distance: "ca. 5 km zur Location", url: "https://www.google.com/search?kgmid=/g/1tctky0m&hl=de-DE&q=Hotel+Nettekoven&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=6ff0b3fcbe44a6d0&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "Platzhirsch Hotel", description: "Renoviert und zentral in Duisdorf, Restaurants direkt vor der Tür.", distance: "ca. 4 km zur Location", url: "https://www.google.com/search?kgmid=/g/11j50ld301&hl=de-DE&q=Platzhirsch+Hotel&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=a03df7407529b292&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "B&B Hotel Bonn-West", description: "Günstig und unkompliziert, verschiedene Zimmertypen inkl. Familienzimmer.", distance: "ca. 7 km zur Location", url: "https://www.google.com/search?kgmid=/g/12ml2ypyk&hl=de-DE&q=B%26B+HOTEL+Bonn-West&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=ec27b4ff37e7d097&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
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

