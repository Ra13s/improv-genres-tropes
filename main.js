/************************************************
 * UI Translations
 ************************************************/
const uiStrings = {
  et: {
    showSettings: "Näita seadeid",
    hideSettings: "Peida seadeid",
    settingsHeader: "Seaded",
    language: "Keel:",
    estonian: "Eesti",
    english: "Inglise",
    tropeLimit: "Klišeesid žanri kohta:",
    show2: "Ainult 2",
    showAll: "Kõik",
    saveSettings: "Salvesta seaded",
    shuffleGenre: "Sega žanrit",
    shuffleTropes: "Sega klišeed"
  },
  en: {
    showSettings: "Show Settings",
    hideSettings: "Hide Settings",
    settingsHeader: "Settings",
    language: "Language:",
    estonian: "Estonian",
    english: "English",
    tropeLimit: "Tropes per genre:",
    show2: "Show 2",
    showAll: "Show All",
    saveSettings: "Save Settings",
    shuffleGenre: "Shuffle Genre",
    shuffleTropes: "Shuffle Tropes"
  }
};

/************************************************
 * Global state
 ************************************************/
let currentLang = "et"; // default to Estonian
let tropeLimit = 2;     // default "Show 2"
let allGenres = [];     // loaded from genresDataEt or genresDataEn

// For picking new genres
let unusedGenreIndices = [];

// Info about the *current* genre
let currentGenre = null;

// For storing a cycle of trope subsets (when "Show 2" is selected).
// We'll cycle through them without repeating until we exhaust them.
let currentTropesCycle = [];   // array of arrays (each sub-array are the tropes to display)
let currentCycleIndex = 0;

/************************************************
 * DOM Elements
 ************************************************/
const settingsBtn        = document.getElementById("settingsBtn");
const settingsPanel      = document.getElementById("settingsPanel");
const settingsHeaderEl   = document.getElementById("settingsHeader");
const languageLabel      = document.getElementById("languageLabel");
const langEstonianLabel  = document.getElementById("langEstonianLabel");
const langEnglishLabel   = document.getElementById("langEnglishLabel");
const tropeLimitLabel    = document.getElementById("tropeLimitLabel");
const show2Label         = document.getElementById("show2Label");
const showAllLabel       = document.getElementById("showAllLabel");
const shuffleGenreBtn    = document.getElementById("shuffleGenreBtn");
const shuffleTropesBtn   = document.getElementById("shuffleTropesBtn");
const saveSettingsBtn    = document.getElementById("saveSettingsBtn");
const genreNameEl        = document.getElementById("genreName");
const genreDescriptionEl = document.getElementById("genreDescription");
const tropeListEl        = document.getElementById("tropeList");

/************************************************
 * localStorage load/save
 ************************************************/
function loadSettings() {
  const savedLang = localStorage.getItem("lang");
  if (savedLang === "en" || savedLang === "et") {
    currentLang = savedLang;
  }
  const savedLimit = localStorage.getItem("tropeLimit");
  if (savedLimit === "all") {
    tropeLimit = Infinity;
  } else {
    tropeLimit = 2;
  }
}

function saveSettings() {
  localStorage.setItem("lang", currentLang);
  if (tropeLimit === Infinity) {
    localStorage.setItem("tropeLimit", "all");
  } else {
    localStorage.setItem("tropeLimit", "2");
  }
}

/************************************************
 * Load data based on language
 ************************************************/
function loadLanguageData() {
  if (currentLang === "en") {
    allGenres = window.genresDataEn || [];
  } else {
    allGenres = window.genresDataEt || [];
  }
  initUnusedGenres();
}

function initUnusedGenres() {
  unusedGenreIndices = allGenres.map((_, i) => i);
}

/************************************************
 * UI Translation
 ************************************************/
function updateUIStrings() {
  const s = uiStrings[currentLang];

  // Settings
  settingsHeaderEl.textContent = s.settingsHeader;
  languageLabel.textContent = s.language;
  langEstonianLabel.textContent = s.estonian;
  langEnglishLabel.textContent = s.english;
  tropeLimitLabel.textContent = s.tropeLimit;
  show2Label.textContent = s.show2;
  showAllLabel.textContent = s.showAll;
  saveSettingsBtn.textContent = s.saveSettings;

  // Buttons
  shuffleGenreBtn.textContent = s.shuffleGenre;
  shuffleTropesBtn.textContent = s.shuffleTropes;
  settingsBtn.textContent = settingsOpen ? s.hideSettings : s.showSettings;
}

/************************************************
 * Genre Shuffle
 ************************************************/
function shuffleGenre() {
  if (unusedGenreIndices.length === 0) {
    initUnusedGenres();
  }
  const randPos = Math.floor(Math.random() * unusedGenreIndices.length);
  const chosenIndex = unusedGenreIndices[randPos];
  unusedGenreIndices.splice(randPos, 1);

  currentGenre = allGenres[chosenIndex] || null;
  buildTropesCycle();        // re-build a new cycle for this new genre
  displayNextTropesInCycle(); // display the first set from that cycle
}

