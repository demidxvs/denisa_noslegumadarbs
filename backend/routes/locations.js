/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.0.0
  Pēdējais atjauninājums: 2026-05-22
  Mērķis: Nodrošināt norises vietu REST API maršrutus.

  Faila apraksts:
  Norises vietu (locations) REST API maršruti.
*/

const express = require("express");
const pool = require("../db");

const router = express.Router();

// Funkcija: atgriež visas norises vietas no datubāzes.
router.get("/", async (req, res) => {
  try {
    // Iegūst visas norises vietas, sakārtotas pēc nosaukuma
    const result = await pool.query(
      "SELECT id, name, address FROM locations ORDER BY name ASC"
    );

    // Nosūta rezultātu kā JSON
    res.json(result.rows);
  } catch (error) {
    // Kļūdas gadījumā atgriež servera kļūdu
    res.status(500).json({ error: "Neizdevās iegūt norises vietas." });
  }
});

// Funkcija: pievieno jaunu norises vietu.
router.post("/", async (req, res) => {
  try {
    // Iegūst ievades datus no pieprasījuma
    const { name, address } = req.body;

    // Norises vietas nosaukuma validācija
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      res.status(400).json({ error: "Norises vietas nosaukums nav korekts." });
      return;
    }

    // Norises vietas adreses validācija
    if (!address || address.trim().length < 5 || address.trim().length > 150) {
      res.status(400).json({ error: "Norises vietas adrese nav korekta." });
      return;
    }

    // Ievieto jaunu norises vietu datubāzē
    const result = await pool.query(
      "INSERT INTO locations (name, address) VALUES ($1, $2) RETURNING id, name, address",
      [name.trim(), address.trim()]
    );

    // Atgriež izveidoto norises vietu
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Kļūdas gadījumā
    res.status(500).json({ error: "Neizdevās pievienot norises vietu." });
  }
});

// Funkcija: rediģē esošu norises vietu pēc ID.
router.put("/:id", async (req, res) => {
  try {
    // Iegūst norises vietas ID no URL
    const { id } = req.params;

    // Iegūst jaunos datus no pieprasījuma
    const { name, address } = req.body;

    // Nosaukuma validācija
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      res.status(400).json({ error: "Norises vietas nosaukums nav korekts." });
      return;
    }

    // Adreses validācija
    if (!address || address.trim().length < 5 || address.trim().length > 150) {
      res.status(400).json({ error: "Norises vietas adrese nav korekta." });
      return;
    }

    // Atjaunina norises vietas datus datubāzē
    const result = await pool.query(
      "UPDATE locations SET name = $1, address = $2 WHERE id = $3 RETURNING id, name, address",
      [name.trim(), address.trim(), id]
    );

    // Ja norises vieta ar šādu ID netika atrasta
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Norises vieta nav atrasta." });
      return;
    }

    // Atgriež atjaunināto norises vietu
    res.json(result.rows[0]);
  } catch (error) {
    // Kļūdas gadījumā
    res.status(500).json({ error: "Neizdevās rediģēt norises vietu." });
  }
});

// Router eksports izmantošanai servera galvenajā failā
module.exports = router;
