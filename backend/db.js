/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.0.0
  Pēdējais atjauninājums: 2026-05-22
  Mērķis: Izveidot PostgreSQL datubāzes pieslēgumu backend vajadzībām.

  Faila apraksts:
  Šis fails ir atbildīgs par PostgreSQL datubāzes pieslēguma izveidi.
  Izveidotais savienojums (pool) tiek eksportēts un izmantots visos backend maršrutos.
*/

require("dotenv").config(); 
// Ielādē vides mainīgos no .env faila (DATABASE_URL, PGHOST, PGUSER u.c.)

const { Pool } = require("pg"); 
// Importē PostgreSQL klienta Pool klasi savienojumu pārvaldībai

// Funkcija:
// Izveido PostgreSQL savienojumu baseinu (connection pool),
// kas nodrošina efektīvu vairāku vaicājumu apstrādi.
const pool = new Pool({
  // Galvenais pieslēguma parametrs – pilna DB adrese
  connectionString: process.env.DATABASE_URL,

  // Rezerves variants: host (ja DATABASE_URL netiek lietots)
  host: process.env.PGHOST || "localhost",

  // Rezerves variants: ports (pēc noklusējuma PostgreSQL izmanto 5432)
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,

  // Rezerves variants: lietotājvārds datubāzei
  user: process.env.PGUSER || "postgres",

  // Rezerves variants: parole datubāzei
  password: process.env.PGPASSWORD || "postgres",

  // Rezerves variants: datubāzes nosaukums
  database: process.env.PGDATABASE || "events_db",
});

// Eksportē pool objektu, lai to varētu izmantot citos backend failos
// (piemēram, API maršrutos un vaicājumos)
module.exports = pool;
