// Verschlüsselt den Inhalt für src/lib/protected-content.ts.
// Nutzung:  PW='dein-passwort' node scripts/encrypt-content.mjs
// Danach die JSON-Ausgabe in PROTECTED_PAYLOAD einsetzen.

import { webcrypto as crypto } from "node:crypto";

const PASSWORD = process.env.PW || "diesandhoffs";

const content = {
  ablauf: [
    { 
      time: "13:45", 
      title: "ANKUNFT STANDESAMT", 
      where: "Kulturzentrum Köllenhof, Marienforster Weg 14,\u00a0\n53343 Wachtberg-Ließem\n" 
    },
    { 
      time: "14:00", 
      title: "STANDESAMTLICHE TRAUUNG", 
      where: "Im Köllenhof" 
    },
    { 
      time: "14:30", 
      title: "SEKTEMPFANG", 
      where: "Im Köllenhof" 
    },
    { 
      time: "15:30", 
      title: "ANKUNFT LOCATION", 
      where: "Hochzeitsfeier in der Caspar-David-Friedrich-Straße 2,\u00a0\n53125 Bonn-Ückesdorf\n" 
    },
    { time: "16:30", title: "KAFFEE & HOCHZEITSTORTE", where: "" },
    { time: "18:30", title: "ABENDESSEN", where: "" },
    { time: "20:00", title: "PARTY", where: "" },
  ],
  locations: [
    {
      label: "Trauung & Sektempfang",
      name: "Kulturzentrum Köllenhof",
      addressLines: ["Marienforster Weg 14", "53343 Wachtberg-Ließem"],
      maps: "https://maps.google.com/?q=Kulturzentrum+Köllenhof+Wachtberg-Ließem",
      note: "Bitte 15 Minuten vor Beginn vor Ort sein.\u00a0\nParkplätze sind vor Ort begrenzt.\n\n",
    },
    {
      label: "HOCHZEITSFEIER — AB 15:30",
      name: "Party Bonn-Ückesdorf",
      addressLines: ["Caspar-David-Friedrich-Straße 2", "53125 Bonn-Ückesdorf"],
      maps: "https://maps.google.com/?q=Caspar-David-Friedrich-Stra%C3%9Fe+2,+53125+Bonn",
      note: "Parken in den umliegenden Seitenstraßen\nmöglich.\n\n",
    },
  ],
  hotels: [
    { name: "Aparthotel Kottenforst", description: "\n", distance: "ca. 2 km zur Location", url: "https://www.google.com/search?kgmid=/g/1tffymr6&hl=de-DE&q=Aparthotel+Kottenforst&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=0283c22257fa060d&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "V-Hotel", description: "\n", distance: "ca. 4 km zur Location", url: "https://www.google.com/search?client=safari&hs=BWu&sca_esv=fb69676b9d29ec17&cs=0&output=search&kgmid=/g/11b6gg3jgs&q=V-Hotel&shem=epsd1,ltae,rimspwouoe&shndl=30&source=sh/x/loc/uni/m1/1&kgs=c3ac610014de3034&utm_source=epsd1,ltae,rimspwouoe,sh/x/loc/uni/m1/1" },
    { name: "Hotel Nettekoven", description: "\n", distance: "ca. 5 km zur Location", url: "https://www.google.com/search?kgmid=/g/1tctky0m&hl=de-DE&q=Hotel+Nettekoven&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=6ff0b3fcbe44a6d0&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "Platzhirsch Hotel", description: "\n", distance: "ca. 4 km zur Location", url: "https://www.google.com/search?kgmid=/g/11j50ld301&hl=de-DE&q=Platzhirsch+Hotel&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=a03df7407529b292&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
    { name: "B&B Hotel Bonn-West", description: "\n", distance: "ca. 7 km zur Location", url: "https://www.google.com/search?kgmid=/g/12ml2ypyk&hl=de-DE&q=B%26B+HOTEL+Bonn-West&shem=epsd1,rimspwouoe&shndl=17&source=sh/x/kp/osrp/m5/1&kgs=ec27b4ff37e7d097&utm_source=epsd1,rimspwouoe,sh/x/kp/osrp/m5/1" },
  ],
  trauzeugen: [
    { name: "Trauzeugin", role: "Trauzeugin von Maibrit", note: "" },
    { name: "Trauzeuge", role: "Trauzeuge von Luca", note: "" },
  ],
  rsvpDeadline: "15. September 2026",
  contactEmail: "maibritbreuer@gmail.com",
  contactPhone: "+49 000 0000000",
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
