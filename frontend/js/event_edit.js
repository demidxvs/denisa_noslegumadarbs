/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.0.0
  Pēdējais atjauninājums: 2026-05-22
  Mērķis: Nodrošināt pasākuma izveidi, rediģēšanu, dzēšanu un attēlu pievienošanu.

  Faila apraksts:
  Šis fails nodrošina pasākuma izveidi, rediģēšanu un dzēšanu,
  kā arī saziņu ar backend REST API (POST, PUT, DELETE).
*/

// Backend API bāzes adrese
const API_BASE = "http://localhost:3004";

// DOM elementi formas un lapas vadībai
const formTitle = document.getElementById("formTitle");          // Formas virsraksts
const eventForm = document.getElementById("eventForm");          // Pasākuma forma
const titleInput = document.getElementById("title");             // Nosaukuma ievade
const priceInput = document.getElementById("price");             // Cena
const dateTimeInput = document.getElementById("dateTime");       // Datums un laiks
const descriptionInput = document.getElementById("description"); // Apraksts
const eventTypeSelect = document.getElementById("eventType");    // Pasākuma veids
const locationSelect = document.getElementById("location");      // Norises vieta
const statusMessage = document.getElementById("statusMessage");  // Kļūdu paziņojumi
const cancelBtn = document.getElementById("cancelBtn");          // Atcelšanas poga
const deleteBtn = document.getElementById("deleteBtn");          // Dzēšanas poga

// Papildu kategoriju (veidu) izveides elementi
const newTypeNameInput = document.getElementById("newTypeName");
const addTypeBtn = document.getElementById("addTypeBtn");
const editTypeBtn = document.getElementById("editTypeBtn");

// Papildu norises vietu izveides elementi
const newLocationNameInput = document.getElementById("newLocationName");
const newLocationAddressInput = document.getElementById("newLocationAddress");
const addLocationBtn = document.getElementById("addLocationBtn");

// Attēlu augšupielāde
const imagesInput = document.getElementById("images");
const imagesList = document.getElementById("imagesList");

// Pašreizējā pasākuma ID (null, ja veido jaunu)
let currentEventId = null;

// Minimālais atļautais datums (piemēram, nākotnē)
let minAllowedDateTime = "";

// Funkcija:
// Nolasa pasākuma ID no URL parametriem (?id=...)
function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Funkcija:
// Ielādē pasākumu veidus un norises vietas no API
// un aizpilda <select> laukus.
async function loadSelectOptions() {
  try {
    const [typesResponse, locationsResponse] = await Promise.all([
      fetch(`${API_BASE}/event_types`),
      fetch(`${API_BASE}/locations`),
    ]);

    const types = await typesResponse.json();
    const locations = await locationsResponse.json();

    // Pasākumu veidu izvēlne
    eventTypeSelect.innerHTML = "<option value=\"\">Izvēlies veidu</option>";
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      eventTypeSelect.appendChild(option);
    });

    // Norises vietu izvēlne
    locationSelect.innerHTML = "<option value=\"\">Izvēlies vietu</option>";
    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = `${location.name} (${location.address})`;
      locationSelect.appendChild(option);
    });
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt izvēles sarakstus.";
  }
}

// Funkcija:
// Aizpilda formu ar esoša pasākuma datiem rediģēšanas režīmā.
function fillForm(event) {
  titleInput.value = event.title;
  priceInput.value = Number(event.price).toFixed(2);
  dateTimeInput.value = event.date_time.slice(0, 16);
  descriptionInput.value = event.description;
  eventTypeSelect.value = event.event_type_id;
  locationSelect.value = event.location_id;
}

