/*
  Faila metadati
  Autors: Denis Baglajs
  Versija: 1.1.1
  Pēdējais atjauninājums: 2026-03-30
  Mērķis: Ielādēt, pievienot un rediģēt pasākumu kategorijas.

  Faila apraksts:
  Šis fails nodrošina pasākumu kategoriju (pasākumu veidu)
  pievienošanu, attēlošanu un rediģēšanu,
  izmantojot REST API un JavaScript bez ietvariem.
*/

// Backend API bāzes adrese
const API_BASE = "http://localhost:3004";

// DOM elementi darbam ar lietotāja ievadi un paziņojumiem
const newTypeNameInput = document.getElementById("newTypeName"); // Jaunas kategorijas ievades lauks
const addTypeBtn = document.getElementById("addTypeBtn");        // Poga kategorijas pievienošanai
const typesList = document.getElementById("typesList");          // Kategoriju saraksta konteiners
const statusMessage = document.getElementById("statusMessage");  // Statusa / kļūdu ziņojumi

// Funkcija:
// Pārbauda kategorijas nosaukuma garumu un korektumu.
function validateTypeName(value) {
  const trimmed = value.trim(); // Noņem liekās atstarpes
  if (trimmed.length < 3 || trimmed.length > 50) {
    return "Kategorijas nosaukumam jābūt no 3 līdz 50 rakstzīmēm.";
  }
  return null; // Ja kļūdu nav
}

// Funkcija:
// Ielādē pasākumu kategoriju sarakstu no backend API.
async function loadTypes() {
  try {
    const response = await fetch(`${API_BASE}/event_types`); // GET pieprasījums
    const data = await response.json();                      // Atbilde JSON formātā
    renderTypes(data);                                       // Attēlo sarakstu
  } catch (error) {
    statusMessage.textContent = "Neizdevās ielādēt kategorijas.";
  }
}

// Funkcija:
// Attēlo kategoriju sarakstu HTML lapā.
function renderTypes(types) {
  typesList.innerHTML = ""; // Notīra iepriekšējo sarakstu

  // Ja nav nevienas kategorijas
  if (!types.length) {
    typesList.textContent = "Nav izveidotu kategoriju.";
    return;
  }

  // Izveido rindas katrai kategorijai
  types.forEach((type) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.padding = "8px 0";
    row.style.borderBottom = "1px solid #d9d3c9";

    // Kategorijas nosaukums
    const name = document.createElement("span");
    name.textContent = type.name;

    // Rediģēšanas poga
    const editBtn = document.createElement("button");
    editBtn.className = "btn";
    editBtn.textContent = "Rediģēt";

    // Pievieno notikumu rediģēšanai
    editBtn.addEventListener("click", () => {
      editType(type.id, type.name);
    });

    const actions = document.createElement("div");
    actions.appendChild(editBtn);

    row.appendChild(name);
    row.appendChild(actions);
    typesList.appendChild(row);
  });
}

// Funkcija:
// Pievieno jaunu kategoriju datubāzē, izmantojot POST pieprasījumu.
async function addType() {
  const error = validateTypeName(newTypeNameInput.value);
  if (error) {
    statusMessage.textContent = error;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/event_types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeNameInput.value.trim() }),
    });

    // Ja serveris atgriež kļūdu
    if (!response.ok) {
      const errorBody = await response.text();
      statusMessage.textContent =
        `Neizdevās pievienot kategoriju (statuss ${response.status}). ${errorBody}`;
      return;
    }

    // Ja pievienošana veiksmīga
    newTypeNameInput.value = "";
    statusMessage.textContent = "";
    await loadTypes(); // Atjauno sarakstu
  } catch (error) {
    statusMessage.textContent = "Neizdevās pievienot kategoriju.";
  }
}

// Funkcija:
// Rediģē esošas kategorijas nosaukumu datubāzē.
async function editType(typeId, currentName) {
  const newName = window.prompt(
    "Ievadi jauno kategorijas nosaukumu:",
    currentName
  );

  // Ja lietotājs atceļ dialogu
  if (newName === null) {
    return;
  }

  const error = validateTypeName(newName);
  if (error) {
    statusMessage.textContent = error;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/event_types/${typeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    // Ja serveris atgriež kļūdu
    if (!response.ok) {
      const errorBody = await response.text();
      statusMessage.textContent =
        `Neizdevās rediģēt kategoriju (statuss ${response.status}). ${errorBody}`;
      return;
    }

    statusMessage.textContent = "";
    await loadTypes(); // Pārlādē sarakstu
  } catch (error) {
    statusMessage.textContent = "Neizdevās rediģēt kategoriju.";
  }
}

// Funkcija:
// Piesaista pogām notikumu apstrādi.
function bindEvents() {
  addTypeBtn.addEventListener("click", () => {
    addType();
  });
}

// Funkcija:
// Inicializē lapas darbību pēc ielādes.
function init() {
  bindEvents(); // Pievieno notikumus
  loadTypes();  // Ielādē sākotnējos datus
}

// Palaiž inicializāciju
init();
