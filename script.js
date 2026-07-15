const SHEET_URL = "https://docs.google.com/spreadsheets/d/1QhInP4RLJB7Lkk6TU6-NsrKQgVUYwLLGWECgMxyzQX0/gviz/tq?tqx=out:csv&gid=0";

const app = document.getElementById("app");
let menu = {};

function slugify(str) {
  return (str || "").trim().replace(/\s+/g, "_");
}

// Parses a single CSV line, respecting quoted fields that may contain commas
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  lines.shift(); // remove header row

  const result = {};

  lines.forEach(line => {
    if (!line.trim()) return;

    const parts = parseCSVLine(line);
    const categoryRaw = (parts[0] || "").trim();
    const category = slugify(categoryRaw);
    const name = (parts[1] || "").trim().replace(/\./g, ",");
    const price = (parts[2] || "").trim();
    const description = parts.slice(3).join(",").trim().replace(/\./g, ",");

    if (!category || !name) return;

    if (!result[category]) {
      result[category] = { title: categoryRaw, items: [] };
    }

    result[category].items.push({ name, price, description });
  });

  return result;
}

function loadMenu() {
  const cached = localStorage.getItem("menu");

  if (cached) {
    // Instant render from last known-good menu — no waiting on the network
    menu = JSON.parse(cached);
    router();
    refreshMenu(false);
  } else {
    // First visit on this device: nothing to show yet, so display the loader
    refreshMenu(true);
  }
}

function refreshMenu(showLoaderOnFail) {
  fetch(`${SHEET_URL}&cache=${Date.now()}`)
    .then(res => res.text())
    .then(csv => {
      const parsed = parseCSV(csv);

      if (Object.keys(parsed).length === 0) {
        throw new Error("Empty menu response");
      }

      const parsedStr = JSON.stringify(parsed);

      // If the fresh data is identical to what's cached, skip re-rendering —
      // this is what kills the double animation
      if (parsedStr === localStorage.getItem("menu")) {
        return;
      }

      menu = parsed;
      localStorage.setItem("menu", parsedStr);
      router();
    })
    .catch(() => {
      if (showLoaderOnFail) {
        showError();
      }
    });
}

function showError() {
  app.innerHTML = `
    <div class="loader">
      <p>Greška pri učitavanju menija</p>
      <button class="retry" type="button">Pokušaj ponovo</button>
    </div>
  `;
}

function router() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash && menu[hash]) {
    renderCategory(hash);
  } else {
    renderHome();
  }
}

function goHome() {
  history.pushState(null, "", window.location.pathname);
  renderHome();
}

function renderHome() {
  app.innerHTML = `
    <div class="page">
      <div class="grid">
        ${Object.entries(menu).map(([cat, data]) => `
          <div class="card" data-cat="${cat}" role="button" tabindex="0">${data.title}</div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCategory(cat) {
  const data = menu[cat];
  const items = data.items;

  app.innerHTML = `
    <div class="page">
      <div class="back" role="button" tabindex="0">← Nazad</div>
      <h2>${data.title}</h2>
      ${items.map(item => `
        <div class="item">
          <div class="left">
            <span class="name">${item.name}</span>
            ${item.description ? `<span class="flavours">${item.description}</span>` : ""}
          </div>
          <span class="price">${item.price}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function activateCard(card) {
  card.classList.add("pressed");
  setTimeout(() => {
    window.location.hash = card.dataset.cat;
  }, 60);
}

// Click handling (mouse/touch), delegated so it works on dynamically generated markup
app.addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (card) {
    activateCard(card);
    return;
  }

  if (e.target.closest(".back")) {
    goHome();
    return;
  }

  if (e.target.closest(".retry")) {
    refreshMenu(true);
  }
});

// Keyboard handling for accessibility (Enter/Space on focused card or back button)
app.addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;

  const card = e.target.closest(".card");
  if (card) {
    e.preventDefault();
    activateCard(card);
    return;
  }

  if (e.target.closest(".back")) {
    e.preventDefault();
    goHome();
  }
});

window.addEventListener("hashchange", router);
loadMenu();
