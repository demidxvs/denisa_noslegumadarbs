# Pasākumu pārvaldības sistēma

## Projekta metadati

Autors: Denis Baglajs  
Versija: 1.0.0  
Pēdējais atjauninājums: 2026-05-22  
Projekta mērķis: izveidot tīmekļa lietotni pasākumu izveidei, apskatei, rediģēšanai un kategoriju pārvaldībai.

## Projekta apraksts

Šis projekts ir pasākumu pārvaldības sistēma. Lietotājs var apskatīt pasākumu sarakstu, filtrēt pasākumus pēc nosaukuma, veida, datuma un cenas, apskatīt detalizētu informāciju par konkrētu pasākumu, pievienot jaunus pasākumus, rediģēt esošos pasākumus, dzēst pasākumus un pārvaldīt pasākumu kategorijas.

Projekts sastāv no trim galvenajām daļām:

- `frontend` - HTML, CSS un JavaScript faili lietotāja saskarnei.
- `backend` - Node.js un Express REST API.
- `db` - PostgreSQL datubāzes tabulu izveides SQL fails.

## Izmantotās tehnoloģijas

- HTML5
- CSS3
- JavaScript
- W3.CSS
- Node.js
- Express
- PostgreSQL
- Multer failu augšupielādei
- CORS API pieprasījumiem no frontend daļas

## Projekta struktūra

```text
backend/
  db.js
  server.js
  routes/
    event_types.js
    events.js
    locations.js
  uploads/

db/
  create_tables.sql

frontend/
  events.html
  event_details.html
  event_edit.html
  category_management.html
  css/
    style.css
  js/
    events.js
    event_details.js
    event_edit.js
    category_management.js
```

## Palaišanas instrukcija

1. Atvērt projekta backend mapi:

```bash
cd backend
```

2. Instalēt nepieciešamās pakotnes:

```bash
npm install
```

3. Izveidot PostgreSQL datubāzi:

```bash
createdb denis_module
```

4. Izveidot datubāzes tabulas:

```bash
psql -d denis_module -f ../db/create_tables.sql
```

5. Pārliecināties, ka `backend/.env` failā ir pareizi pieslēguma dati:

```env
DATABASE_URL=postgres://demidxvs@localhost:5432/denis_module
PORT=3004
```

6. Palaist backend serveri:

```bash
npm start
```

7. Atvērt frontend sākuma lapu pārlūkprogrammā:

```text
frontend/events.html
```

## API adreses

- `GET /events` - iegūt visus pasākumus.
- `GET /events/:id` - iegūt viena pasākuma informāciju.
- `POST /events` - pievienot jaunu pasākumu.
- `PUT /events/:id` - rediģēt pasākumu.
- `DELETE /events/:id` - dzēst pasākumu.
- `POST /events/:id/images` - pievienot pasākuma attēlus.
- `GET /event_types` - iegūt pasākumu kategorijas.
- `POST /event_types` - pievienot jaunu kategoriju.
- `PUT /event_types/:id` - rediģēt kategoriju.
- `GET /locations` - iegūt norises vietas.
- `POST /locations` - pievienot norises vietu.
- `PUT /locations/:id` - rediģēt norises vietu.

## Piezīmes

Backend serveris darbojas uz `http://localhost:3004`. Frontend JavaScript faili izmanto šo adresi API pieprasījumiem. Lokālais `.env` fails netiek augšupielādēts GitHub repozitorijā, jo tas satur lokālās vides konfigurāciju.
