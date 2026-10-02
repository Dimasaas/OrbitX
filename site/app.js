(function () {
  const products = window.ORBITX_PRODUCTS || [];
  const storeUrl = window.ORBITX_STORE_URL;
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const byId = (id) => products.find((p) => p.id === id);

  // Links fixos da página
  ["storeLink", "ctaLink"].forEach((id) => (document.getElementById(id).href = storeUrl));
  document.getElementById("heroCard").href = byId(5).url;
  document.getElementById("kitLink").href = byId(9).url;

  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const search = document.getElementById("search");
  let filter = "todos";

  function card(p) {
    const off = Math.round((1 - p.price / p.old) * 100);
    const pix = p.installments || "Parcele no Mercado Livre";
    return `
      <article class="card">
        <a class="card__media" href="${p.url}" target="_blank" rel="noopener">
          <span class="card__off">-${off}%</span>
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
          <img src="${p.img}" alt="${p.title}" loading="lazy">
        </a>
        <div class="card__body">
          <h3 class="card__title"><a href="${p.url}" target="_blank" rel="noopener">${p.title}</a></h3>
          <p class="card__old">${brl(p.old)}</p>
          <p class="card__price">${brl(p.price)}</p>
          <p class="card__inst">${pix}</p>
          <a class="btn btn--accent btn--block" href="${p.url}" target="_blank" rel="noopener">Comprar no Mercado Livre</a>
        </div>
      </article>`;
  }

  function render() {
    const q = search.value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const list = products.filter((p) => {
      const t = p.title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      return (filter === "todos" || p.cat === filter) && (!q || t.includes(q));
    });
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
  }

  function setFilter(f) {
    filter = f;
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.filter === f;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
    });
    render();
  }

  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => setFilter(t.dataset.filter)));
  document.querySelectorAll("[data-filter-link]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setFilter(el.dataset.filterLink);
      document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    })
  );
  search.addEventListener("input", () => {
    if (search.value && filter !== "todos") setFilter("todos");
    else render();
  });
  search.form.addEventListener("submit", () => document.getElementById("produtos").scrollIntoView({ behavior: "smooth" }));

  render();

  // Céu estrelado do topo
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((r.width * r.height) / 5000) }, () => ({
      x: Math.random() * r.width,
      y: Math.random() * r.height,
      s: Math.random() * 1.3 + 0.2,
      p: Math.random() * Math.PI * 2,
    }));
  }
  function draw(t) {
    const r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    for (const s of stars) {
      const a = reduce ? 0.7 : 0.35 + 0.45 * Math.sin(t / 900 + s.p);
      ctx.fillStyle = `rgba(230,255,220,${a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  resize();
  addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();
