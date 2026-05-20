// Faila apraksts:
// REST API maršruti pasākumu veidu (event_types) iegūšanai, pievienošanai un rediģēšanai.
// Šis fails nodrošina CRUD funkcionalitāti pasākumu veidiem.

const express = require("express"); // Express ietvars HTTP maršrutu veidošanai
const pool = require("../db"); // PostgreSQL savienojuma baseins darbam ar datubāzi

const router = express.Router(); // Atsevišķs router event_types maršrutiem

// Maršruts: GET /event_types
// Funkcija: atgriež visus pasākumu veidus, sakārtotus alfabētiski pēc nosaukuma.
router.get("/", async (req, res) => {
  try {
    // SQL vaicājums pasākumu veidu iegūšanai
    const result = await pool.query(
      "SELECT id, name FROM event_types ORDER BY name ASC"
    );

    // Atgriež rezultātu JSON formātā
    res.json(result.rows);
  } catch (error) {
    // Kļūdas apstrāde, ja datubāzes vaicājums neizdodas
    res.status(500).json({ error: "Neizdevās iegūt pasākumu veidus." });
  }
});

// Maršruts: POST /event_types
// Funkcija: pievieno jaunu pasākumu veidu datubāzē.
router.post("/", async (req, res) => {
  try {
    const { name } = req.body; // Jaunā pasākumu veida nosaukums no pieprasījuma

    // Ievades validācija: nosaukumam jābūt no 3 līdz 50 simboliem
    if (!name || name.trim().length < 3 || name.trim().length > 50) {
      res.status(400).json({ error: "Pasākuma veida nosaukums nav korekts." });
      return;
    }

    // SQL vaicājums jauna pasākumu veida ievietošanai
    const result = await pool.query(
      "INSERT INTO event_types (name) VALUES ($1) RETURNING id, name",
      [name.trim()]
    );

    // Atgriež izveidoto pasākumu veidu
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Kļūdas apstrāde, ja ievietošana neizdodas
    res.status(500).json({ error: "Neizdevās pievienot pasākumu veidu." });
  }
});

// Maršruts: PUT /event_types/:id
// Funkcija: rediģē esoša pasākumu veida nosaukumu pēc ID.
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Pasākumu veida ID no URL
    const { name } = req.body; // Jaunais nosaukums no pieprasījuma

    // Ievades validācija: nosaukumam jābūt korektam
    if (!name || name.trim().length < 3 || name.trim().length > 50) {
      res.status(400).json({ error: "Pasākuma veida nosaukums nav korekts." });
      return;
    }

    // SQL vaicājums pasākumu veida atjaunošanai
    const result = await pool.query(
      "UPDATE event_types SET name = $1 WHERE id = $2 RETURNING id, name",
      [name.trim(), id]
    );

    // Ja pasākumu veids ar norādīto ID nav atrasts
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pasākuma veids nav atrasts." });
      return;
    }

    // Atgriež atjaunoto pasākumu veidu
    res.json(result.rows[0]);
  } catch (error) {
    // Kļūdas apstrāde, ja atjaunošana neizdodas
    res.status(500).json({ error: "Neizdevās rediģēt pasākumu veidu." });
  }
});

// Eksportē router, lai to varētu izmantot server.js failā
module.exports = router;