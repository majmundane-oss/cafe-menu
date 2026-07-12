const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1rItzXWh6kr0zvnpMNc2RglzlwLm4caLVHWl0seuzntPRbmfdKyiSGs-dWjBaeeSEwdnG065T66cr/pub?output=csv";
let menu = {};
const app = document.getElementById("app");

function slugify(str) {
  return (str || "")
    .trim()
    .replace(/\s+/g, "_");
}

function fetchMenu() {

  const savedMenu = localStorage.getItem("menu");

  fetch(SHEET_URL + "&cache=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      menu = parseCSV(csv);

      localStorage.setItem("menu", JSON.stringify(menu));

      history.replaceState(null, "", window.location.pathname);
      renderHome(false);

    })
    .catch(() => {

      if (savedMenu) {
        menu = JSON.parse(savedMenu);
        renderHome(false);
      } else {
        app.innerHTML = `
          <div class="loader">
            <p>Greška pri učitavanju menija</p>
          </div>
        `;
      }

    });
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  lines.shift();

  const result = {};

  lines.forEach(line => {
    const parts = line.split(",");

    const categoryRaw = (parts[0] || "").trim();
    const category = slugify(categoryRaw);

    const name = (parts[1] || "").trim();
    const price = (parts[2] || "").trim();
    const description = parts.slice(3).join(",").trim().replace(/\./g, ",");

    if (!category || !name) return;

    if (!result[category]) {
      result[category] = {
        title: categoryRaw,
        items: []
      };
    }

    result[category].items.push([name, price, description]);
  });

  return result;
}

function router() {
  const hash = decodeURIComponent(window.location.hash.slice(1));

  if (!hash) {
    renderHome();
    return;
  }

  renderCategory(hash);
}

function renderHome(animate = false){
  app.innerHTML = `
    <div class="page">
      <div class="grid">
        ${Object.entries(menu).map(([cat, data]) => `
          <div class="card" onclick="pressAndGo('${cat}', this)">
            ${data.title}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function pressAndGo(cat, el) {
  el.classList.add("pressed");

  setTimeout(() => {
    el.classList.remove("pressed");
    window.location.hash = cat;
  }, 60);
}

function goHome() {
  history.pushState(null, "", window.location.pathname);
  renderHome();
}

function renderCategory(cat) {
  const data = menu[cat];

  if (!data) {
    renderHome();
    return;
  }

  const items = data.items;

  app.innerHTML = `
    <div class="page">
      <div class="back" onclick="goHome()">← Nazad</div>

      <h2>${data.title}</h2>

      ${items.map(i => `
        <div class="item">
          <div class="left">
            <span class="name">${i[0].replace(/\./g, ",")}</span>
            ${i[2] ? `<span class="flavours">${i[2]}</span>` : ""}
          </div>
          <span class="price">${i[1]}</span>
        </div>
      `).join("")}
    </div>
  `;
}

window.addEventListener("hashchange", router);

fetchMenu();