/************************************************
 * Trope Cycle
 ************************************************/
function buildTropesCycle() {
  currentTropesCycle = [];
  currentCycleIndex = 0;

  if (!currentGenre) {
    return;
  }
  const allTropes = currentGenre.tropes || [];

  if (tropeLimit === Infinity) {
    // "Show All" mode: no real cycle needed
    // We'll store exactly one "entry" in the cycle => the entire list
    // so displayNextTropesInCycle() can use the same logic.
    currentTropesCycle = [ allTropes.slice() ];
    return;
  }

  // "Show 2" mode => build all unique pairs from the tropes
  // If a genre has only 1 trope or 0 tropes, there's not much we can do but show them all
  if (allTropes.length < 2) {
    currentTropesCycle = [ allTropes.slice() ];
    return;
  }

  // Generate all unique pairs
  const pairs = [];
  for (let i = 0; i < allTropes.length; i++) {
    for (let j = i + 1; j < allTropes.length; j++) {
      pairs.push([ allTropes[i], allTropes[j] ]);
    }
  }
  // Shuffle them once
  shuffleArray(pairs);
  currentTropesCycle = pairs;
}

// Called by "Shuffle Tropes" button
function shuffleTropes() {
  // advance to the next item in the cycle
  displayNextTropesInCycle();
}

/************************************************
 * Display Next Tropes in the Cycle
 ************************************************/
function displayNextTropesInCycle() {
  // If there's no current genre or empty cycle, just clear display
  if (!currentGenre || currentTropesCycle.length === 0) {
    genreNameEl.textContent = "";
    genreDescriptionEl.textContent = "";
    tropeListEl.innerHTML = "";
    return;
  }

  // Update the genre name/desc (these won't really change, but you can keep them fresh)
  genreNameEl.textContent = currentGenre.name || "—";
  genreDescriptionEl.textContent = currentGenre.description || "—";

  // Show the current cycle item
  const tropesToShow = currentTropesCycle[currentCycleIndex];
  renderTropes(tropesToShow);

  // Move to next index for future calls
  currentCycleIndex++;
  // If we've reached the end, start over
  if (currentCycleIndex >= currentTropesCycle.length) {
    currentCycleIndex = 0;
  }
}

/************************************************
 * Render Tropes
 ************************************************/
function renderTropes(tropesArray) {
  tropeListEl.innerHTML = "";
  if (!tropesArray || tropesArray.length === 0) {
    return;
  }
  // Create a block for each trope
  tropesArray.forEach(t => {
    const div = document.createElement("div");
    div.className = "trope-block";
    div.textContent = t;
    tropeListEl.appendChild(div);
  });
}

/************************************************
 * Utility: shuffle an array in-place
 ************************************************/
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[r]] = [arr[r], arr[i]];
  }
}

/************************************************
 * Settings Panel
 ************************************************/
let settingsOpen = false;

function toggleSettings() {
  settingsOpen = !settingsOpen;
  settingsPanel.style.display = settingsOpen ? "block" : "none";
  updateUIStrings();
}

function applySettings() {
  // Language
  const langRadios = document.getElementsByName("lang");
  for (let r of langRadios) {
    if (r.checked) {
      currentLang = r.value;
      break;
    }
  }

  // Trope Limit
  const limitRadios = document.getElementsByName("tropeLimit");
  for (let r of limitRadios) {
    if (r.checked) {
      tropeLimit = (r.value === "all") ? Infinity : 2;
      break;
    }
  }

  // Save & reload
  saveSettings();
  loadLanguageData();
  updateUIStrings();

  // Close settings panel
  toggleSettings();

  // Force new random genre after settings change
  shuffleGenre();
}

/************************************************
 * Initialization
 ************************************************/
function init() {
  loadSettings();

  // Reflect loaded settings in radio buttons
  const langRadios = document.getElementsByName("lang");
  langRadios.forEach(r => {
    r.checked = (r.value === currentLang);
  });
  const limitRadios = document.getElementsByName("tropeLimit");
  limitRadios.forEach(r => {
    if (tropeLimit === Infinity && r.value === "all") {
      r.checked = true;
    } else if (tropeLimit === 2 && r.value === "2") {
      r.checked = true;
    }
  });

  loadLanguageData(); // load the right language data
  updateUIStrings();

  // Immediately pick a random genre + build its cycle + display
  shuffleGenre();
}

/************************************************
 * Event Listeners
 ************************************************/
window.addEventListener("DOMContentLoaded", init);
settingsBtn.addEventListener("click", toggleSettings);
saveSettingsBtn.addEventListener("click", applySettings);
shuffleGenreBtn.addEventListener("click", shuffleGenre);
shuffleTropesBtn.addEventListener("click", shuffleTropes);
