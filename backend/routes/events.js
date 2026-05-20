// Faila apraksts:
// REST API maršruti pasākumu (events) iegūšanai un izveidei.
// Šis fails apstrādā pasākumu sarakstu, viena pasākuma ielādi un jauna pasākuma pievienošanu,
// kā arī attēlu piesaisti un rezerves attēlu ģenerēšanu.

const express = require("express"); // Express ietvars HTTP maršrutiem
const path = require("path"); // Darbam ar failu ceļiem
const multer = require("multer"); // Failu augšupielādes apstrādei
const pool = require("../db"); // PostgreSQL savienojums

const router = express.Router(); // Atsevišķs router pasākumu maršrutiem

// Palīgfunkcija:
// Izveido rezerves attēlu URL, ja pasākumam nav augšupielādētu attēlu.
function buildFallbackImages(eventId) {
  const main = `https://picsum.photos/seed/event-${eventId}/900/600`; // Galvenais attēls
  const extra = [
    `https://picsum.photos/seed/event-${eventId}-1/600/400`,
    `https://picsum.photos/seed/event-${eventId}-2/600/400`,
    `https://picsum.photos/seed/event-${eventId}-3/600/400`,
  ];
  const small = `https://picsum.photos/seed/event-${eventId}-thumb/400/260`; // Mazais attēls
  return { image_main: main, image_extra: extra, image_small: small };
}

// Palīgfunkcija:
// Izveido pilnu attēla URL no saglabātā faila ceļa.
function buildImageUrl(baseUrl, filePath) {
  if (!filePath) {
    return "";
  }
  // Ja ceļš jau ir pilns URL, atgriež to bez izmaiņām
  if (filePath.startsWith("http")) {
    return filePath;
  }
  // Pretējā gadījumā pievieno servera adresi
  return `${baseUrl}${filePath}`;
}

// Palīgfunkcija:
// Pievieno attēlu laukus pasākuma objektam (galveno, papildu un mazo attēlu).
function attachImages(event, baseUrl) {
  const images = Array.isArray(event.images) ? event.images : [];

  // Ja pasākumam nav attēlu – izmanto rezerves attēlus
  if (images.length === 0) {
    return { ...event, ...buildFallbackImages(event.id) };
  }

  // Galvenais attēls – atzīmētais kā galvenais vai pirmais sarakstā
  const mainImage = images.find((img) => img.is_main) || images[0];

  // Papildu attēli (bez galvenā)
  const extraImages = images
    .filter((img) => img.id !== mainImage.id)
    .map((img) => buildImageUrl(baseUrl, img.file_path));

  // Ja papildu attēlu ir mazāk par 3 – pievieno rezerves attēlus
  while (extraImages.length < 3) {
    extraImages.push(
      `https://picsum.photos/seed/event-${event.id}-${extraImages.length}/600/400`
    );
  }

  return {
    ...event,
    image_main: buildImageUrl(baseUrl, mainImage.file_path),
    image_small: buildImageUrl(baseUrl, mainImage.file_path),
    image_extra: extraImages.slice(0, 3),
  };
}

// Failu augšupielādes konfigurācija (multer)
const storage = multer.diskStorage({
  // Mape, kurā tiek saglabāti attēli
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  // Faila nosaukuma ģenerēšana
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// Multer instances konfigurācija (max 6 faili, max 5MB katram)
const upload = multer({
  storage,
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
});

// Maršruts: GET /events
// Funkcija: iegūst visu pasākumu sarakstu ar piesaistītiem veidiem, vietām un attēliem.
router.get("/", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // SQL vaicājums pasākumu un to saistīto datu iegūšanai
    const result = await pool.query(
      `SELECT e.id, e.title, e.date_time, e.price, e.description,
              e.event_type_id, e.location_id,
              et.name AS event_type_name,
              l.name AS location_name,
              l.address AS location_address,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ei.id,
                    'file_path', ei.file_path,
                    'is_main', ei.is_main,
                    'created_at', ei.created_at
                  )
                  ORDER BY ei.is_main DESC, ei.created_at ASC
                ) FILTER (WHERE ei.id IS NOT NULL),
                '[]'
              ) AS images
       FROM events e
       JOIN event_types et ON e.event_type_id = et.id
       JOIN locations l ON e.location_id = l.id
       LEFT JOIN event_images ei ON e.id = ei.event_id
       GROUP BY e.id, et.name, l.name, l.address
       ORDER BY e.date_time ASC`
    );

    // Pievieno attēlu laukus katram pasākumam
    const data = result.rows.map((row) => attachImages(row, baseUrl));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Neizdevās iegūt pasākumus." });
  }
});

// Maršruts: GET /events/:id
// Funkcija: iegūst viena pasākuma detalizētu informāciju pēc ID.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // SQL vaicājums konkrēta pasākuma iegūšanai
    const result = await pool.query(
      `SELECT e.id, e.title, e.date_time, e.price, e.description,
              e.event_type_id, e.location_id,
              et.name AS event_type_name,
              l.name AS location_name,
              l.address AS location_address,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ei.id,
                    'file_path', ei.file_path,
                    'is_main', ei.is_main,
                    'created_at', ei.created_at
                  )
                  ORDER BY ei.is_main DESC, ei.created_at ASC
                ) FILTER (WHERE ei.id IS NOT NULL),
                '[]'
              ) AS images
       FROM events e
       JOIN event_types et ON e.event_type_id = et.id
       JOIN locations l ON e.location_id = l.id
       LEFT JOIN event_images ei ON e.id = ei.event_id
       WHERE e.id = $1
       GROUP BY e.id, et.name, l.name, l.address`,
      [id]
    );

    // Ja pasākums nav atrasts
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pasākums nav atrasts." });
      return;
    }

    // Atgriež pasākumu ar piesaistītiem attēliem
    res.json(attachImages(result.rows[0], baseUrl));
  } catch (error) {
    res.status(500).json({ error: "Neizdevās iegūt pasākumu." });
  }
});

