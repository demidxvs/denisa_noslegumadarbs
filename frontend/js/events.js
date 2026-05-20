// Faila apraksts: pasākumu saraksta iegūšana, filtrēšana un attēlošana galvenajā lapā.

const API_BASE = "http://localhost:3004";

// DOM elementi pasākumu sarakstam un paziņojumiem
const eventsList = document.getElementById("eventsList");
const statusMessage = document.getElementById("statusMessage");

// Filtru ievades lauki
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");
const dateFilter = document.getElementById("dateFilter");
const priceFilter = document.getElementById("priceFilter");

// Mainīgais visu pasākumu saglabāšanai atmiņā
let eventsData = [];

// Funkcija: ielādē pasākumu veidus filtrēšanas select laukam.
async function loadEventTypes() {
  try {
    const response = await fetch(`${API_BASE}/event_types`);
    const data = await response.json();

    // Pievieno katru veidu select sarakstam
    data.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      typeFilter.appendChild(option);
    });
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt pasākumu veidus.";
  }
}

// Funkcija: ielādē visus pasākumus no backend API.
async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    eventsData = await response.json();

    // Pēc ielādes uzreiz attēlo pasākumus
    renderEvents();
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt pasākumus.";
  }
}

// Funkcija: formatē cenu ar 2 zīmēm aiz komata.
function formatPrice(value) {
  return Number(value).toFixed(2) + " €";
}

// Funkcija: formatē datumu un laiku lietotājam saprotamā formā.
function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString("lv-LV");
}

// Funkcija: filtrē pasākumu sarakstu pēc meklēšanas un filtru kritērijiem.
function filterEvents() {
  const search = searchInput.value.trim().toLowerCase();
  const typeId = typeFilter.value;
  const dateValue = dateFilter.value;
  const maxPrice = priceFilter.value ? Number(priceFilter.value) : null;

  // Atgriež tikai tos pasākumus, kas atbilst visiem kritērijiem
  return eventsData.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search);
    const matchesType = !typeId || String(event.event_type_id) === typeId;
    const matchesDate = !dateValue || event.date_time.startsWith(dateValue);
    const matchesPrice = maxPrice === null || Number(event.price) <= maxPrice;

    return matchesSearch && matchesType && matchesDate && matchesPrice;
  });
}

// Funkcija: attēlo pasākumu kartītes lapā.
function renderEvents() {
  const filtered = filterEvents();
  eventsList.innerHTML = "";

  // Ja pēc filtrēšanas nav rezultātu
  if (filtered.length === 0) {
    statusMessage.textContent = "Nav atrastu pasākumu pēc izvēlētajiem filtriem.";
    return;
  }

  statusMessage.textContent = "";

  // Izveido kartīti katram pasākumam
  filtered.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <img src="${event.image_small}" alt="${event.title}" />
      <div class="card-body">
        <strong>${event.title}</strong>
        <span>${formatDateTime(event.date_time)}</span>
        <span class="price-tag">${formatPrice(event.price)}</span>
        <div class="card-actions">
          <a class="btn" href="event_details.html?id=${event.id}">Skatīt</a>
          <a class="btn" href="event_edit.html?id=${event.id}">Rediģēt</a>
        </div>
      </div>
    `;

    eventsList.appendChild(card);
  });
}

// Funkcija: piesaista filtriem notikumus reāllaika filtrēšanai.
function bindFilters() {
  [searchInput, typeFilter, dateFilter, priceFilter].forEach((input) => {
    input.addEventListener("input", renderEvents);
  });
}

// Funkcija: inicializē lapas darbību pēc ielādes.
function init() {
  bindFilters();      // Aktivizē filtrus
  loadEventTypes();  // Ielādē pasākumu veidus
  loadEvents();      // Ielādē pasākumu sarakstu
}

// Palaiž inicializāciju
init();