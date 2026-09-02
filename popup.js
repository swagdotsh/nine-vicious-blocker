const DEFAULTS = { enabled: true };
const enabled = document.querySelector("#enabled");
const status = document.querySelector("#status");
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
  updateStatus();
}

enabled.addEventListener("change", async () => {
  updateStatus();
  await chrome.storage.sync.set({ enabled: enabled.checked });
  showSaved();
});

initialize();
