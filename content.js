const DEFAULTS = { enabled: true };
const BLOCKED_TERMS = [
  "Nine Vicious",
  "B4EM",
  "Studio Addict",
  "Tumblr Music",
  "B4TM",
  "B4SA",
  "B4FN",
  "FN",
  "Trevon O'Ryan Echols"
];

let settings = DEFAULTS;
let scanQueued = false;

function normalizedTerms() {
  return BLOCKED_TERMS
    .map((term) => term.trim().toLocaleLowerCase())
    .filter(Boolean);
}

function matchesBlockedTerm(post) {
  const text = post.innerText.toLocaleLowerCase();
  return normalizedTerms().some((term) => text.includes(term));
}

function createWarning(post) {
  const warning = document.createElement("div");
  warning.className = "nvb-warning-host";
  const root = warning.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host {
        all: initial !important;
        position: absolute !important;
        z-index: 2147483647 !important;
        inset: 0 !important;
        display: grid !important;
        place-items: center !important;
        width: auto !important;
        height: auto !important;
        pointer-events: none !important;
        overflow: hidden !important;
        background: rgba(0, 0, 0, .18) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        backdrop-filter: blur(14px) !important;
      }
      .warning {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 14px;
        width: min(390px, calc(100% - 32px));
        padding: 16px;
        color: #fff;
        background: #16181c;
        border: 1px solid #536471;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, .35);
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.3;
        pointer-events: auto;
      }
      .copy { display: block; flex: 1; min-width: 0; }
      strong { display: block; margin: 0 0 3px; font: bold 15px/1.3 Arial, sans-serif; }
      span { display: block; color: #b9c0c7; font: normal 13px/1.3 Arial, sans-serif; }
      button {
        flex: none;
        box-sizing: border-box;
        margin: 0;
        padding: 8px 11px;
        color: #fff;
        background: transparent;
        border: 1px solid #8b98a5;
        border-radius: 4px;
        cursor: pointer;
        font: bold 12px/1 Arial, sans-serif;
      }
      button:hover { background: #2f3336; }
      button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    </style>
    <div class="warning" role="alert">
      <div class="copy">
        <strong>Nine Vicious warning</strong>
        <span>This post was blurred because it mentions Nine Vicious.</span>
      </div>
      <button type="button">Show anyway?</button>
    </div>
  `;

  root.querySelector("button").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post.classList.add("nvb-revealed");
    warning.remove();
  });

  return warning;
}

function blurPost(post) {
  if (post.dataset.nvbBlocked === "true") return;
  post.dataset.nvbBlocked = "true";
  post.classList.add("nvb-blocked");
  post.appendChild(createWarning(post));
}

function restoreAllPosts() {
  document.querySelectorAll('article[data-nvb-blocked="true"]').forEach((post) => {
    post.classList.remove("nvb-blocked", "nvb-revealed");
    post.querySelector(":scope > .nvb-warning-host")?.remove();
    delete post.dataset.nvbBlocked;
  });
}

function scan() {
  scanQueued = false;
  if (!settings.enabled) {
    restoreAllPosts();
    return;
  }

  document.querySelectorAll("article").forEach((post) => {
    if (matchesBlockedTerm(post)) blurPost(post);
  });
}

function queueScan() {
  if (scanQueued) return;
  scanQueued = true;
  requestAnimationFrame(scan);
}

async function loadSettings() {
  settings = await chrome.storage.sync.get(DEFAULTS);
  queueScan();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.enabled) settings.enabled = changes.enabled.newValue;
  restoreAllPosts();
  queueScan();
});

new MutationObserver(queueScan).observe(document.documentElement, {
  childList: true,
  subtree: true
});

loadSettings();
