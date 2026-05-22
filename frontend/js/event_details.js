/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.2.3
  Pēdējais atjauninājums: 2026-04-27
  Mērķis: Ielādēt viena pasākuma datus no REST API un attēlot detaļu lapā.

  Faila apraksts:
  Šis fails nodrošina viena konkrēta pasākuma detalizētas informācijas
  ielādi no REST API un attēlošanu event_details.html lapā.
*/

// Backend API bāzes adrese
const API_BASE = "http://localhost:3004";

// DOM elementi pasākuma datu attēlošanai
const titleEl = document.getElementById("eventTitle");        // Pasākuma nosaukums
const priceEl = document.getElementById("eventPrice");        // Pasākuma cena
const dateEl = document.getElementById("eventDate");          // Datums un laiks
const descriptionEl = document.getElementById("eventDescription"); // Apraksts
const mainImage = document.getElementById("mainImage");       // Galvenais attēls
const extraImages = document.getElementById("extraImages");   // Papildu attēli
const statusMessage = document.getElementById("statusMessage"); // Kļūdu ziņojumi

// Funkcija:
// Nolasa pasākuma ID no URL parametriem (?id=...).
function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Funkcija:
// Formatē cenu ar divām zīmēm aiz komata un pievieno valūtu.
function formatPrice(value) {
  return Number(value).toFixed(2) + " €";
}

// Funkcija:
// Formatē datumu un laiku lietotājam saprotamā formātā.
function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString("lv-LV");
}

// Funkcija:
// Aizpilda pasākuma datus HTML lapā.
function renderEvent(event) {
  // Teksta dati
  titleEl.textContent = event.title;
  priceEl.textContent = formatPrice(event.price);
  dateEl.textContent = formatDateTime(event.date_time);
  descriptionEl.textContent = event.description;

  // Galvenais attēls
  mainImage.src = event.image_main;
  mainImage.alt = event.title;

  // Papildu attēlu saraksts
  extraImages.innerHTML = "";
  event.image_extra.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = event.title;
    extraImages.appendChild(img);
  });
}

// Funkcija:
// Ielādē pasākuma datus no backend API pēc ID.
async function loadEvent() {
  const eventId = getEventId();

  // Ja URL nav norādīts ID
  if (!eventId) {
    statusMessage.textContent = "Nav norādīts pasākuma ID.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`);

    // Ja pasākums nav atrasts
    if (!response.ok) {
      statusMessage.textContent = "Pasākums netika atrasts.";
      return;
    }

    const event = await response.json();
    renderEvent(event); // Attēlo datus lapā
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt pasākuma datus.";
  }
}

// Inicializē pasākuma datu ielādi pēc lapas atvēršanas
loadEvent();
