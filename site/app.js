(function () {
  const products = window.ORBITX_PRODUCTS || [];
  const storeUrl = window.ORBITX_STORE_URL;
  const root = document.documentElement;
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fold = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const byId = (id) => products.find((p) => p.id === id);
  const previa = window.ORBITX_PREVIA === true;
  root.toggleAttribute("data-previa", previa);
  const obra = (pagina) => "em-construcao.html?pagina=" + pagina;
  const productUrl = (p) => (previa ? obra("produto") : p.url);
  const linkAttrs = previa ? "" : ' target="_blank" rel="noopener"';

  // Na prévia, o que sai da home abre na mesma aba a página "em construção"
  if (previa) {
    products.forEach((p) => (p.url = productUrl(p)));
    document.querySelectorAll("[data-store-link], [data-product-link]").forEach((a) => {
      a.removeAttribute("target");
      a.removeAttribute("rel");
    });
  }

  // Links para o Mercado Livre
  document.querySelectorAll("[data-store-link]").forEach((a) => (a.href = previa ? obra("loja") : storeUrl));
  document.querySelectorAll("[data-product-link]").forEach((a) => {
    const p = byId(Number(a.dataset.productLink));
    if (p) a.href = p.url;
  });

  // Aviso do topo
  document.querySelector(".announce__close").addEventListener("click", () => document.getElementById("announce").remove());

  // Tema claro e escuro, lembrado neste navegador
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.themeSet === theme));
    themeMeta.content = theme === "dark" ? "#0f1110" : "#f9f5ee";
  }
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
  document.querySelectorAll("[data-theme-set]").forEach((b) =>
    b.addEventListener("click", () => {
      applyTheme(b.dataset.themeSet);
      try { localStorage.setItem("orbitx-tema", b.dataset.themeSet); } catch (e) {}
    })
  );

  // Catálogo
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const search = document.getElementById("search");
  let filter = "todos";

  function card(p) {
    const off = Math.round((1 - p.price / p.old) * 100);
    return `
      <article class="card">
        <a class="card__media" href="${p.url}"${linkAttrs}>
          <span class="card__off">-${off}%</span>
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
          <img src="${p.img}" alt="${p.title}" loading="lazy">
        </a>
        <div class="card__body">
          <h3 class="card__title"><a href="${p.url}"${linkAttrs}>${p.title}</a></h3>
          <div class="card__price"><strong>${brl(p.price)}</strong><s>${brl(p.old)}</s></div>
          <p class="card__inst">${p.installments ? "ou " + p.installments : "no Mercado Livre"}</p>
          <div class="card__actions">
            <a class="btn btn--accent" href="${p.url}"${linkAttrs}>Ver produto</a>
            <a class="card__cart" href="${p.url}"${linkAttrs} aria-label="Comprar ${p.title} no Mercado Livre"><svg class="ico"><use href="#i-cart"/></svg></a>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const q = fold(search.value.trim());
    const list = products.filter((p) => (filter === "todos" || p.cat === filter) && (!q || fold(p.title).includes(q)));
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

  const toCatalog = () => document.getElementById("ofertas").scrollIntoView({ behavior: "smooth" });
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => setFilter(t.dataset.filter)));
  document.querySelectorAll("[data-filter-link]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      search.value = "";
      setFilter(el.dataset.filterLink);
      toCatalog();
    })
  );
  search.addEventListener("input", () => (search.value && filter !== "todos" ? setFilter("todos") : render()));
  search.form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (previa && search.value.trim()) location.href = obra("busca");
    else toCatalog();
  });
  document.getElementById("clearSearch").addEventListener("click", () => { search.value = ""; render(); search.focus(); });

  render();
})();
