/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.0.0
  Pēdējais atjauninājums: 2026-05-22
  Mērķis: Izveidot PostgreSQL tabulas pasākumu pārvaldības sistēmai.

  Faila apraksts:
  Šis SQL fails izveido visas datubāzes tabulas,
  kas nepieciešamas pasākumu pārvaldības sistēmai.
  Tabulas tiek izmantotas REST API līmenī datu glabāšanai un izgūšanai.
*/

--------------------------------------------------
-- Tabula: pasākumu veidi
-- Glabā pasākumu kategorijas (piem., Koncerts, Konference, Sporta pasākums)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS event_types (
  -- Unikāls pasākuma veida identifikators
  id SERIAL PRIMARY KEY,

  -- Pasākuma veida nosaukums
  name VARCHAR(100) NOT NULL
);

--------------------------------------------------
-- Tabula: norises vietas
-- Glabā informāciju par vietām, kur notiek pasākumi
--------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  -- Unikāls norises vietas identifikators
  id SERIAL PRIMARY KEY,

  -- Norises vietas nosaukums
  name VARCHAR(150) NOT NULL,

  -- Norises vietas adrese
  address VARCHAR(200) NOT NULL
);

--------------------------------------------------
-- Tabula: pasākumi
-- Galvenā tabula, kas satur informāciju par katru pasākumu
--------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  -- Unikāls pasākuma identifikators
  id SERIAL PRIMARY KEY,

  -- Pasākuma nosaukums
  title VARCHAR(150) NOT NULL,

  -- Pasākuma datums un laiks
  date_time TIMESTAMP NOT NULL,

  -- Pasākuma cena (2 cipari aiz komata)
  price NUMERIC(10, 2) NOT NULL,

  -- Detalizēts pasākuma apraksts
  description TEXT NOT NULL,

  -- Saite uz pasākuma veidu (ārējā atslēga)
  event_type_id INTEGER NOT NULL REFERENCES event_types(id),

  -- Saite uz norises vietu (ārējā atslēga)
  location_id INTEGER NOT NULL REFERENCES locations(id)
);

--------------------------------------------------
-- Tabula: pasākuma attēli
-- Glabā pasākumu attēlus (galveno un papildu)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS event_images (
  -- Unikāls attēla identifikators
  id SERIAL PRIMARY KEY,

  -- Saite uz pasākumu, kuram pieder attēls
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Attēla faila ceļš serverī
  file_path VARCHAR(255) NOT NULL,

  -- Norāda, vai attēls ir galvenais
  is_main BOOLEAN NOT NULL DEFAULT FALSE,

  -- Attēla augšupielādes datums un laiks
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
