/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.0.0
  Pēdējais atjauninājums: 2026-05-22
  Mērķis: Inicializēt Express serveri un piesaistīt REST API maršrutus.

  Faila apraksts:
  Šis fails inicializē Express serveri,
  pieslēdz nepieciešamās vidusprogrammas (middleware)
  un piesaista REST API maršrutus pasākumu sistēmai.
*/

require("dotenv").config();
// Ielādē vides mainīgos no .env faila (piem., PORT, DATABASE_URL)

const express = require("express");
// Importē Express ietvaru backend servera izveidei

const cors = require("cors");
// Importē CORS, lai atļautu piekļuvi API no front-end puses

const path = require("path");
// Importē path moduli failu ceļu drošai apstrādei

// Importē atsevišķus maršrutu failus
const eventsRouter = require("./routes/events"); 
// Maršruti pasākumu sarakstam, izveidei, rediģēšanai un dzēšanai

const eventTypesRouter = require("./routes/event_types"); 
// Maršruti pasākumu veidu iegūšanai un pārvaldībai

const locationsRouter = require("./routes/locations"); 
// Maršruti norises vietu iegūšanai un pārvaldībai

const app = express();
// Izveido Express aplikācijas instanci

// Vidusprogramma:
// Atļauj pieprasījumus no citām izcelsmēm (front-end aplikācijām)
app.use(cors());

// Vidusprogramma:
// Nodrošina JSON datu nolasīšanu no POST/PUT pieprasījumiem
app.use(express.json());

// Vidusprogramma:
// Padara uploads mapi publiski pieejamu attēlu ielādei
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Maršrutu piesaiste:
// Visi /events pieprasījumi tiek apstrādāti eventsRouter failā
app.use("/events", eventsRouter);

// Visi /event_types pieprasījumi tiek apstrādāti eventTypesRouter failā
app.use("/event_types", eventTypesRouter);

// Visi /locations pieprasījumi tiek apstrādāti locationsRouter failā
app.use("/locations", locationsRouter);

// Testa maršruts:
// Ļauj pārbaudīt, vai serveris darbojas korekti
app.get("/", (req, res) => {
  res.json({ message: "Pasākumu pārvaldības API darbojas." });
});

// Servera ports tiek ņemts no .env faila vai pēc noklusējuma 3000
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Funkcija:
// Palaiž Express serveri un sāk klausīties uz norādītā porta
app.listen(port, () => {
  console.log(`Serveris klausās uz porta ${port}`);
});
