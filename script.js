/*const menu = {
  "Kafe i topli napici": [
    ["Espresso", "220"],
    ["Dupli espresso", "300"],
    ["Espresso sa mlekom", "200"],
    ["Espresso sa biljnim mlekom", "220"],
    ["Latte Macchiato", "220"],
    ["Latte sa ukusom", "290", "pistać, vanila, karamela, lešnik"],
    ["Ice Coffee", "220"],
    ["Ice Coffee sa ukusom", "290", "pistać, vanila, karamela, lešnik"],
    ["Matcha", "250"],
    ["Matcha sa ukusom", "300", "jagoda, mango"],
    ["Nescafe", "190"],
    ["Domaća kafa", "160"],
    ["Čaj Stassen", "190"],
    ["Topla čokolada", "200"],
    ["Veliki plazma šejk", "350"],
    ["Mali plazma šejk", "250"]
  ],

  "Vode": [
    ["Rosa", "170"],
    ["Rosa gazirana", "170"],
    ["Romerquelle limunska trava", "220"]
  ],

  "Ceđeni sokovi": [
    ["Limunada", "190"],
    ["Limunada sa ukusom", "270", "jagoda, mojito mint, lubenica, malina, breskva, tropsko voće, mango, zova, kivi"],
    ["Ledeni čaj", "270", "jagoda, malina, breskva, tropsko voće, mango, kivi, zelena jabuka"],
    ["Ceđena pomorandža", "280"],
    ["Ceđeni grejp", "280"],
    ["Vitaminski mix", "330"],
  ],

  "Gazirani sokovi": [
    ["Coca-Cola", "230"],
    ["Coca Cola Zero", "230"],
    ["Fanta", "230"],
    ["Sprite", "230"],
    ["Schweppes bitter lemon", "230"],
    ["Schweppes tonic", "230"],
    ["Schweppes pink grapefruit", "230"],
    ["Cocta", "230"],
    ["Orangina", "300"]
  ],

    "Negazirani sokovi": [
    ["Next", "240", "jabuka, pomorandža, breskva, jagoda, šumsko voće"],
    ["Fuze tea", "240"],
    ["Cedevita ", "190", "pomorandža, limun, limun zova, mango-ananas, limunska trava"]
  ],

  "Energetska pića": [
    ["Ultra", "220"],
    ["Red Bull", "330"]
  ],

  "Točena piva": [
    ["Heineken 0,5", "280"],
    ["Heineken 0,35", "240"],
    ["Birra Moretti 0,5", "260"],
    ["Birra Moretti 0,25", "220"]
  ],

  "Flaširana piva": [
    ["Heineken 0,25", "280"],
    ["Birra Moretti 0,33", "270"],
    ["Zaječarsko 0,33", "230"],
    ["Blanc 0,33", "270"],
    ["Corona 0,33", "390"]
  ],

  "Vina i cideri": [
    ["Belo vino", "450"],
    ["Crveno vino", "450"],
    ["Rose vino", "450"],
    ["Kupinovo vino", "450"],
    ["Aspall", "300", "jabuka, malina"]
  ],

  "Žestoka pića i likeri": [
    ["Šljiva Živanović", "190"],
    ["Dunja Živanović", "190"],
    ["Viljamovka Živanović", "190"],
    ["Dunja Pevac", "230"],
    ["Medovača Pevac", "230"],
    ["Johnnie Walker Red", "280"],
    ["Johnnie Walker Black", "400"],
    ["Jameson", "280"],
    ["Jack Daniels", "300"],
    ["Smirnoff vodka", "270"],
    ["Olmeca tequila", "260"],
    ["Beefeater gin", "290"],
    ["Hendrick’s gin", "400"],
    ["Vinjak V.S.", "200"],
    ["Gorki List", "200"],
    ["Baileys", "300"],
    ["Jagermeister", "270"],
    ["Absinth", "270"]
  ],

  "Kokteli": [
    ["Negroni", "500", "campari, gin, vermouth rosso"],
    ["Old Fashioned", "500", "bourbon, sugar, angostura bitter"],
    ["Whiskey Sour", "500", "bourbon, lemon, simple syrup, foam"],
    ["Amaretto Sour", "500", "amaretto, bourbon, lemon, simple syrup, foam"],
    ["Cuba Libre", "400", "rum, lime, cola"],
    ["Margarita", "400", "tequila, triple sec, lime, agava syrup"],
    ["Tequila Sunrise", "400", "tequila, grenadine, orange juice"],
    ["Gin Tonic", "350", "gin, lime, cucumber, tonic water"],
    ["Tom Collins", "350", "gin, lemon, simple syrup, soda"],
    ["Skinny Bitch", "350", "vodka, lemon, soda"],
    ["Long Island Ice Tea", "550", "gin, vodka, rum, tequila, triple sec, lemon, cola"],
    ["Mai Tai", "450", "white rum, black rum, amaretto, triple sec, lime, pineapple juice, grenadine"],
    ["Cosmopolitan", "400", "vodka, triple sec, lime, cranberry juice"],
    ["Clover Club", "400", "gin, lemon, raspberry syrup, foam"],
    ["Espresso Martini", "500", "vodka, espresso, kahlua, vanilla syrup"],
    ["Porn Star Martini", "500", "vodka, passion fruit liquor, passion fruit purée, vanilla syrup, lime"],
    ["Aperol Spritz", "450", "aperol, prosecco, soda"],
    ["Campari Spritz", "450", "campari, prosecco, soda"],
    ["Sarti Spritz", "450", "sarti, prosecco, soda"]
  ]
};
*/
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1rItzXWh6kr0zvnpMNc2RglzlwLm4caLVHWl0seuzntPRbmfdKyiSGs-dWjBaeeSEwdnG065T66cr/pub?output=csv";
let menu = {};
const app = document.getElementById("app");

function slugify(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .replace(/\s+/g, "_");
}

function deslugify(str) {
  return (str || "").replace(/_/g, " ");
}

function fetchMenu() {
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(csv => {
      menu = parseCSV(csv);
      router();
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
    const description = parts.slice(3).join(",").trim();

    if (!category || !name) return;

    if (!result[category]) result[category] = [];

    result[category].push([name, price, description]);
  });

  return result;
}

function router() {
  const hash = window.location.hash.replace("#", "");

  if (!hash) {
    renderHome();
    return;
  }

  renderCategory(hash);
}

function renderHome() {
  app.innerHTML = `
    <div class="grid">
      ${Object.keys(menu).map(cat => `
        <div class="card" onclick="pressAndGo('${cat}', this)">
          ${deslugify(cat)}
        </div>
      `).join("")}
    </div>
  `;
}

function pressAndGo(cat, el) {
  el.classList.add("pressed");

  setTimeout(() => {
    window.location.hash = cat;
  }, 60);
}

function goToCategory(cat) {
  const slug = slugify(cat);
  window.location.hash = slug;
}

function renderCategory(cat) {
  const items = menu[cat];

  if (!items) {
    renderHome();
    return;
  }

  app.innerHTML = `
    <div class="back" onclick="history.back()">← Nazad</div>
    <h2>${deslugify(cat)}</h2>

    ${items.map(i => `
      <div class="item">
        <div class="left">
          <span class="name">${i[0]}</span>
          ${i[2] ? `<span class="flavours">${i[2]}</span>` : ""}
        </div>
        <span class="price">${i[1]}</span>
      </div>
    `).join("")}
  `;
}

window.addEventListener("hashchange", router);

fetchMenu();