// Funkcija:
// Ielādē pasākuma datus no API, ja tiek veikta rediģēšana.
async function loadEvent() {
  if (!currentEventId) {
    deleteBtn.style.display = "none";
    formTitle.textContent = "Jauns pasākums";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/events/${currentEventId}`);
    if (!response.ok) {
      statusMessage.textContent = "Pasākums netika atrasts.";
      return;
    }

    const event = await response.json();
    fillForm(event);
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt pasākuma datus.";
  }
}

// Funkcija:
// Savāc formas datus objektā, ko nosūtīt uz API.
function collectFormData() {
  return {
    title: titleInput.value.trim(),
    price: Number(priceInput.value),
    date_time: dateTimeInput.value,
    description: descriptionInput.value.trim(),
    event_type_id: Number(eventTypeSelect.value),
    location_id: Number(locationSelect.value),
  };
}

// Funkcija:
// Veic klienta puses formas validāciju.
function validateForm() {
  if (!titleInput.value.trim()) {
    return "Laukam 'Nosaukums' jābūt aizpildītam.";
  }
  if (titleInput.value.trim().length < 3 || titleInput.value.trim().length > 100) {
    return "Nosaukumam jābūt no 3 līdz 100 rakstzīmēm.";
  }
  if (!priceInput.value || Number.isNaN(Number(priceInput.value))) {
    return "Laukam 'Cena' jābūt skaitlim.";
  }
  if (!/^[0-9]+(\\.[0-9]{1,2})?$/.test(priceInput.value)) {
    return "Cena jānorāda ar ne vairāk kā 2 zīmēm aiz komata.";
  }
  if (!dateTimeInput.value) {
    return "Laukam 'Datums un laiks' jābūt aizpildītam.";
  }
  if (minAllowedDateTime && dateTimeInput.value < minAllowedDateTime) {
    return "Datumu un laiku drīkst izvēlēties tikai no nākamās nedēļas.";
  }
  if (!descriptionInput.value.trim()) {
    return "Laukam 'Apraksts' jābūt aizpildītam.";
  }
  if (descriptionInput.value.trim().length < 10 || descriptionInput.value.trim().length > 500) {
    return "Aprakstam jābūt no 10 līdz 500 rakstzīmēm.";
  }
  if (!eventTypeSelect.value) {
    return "Jāizvēlas pasākuma veids.";
  }
  if (!locationSelect.value) {
    return "Jāizvēlas norises vieta.";
  }
  return null;
}

// Funkcija:
// Saglabā pasākumu datubāzē (POST – jauns, PUT – rediģēšana).
async function saveEvent() {
  const validationError = validateForm();
  if (validationError) {
    statusMessage.textContent = validationError;
    return;
  }

  const confirmed = window.confirm("Vai tiešām vēlies saglabāt izmaiņas?");
  if (!confirmed) {
    return;
  }

  const payload = collectFormData();
  const method = currentEventId ? "PUT" : "POST";
  const url = currentEventId
    ? `${API_BASE}/events/${currentEventId}`
    : `${API_BASE}/events`;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      statusMessage.textContent = "Neizdevās saglabāt pasākumu.";
      return;
    }

    const savedEvent = await response.json();
    const eventId = currentEventId || savedEvent.id;

    // Ja ir pievienoti attēli – augšupielādē tos atsevišķi
    if (imagesInput.files && imagesInput.files.length > 0) {
      const uploaded = await uploadImages(eventId);
      if (!uploaded) {
        return;
      }
    }

    // Pēc veiksmīgas saglabāšanas – atgriežas pasākumu sarakstā
    window.location.href = "events.html";
  } catch (error) {
    statusMessage.textContent = "Neizdevās saglabāt pasākumu.";
  }
}
// Funkcija: dzēš pasākumu no sistēmas pēc ID.
async function deleteEvent() {
  // Ja nav pasākuma ID, dzēšana nav iespējama
  if (!currentEventId) {
    return;
  }

  // Lietotāja apstiprinājums pirms dzēšanas
  const confirmed = window.confirm("Vai tiešām vēlies dzēst pasākumu?");
  if (!confirmed) {
    return;
  }

  try {
    // Nosūta DELETE pieprasījumu uz backend
    const response = await fetch(`${API_BASE}/events/${currentEventId}`, {
      method: "DELETE",
    });

    // Kļūdas apstrāde
    if (!response.ok) {
      statusMessage.textContent = "Neizdevās dzēst pasākumu.";
      return;
    }

    // Pēc dzēšanas atgriežas pasākumu sarakstā
    window.location.href = "events.html";
  } catch (error) {
    statusMessage.textContent = "Neizdevās dzēst pasākumu.";
  }
}

// Funkcija: nosaka minimālo atļauto datumu (7 dienas uz priekšu).
function setMinDateTime() {
  const now = new Date();
  now.setDate(now.getDate() + 7);

  // Saglabā minimālo datumu validācijai
  minAllowedDateTime = now.toISOString().slice(0, 16);

  // Uzstāda HTML input laukam minimālo vērtību
  dateTimeInput.min = minAllowedDateTime;
}

// Funkcija: validē pasākuma veida nosaukumu.
function validateTypeName(value) {
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return "Pasākuma veida nosaukumam jābūt no 3 līdz 50 rakstzīmēm.";
  }
  return null;
}

// Funkcija: pievieno jaunu pasākuma veidu datubāzei.
async function addEventType() {
  // Nosaukuma validācija
  const error = validateTypeName(newTypeNameInput.value);
  if (error) {
    statusMessage.textContent = error;
    return;
  }

  // Lietotāja apstiprinājums
  const confirmed = window.confirm("Vai tiešām pievienot jaunu pasākuma veidu?");
  if (!confirmed) {
    return;
  }

  try {
    // POST pieprasījums jauna veida pievienošanai
    const response = await fetch(`${API_BASE}/event_types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeNameInput.value.trim() }),
    });

    if (!response.ok) {
      statusMessage.textContent = "Neizdevās pievienot pasākuma veidu.";
      return;
    }

    // Notīra ievadi un atjauno sarakstu
    newTypeNameInput.value = "";
    await loadSelectOptions();
  } catch (error) {
    statusMessage.textContent = "Neizdevās pievienot pasākuma veidu.";
  }
}

