const DEFAULTS = { enabled: true, terms: ["nine vicious", "ninevicious"] };
const enabled = document.querySelector("#enabled");
const status = document.querySelector("#status");
const terms = document.querySelector("#terms");
const saved = document.querySelector("#saved");
let saveTimer;

function updateStatus() {
  status.textContent = enabled.checked ? "On" : "Off";
}

function showSaved() {
  saved.textContent = "Saved";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saved.textContent = ""; }, 1000);
}

async function initialize() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  enabled.checked = settings.enabled;
  terms.value = settings.terms.join("\n");
  updateStatus();
}

enabled.addEventListener("change", async () => {
  updateStatus();
  await chrome.storage.sync.set({ enabled: enabled.checked });
  showSaved();
});

terms.addEventListener("input", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const nextTerms = terms.value.split("\n").map((term) => term.trim()).filter(Boolean);
    await chrome.storage.sync.set({ terms: nextTerms });
    showSaved();
  }, 350);
});

initialize();