// Maršruts: POST /events
// Funkcija: izveido jaunu pasākumu datubāzē.
router.post("/", async (req, res) => {
  try {
    const {
      title,
      date_time,
      price,
      description,
      event_type_id,
      location_id,
    } = req.body;

    // SQL vaicājums jauna pasākuma izveidei
    const result = await pool.query(
      `INSERT INTO events (title, date_time, price, description, event_type_id, location_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, date_time, price, description, event_type_id, location_id]
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.status(201).json(attachImages(result.rows[0], baseUrl));
  } catch (error) {
    res.status(500).json({ error: "Neizdevās izveidot pasākumu." });
  }
});

// Router eksports server.js izmantošanai
module.exports = router;
// Funkcija: atjaunina esoša pasākuma datus pēc ID.
router.put("/:id", async (req, res) => {
  try {
    // Iegūst pasākuma ID no URL
    const { id } = req.params;

    // Iegūst jaunos datus no pieprasījuma ķermeņa
    const { title, date_time, price, description, event_type_id, location_id } = req.body;

    // Atjaunina pasākuma datus datubāzē
    const result = await pool.query(
      `UPDATE events
       SET title = $1, date_time = $2, price = $3, description = $4,
           event_type_id = $5, location_id = $6
       WHERE id = $7
       RETURNING *`,
      [title, date_time, price, description, event_type_id, location_id, id]
    );

    // Ja pasākums ar šādu ID netika atrasts
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pasākums nav atrasts." });
      return;
    }

    // Sagatavo servera pamata URL attēlu ceļiem
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Atgriež atjaunināto pasākumu ar piesaistītiem attēliem
    res.json(attachImages(result.rows[0], baseUrl));
  } catch (error) {
    // Kļūdas gadījums
    res.status(500).json({ error: "Neizdevās atjaunināt pasākumu." });
  }
});

// Funkcija: dzēš pasākumu no datubāzes pēc ID.
router.delete("/:id", async (req, res) => {
  try {
    // Iegūst pasākuma ID no URL
    const { id } = req.params;

    // Dzēš pasākumu no tabulas events
    const result = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING id",
      [id]
    );

    // Ja pasākums netika atrasts
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pasākums nav atrasts." });
      return;
    }

    // Veiksmīgas dzēšanas paziņojums
    res.json({ message: "Pasākums dzēsts." });
  } catch (error) {
    // Kļūdas gadījums
    res.status(500).json({ error: "Neizdevās dzēst pasākumu." });
  }
});

// Funkcija: augšupielādē pasākuma attēlus un piesaista tos pasākumam.
router.post("/:id/images", upload.array("images", 6), async (req, res) => {
  try {
    // Iegūst pasākuma ID no URL
    const { id } = req.params;

    // Iegūst augšupielādētos failus
    const files = req.files || [];

    // Ja nav augšupielādētu failu
    if (files.length === 0) {
      res.status(400).json({ error: "Nav augšupielādētu failu." });
      return;
    }

    // Pārbauda, vai pasākums eksistē
    const eventResult = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [id]
    );

    if (eventResult.rows.length === 0) {
      res.status(404).json({ error: "Pasākums nav atrasts." });
      return;
    }

    // Pārbauda, vai pasākumam jau ir galvenais attēls
    const mainCheck = await pool.query(
      "SELECT id FROM event_images WHERE event_id = $1 AND is_main = true LIMIT 1",
      [id]
    );

    const hasMain = mainCheck.rows.length > 0;

    // Sagatavo attēlu ievietošanas vaicājumus
    const inserts = files.map((file, index) => {
      // Pirmais attēls kļūst par galveno, ja tāds vēl nav
      const isMain = !hasMain && index === 0;

      return pool.query(
        "INSERT INTO event_images (event_id, file_path, is_main) VALUES ($1, $2, $3) RETURNING *",
        [id, `/uploads/${file.filename}`, isMain]
      );
    });

    // Izpilda visus attēlu ievietošanas vaicājumus
    await Promise.all(inserts);

    // Sagatavo servera pamata URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Iegūst atjauninātu pasākumu ar visiem attēliem
    const result = await pool.query(
      `SELECT e.id, e.title, e.date_time, e.price, e.description,
              e.event_type_id, e.location_id,
              et.name AS event_type_name,
              l.name AS location_name,
              l.address AS location_address,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', ei.id,
                    'file_path', ei.file_path,
                    'is_main', ei.is_main,
                    'created_at', ei.created_at
                  )
                  ORDER BY ei.is_main DESC, ei.created_at ASC
                ) FILTER (WHERE ei.id IS NOT NULL),
                '[]'
              ) AS images
       FROM events e
       JOIN event_types et ON e.event_type_id = et.id
       JOIN locations l ON e.location_id = l.id
       LEFT JOIN event_images ei ON e.id = ei.event_id
       WHERE e.id = $1
       GROUP BY e.id, et.name, l.name, l.address`,
      [id]
    );

    // Atgriež pasākumu ar piesaistītiem attēliem
    res.json(attachImages(result.rows[0], baseUrl));
  } catch (error) {
    // Kļūdas gadījums
    res.status(500).json({ error: "Neizdevās augšupielādēt attēlus." });
  }
});

// Router eksports izmantošanai server.js
module.exports = router;