// Funkcija: rediģē izvēlēto pasākuma veidu.
async function editSelectedType() {
  // Pārbauda, vai veids ir izvēlēts
  if (!eventTypeSelect.value) {
    statusMessage.textContent = "Izvēlies pasākuma veidu, kuru rediģēt.";
    return;
  }

  // Jaunā nosaukuma ievade
  const newName = window.prompt("Ievadi jauno pasākuma veida nosaukumu:");
  if (newName === null) {
    return;
  }

  // Nosaukuma validācija
  const error = validateTypeName(newName);
  if (error) {
    statusMessage.textContent = error;
    return;
  }

  try {
    // PUT pieprasījums pasākuma veida rediģēšanai
    const response = await fetch(`${API_BASE}/event_types/${eventTypeSelect.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!response.ok) {
      statusMessage.textContent = "Neizdevās rediģēt pasākuma veidu.";
      return;
    }

    // Atjauno izvēles sarakstu
    await loadSelectOptions();
  } catch (error) {
    statusMessage.textContent = "Neizdevās rediģēt pasākuma veidu.";
  }
}

// Funkcija: validē norises vietas datus.
function validateLocation(name, address) {
  const trimmedName = name.trim();
  const trimmedAddress = address.trim();

  if (trimmedName.length < 3 || trimmedName.length > 100) {
    return "Norises vietas nosaukumam jābūt no 3 līdz 100 rakstzīmēm.";
  }
  if (trimmedAddress.length < 5 || trimmedAddress.length > 150) {
    return "Norises vietas adresei jābūt no 5 līdz 150 rakstzīmēm.";
  }
  return null;
}

// Funkcija: pievieno jaunu norises vietu datubāzei.
async function addLocation() {
  const error = validateLocation(
    newLocationNameInput.value,
    newLocationAddressInput.value
  );

  if (error) {
    statusMessage.textContent = error;
    return;
  }

  const confirmed = window.confirm("Vai tiešām pievienot jaunu norises vietu?");
  if (!confirmed) {
    return;
  }

  try {
    // POST pieprasījums norises vietas pievienošanai
    const response = await fetch(`${API_BASE}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newLocationNameInput.value.trim(),
        address: newLocationAddressInput.value.trim(),
      }),
    });

    if (!response.ok) {
      statusMessage.textContent = "Neizdevās pievienot norises vietu.";
      return;
    }

    // Iestata jauno vietu kā izvēlēto
    const created = await response.json();
    newLocationNameInput.value = "";
    newLocationAddressInput.value = "";
    await loadSelectOptions();
    locationSelect.value = String(created.id);
  } catch (error) {
    statusMessage.textContent = "Neizdevās pievienot norises vietu.";
  }
}

// Funkcija: parāda lietotāja izvēlēto attēlu nosaukumus.
function renderSelectedImages() {
  if (!imagesInput.files || imagesInput.files.length === 0) {
    imagesList.textContent = "Nav izvēlētu attēlu.";
    return;
  }

  const names = Array.from(imagesInput.files).map((file) => file.name);
  imagesList.textContent = `Izvēlētie attēli: ${names.join(", ")}`;
}

// Funkcija: augšupielādē attēlus konkrētam pasākumam.
async function uploadImages(eventId) {
  const formData = new FormData();

  // Pievieno katru failu FormData objektam
  Array.from(imagesInput.files).forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}/images`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      statusMessage.textContent = "Neizdevās augšupielādēt attēlus.";
      return false;
    }

    return true;
  } catch (error) {
    statusMessage.textContent = "Neizdevās augšupielādēt attēlus.";
    return false;
  }
}

// Funkcija: piesaista visus formas notikumus.
function bindFormEvents() {
  eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEvent();
  });

  cancelBtn.addEventListener("click", () => {
    window.location.href = "events.html";
  });

  deleteBtn.addEventListener("click", () => {
    deleteEvent();
  });

  addTypeBtn.addEventListener("click", () => {
    addEventType();
  });

  editTypeBtn.addEventListener("click", () => {
    editSelectedType();
  });

  addLocationBtn.addEventListener("click", () => {
    addLocation();
  });

  imagesInput.addEventListener("change", () => {
    renderSelectedImages();
  });
}

// Funkcija: inicializē lapas darbību.
async function init() {
  currentEventId = getEventId();
  setMinDateTime();
  bindFormEvents();
  await loadSelectOptions();
  await loadEvent();
  renderSelectedImages();
}

// Palaiž inicializāciju pēc lapas ielādes
init();
