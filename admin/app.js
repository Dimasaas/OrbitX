// Painel administrativo OrbitX (demonstração).
// SPA sem dependências: rotas por hash, dados de data.js, alterações salvas no navegador.
(function () {
  "use strict";

  const KEY = "orbitx-admin-v1";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* sem armazenamento: segue só em memória */ } },
    del(k) { try { localStorage.removeItem(k); } catch (_) { /* idem */ } }
  };

  let S;
  try { S = JSON.parse(store.get(KEY)) || null; } catch (_) { S = null; }
  if (!S || S.version !== 2) S = Object.assign({ version: 2, theme: null, logged: false }, clone(window.ORBITX_SEED));
  const save = () => store.set(KEY, JSON.stringify(S));
  const TODAY = new Date(S.today);

  // ---------- utilidades ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const e = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = (n) => "R$ " + Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brl0 = (n) => "R$ " + Math.round(n || 0).toLocaleString("pt-BR");
  const pct = (n, d) => (n >= 0 ? "+" : "") + n.toLocaleString("pt-BR", { maximumFractionDigits: d == null ? 1 : d }) + "%";
  const TZ = "America/Sao_Paulo";
  const dt = (iso) => { const d = new Date(iso); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ }) + ", " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }); };
  const dfull = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
  const daysAgo = (iso) => (TODAY - new Date(iso)) / 864e5;
  const nowIso = () => new Date().toISOString();
  const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const prod = (id) => S.products.find((p) => p.id === +id);
  const cat = (id) => S.categories.find((c) => c.id === id);
  const cust = (id) => S.customers.find((c) => c.id === +id);
  const initials = (n) => n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const stars = (n) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  const log = (text) => { S.activity.unshift({ at: nowIso(), who: "Marina Souza", text }); S.activity = S.activity.slice(0, 60); };
  const valid = (o) => o.status !== "Cancelado" && o.status !== "Aguardando pagamento";

  const ORDER_ST = { "Aguardando pagamento": "warn", "Pago": "ok", "Em separação": "info", "Enviado": "info", "Entregue": "neutral", "Cancelado": "bad" };
  const NEXT = { "Aguardando pagamento": "Pago", "Pago": "Em separação", "Em separação": "Enviado", "Enviado": "Entregue" };
  const st = (label, kind) => `<span class="st st-${kind}">${e(label)}</span>`;
  const ost = (s) => st(s, ORDER_ST[s] || "neutral");
  const stockSt = (p) => p.stock === 0 ? st("Esgotado", "bad") : p.stock < p.min ? st("Baixo", "warn") : st("Normal", "ok");

  const I = {
    home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    bag: "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
    box: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10",
    stock: "M4 20h16M6 16V9M10 16V5M14 16v-6M18 16v-9",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
    users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.8M15.5 4.2a3 3 0 0 1 0 5.6",
    star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z",
    tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    page: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
    image: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15.5 9h.01",
    menu: "M4 6h16M4 12h16M4 18h10",
    palette: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-1.2-1-1.5-1-2.5 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5M7.5 11h.01M10 7.5h.01M15 7.5h.01",
    truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 18h.01M17 18h.01",
    card: "M3 6h18v12H3zM3 10h18",
    gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2",
    search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-3.5-3.5",
    burger: "M4 7h16M4 12h16M4 17h16",
    up: "M12 19V5M6 11l6-6 6 6",
    down: "M12 5v14M18 13l-6 6-6-6",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
    x: "M6 6l12 12M18 6L6 18",
    ext: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
    print: "M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",
    logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
    photo: "M4 5h16v14H4zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M20 15l-5-5-9 9",
    share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
    ban: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M5.6 5.6l12.8 12.8",
    puzzle: "M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3z",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
    key: "M15 9a4 4 0 1 1-3.5 6L8 18.5H5.5V16H8v-2.5L11 10.5A4 4 0 0 1 15 9M16 8h.01",
    brush: "M18 3l3 3-9 9-3-3zM9 12l-4 1-2 7 7-2 1-4",
    copy: "M9 9h11v11H9zM5 15H4V4h11v1",
    upload: "M12 16V4M7 9l5-5 5 5M4 20h16"
  };
  const ico = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[name]}"/></svg>`;

  // ---------- tema ----------
  function applyTheme() {
    const t = S.theme || S.store.themeDefault || "claro";
    document.documentElement.setAttribute("data-theme", t === "escuro" ? "dark" : "light");
    document.documentElement.style.setProperty("--accent", S.store.accent || "#8be41c");
  }
  const isDark = () => (S.theme || S.store.themeDefault) === "escuro";

  // ---------- navegação ----------
  const counts = () => ({
    pedidos: S.orders.filter((o) => ["Aguardando pagamento", "Pago", "Em separação"].includes(o.status)).length,
    avaliacoes: S.reviews.filter((r) => r.status === "pendente").length,
    estoque: S.products.filter((p) => p.stock < p.min).length,
    afiliados: S.affiliates.filter((a) => a.status === "pendente").length,
    beta: "Beta"
  });
  const NAV = [
    ["Loja", [["painel", "Painel", "home"], ["pedidos", "Pedidos", "bag", "pedidos"], ["produtos", "Produtos", "box"], ["estoque", "Estoque", "stock", "estoque"], ["categorias", "Categorias", "layers"], ["galeria", "Galeria", "photo"], ["clientes", "Clientes", "users"], ["avaliacoes", "Avaliações", "star", "avaliacoes"], ["banidos", "Banidos", "ban"]]],
    ["Marketing", [["cupons", "Cupons e promoções", "tag"], ["afiliados", "Afiliados", "share", "afiliados"], ["relatorios", "Relatórios", "chart"]]],
    ["Site", [["home", "Home e banners", "image"], ["paginas", "Páginas", "page"], ["menu", "Menu e rodapé", "menu"], ["templates", "Templates", "brush", "beta"], ["aparencia", "Aparência", "palette"]]],
    ["Configurações", [["plugins", "Plugins", "puzzle"], ["integracoes", "Integrações", "key"], ["dominios", "Domínios", "globe"], ["frete", "Frete", "truck"], ["pagamentos", "Pagamentos", "card"], ["config", "Loja e equipe", "gear"]]]
  ];

  function shell(section, inner) {
    const c = counts();
    const nav = NAV.map(([g, items]) => `<nav class="nav-group" aria-label="${g}"><span>${g}</span>${items.map(([id, label, icon, badge]) =>
      `<a class="nav-link${section === id ? " on" : ""}" href="#/${id}"${section === id ? ' aria-current="page"' : ""}><span>${ico(icon)}${label}</span>${badge && c[badge] ? `<b class="badge${badge === "beta" ? " badge--beta" : ""}">${c[badge]}</b>` : ""}</a>`).join("")}</nav>`).join("");
    return `<div class="shell">
      <aside class="side" id="side">
        <a class="brand" href="#/painel"><img src="img/${isDark() ? "logo-escuro" : "logo-claro"}.svg" alt="OrbitX Technology" width="100" height="32"><span class="pill-admin">Admin</span></a>
        ${nav}
        <p class="demo-note">Demonstração com dados fictícios. As alterações ficam salvas neste navegador. <button type="button" data-act="reset">Restaurar dados</button></p>
      </aside>
      <div class="main">
        <header class="top">
          <button class="btn btn--icon menu-btn" type="button" data-act="menu" aria-label="Abrir menu">${ico("burger")}</button>
          <div class="search-global" role="search">
            ${ico("search")}
            <label class="sr" for="q">Buscar no painel</label>
            <input id="q" type="search" placeholder="Buscar pedido, produto ou cliente" autocomplete="off">
            <div class="search-results" id="qres" hidden></div>
          </div>
          <div class="top-right">
            <div class="seg" role="group" aria-label="Aparência do painel">
              <button type="button" data-act="theme" data-v="claro" aria-pressed="${!isDark()}">Claro</button>
              <button type="button" data-act="theme" data-v="escuro" aria-pressed="${isDark()}">Escuro</button>
            </div>
            <a class="btn" href="../" target="_blank" rel="noopener">${ico("ext")}Ver loja</a>
            <div class="me"><span class="avatar">MS</span><div><b>Marina Souza</b><small>Administradora</small></div></div>
            <button class="btn btn--icon" type="button" data-act="logout" aria-label="Sair">${ico("logout")}</button>
          </div>
        </header>
        <main class="content" id="content">${inner}</main>
      </div>
    </div>`;
  }

  const head = (title, sub, actions, crumb) => `<div class="head"><div>${crumb ? `<a class="crumb" href="${crumb[0]}">← ${e(crumb[1])}</a>` : ""}<h1>${e(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
  const sw = (attrs, checked, label) => `<label class="switch"><input type="checkbox" ${attrs} ${checked ? "checked" : ""}>${label ? `<span>${label}</span>` : ""}</label>`;

  // ---------- métricas ----------
  function periodStats(days, offset) {
    const os = S.orders.filter((o) => { const a = daysAgo(o.at); return a >= offset && a < offset + days; });
    const ok = os.filter(valid);
    const rev = ok.reduce((s, o) => s + o.total, 0);
    const visits = Math.round(days * 920 * (offset ? 0.93 : 1));
    return { orders: ok.length, all: os.length, rev, avg: ok.length ? rev / ok.length : 0, conv: visits ? (ok.length / visits) * 100 : 0, visits };
  }

  // ---------- telas ----------
  const V = {};

  V.painel = () => {
    const r = S.ui && S.ui.range || 30;
    const cur = periodStats(r, 0), prev = periodStats(r, r);
    const d = (a, b) => (b ? ((a - b) / b) * 100 : 0);
    const kp = [
      ["Receita", brl0(cur.rev), d(cur.rev, prev.rev)],
      ["Pedidos", cur.orders.toLocaleString("pt-BR"), d(cur.orders, prev.orders)],
      ["Ticket médio", brl(cur.avg), d(cur.avg, prev.avg)],
      ["Conversão", cur.conv.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%", d(cur.conv, prev.conv)]
    ];
    const days = Math.max(r, 7);
    const series = [];
    for (let i = days - 1; i >= 0; i--) series.push(S.orders.filter((o) => valid(o) && Math.floor(daysAgo(o.at)) === i).reduce((s, o) => s + o.total, 0));
    const max = Math.max(...series, 1);
    const fmtDay = (i) => new Date(TODAY - i * 864e5).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
    const low = S.products.filter((p) => p.stock < p.min).sort((a, b) => a.stock - b.stock);
    const pending = S.orders.filter((o) => o.status === "Pago" || o.status === "Em separação");
    const top = topProducts(r).slice(0, 5);
    const topMax = Math.max(...top.map((t) => t.rev), 1);
    const pendRev = S.reviews.filter((x) => x.status === "pendente").length;
    return head("Boa noite, Marina", `Resumo da loja ${r === 1 ? "hoje" : "nos últimos " + r + " dias"}`,
      `<div class="chips">${[[1, "Hoje"], [7, "7 dias"], [30, "30 dias"], [90, "90 dias"]].map(([v, l]) => `<button type="button" class="chip${r === v ? " on" : ""}" data-act="range" data-v="${v}">${l}</button>`).join("")}</div><a class="btn btn--accent" href="#/produtos/novo">+ Novo produto</a>`) +
      `<div class="grid-kpi">${kp.map(([l, v, dd]) => `<div class="card kpi"><span>${l}</span><b>${v}</b><span class="delta ${dd >= 0 ? "up" : "down"}">${pct(dd)} <em>vs. período anterior</em></span></div>`).join("")}</div>
      <div class="grid-kpi">
        <a class="card kpi" href="#/pedidos?s=Pago" style="text-decoration:none"><span>Pedidos para separar</span><b>${pending.length}</b><span class="soft">Pagos e em separação</span></a>
        <a class="card kpi" href="#/pedidos?s=Aguardando pagamento" style="text-decoration:none"><span>Aguardando pagamento</span><b>${S.orders.filter((o) => o.status === "Aguardando pagamento").length}</b><span class="soft">Pix e boletos em aberto</span></a>
        <a class="card kpi" href="#/estoque" style="text-decoration:none"><span>Produtos com estoque baixo</span><b>${low.length}</b><span class="soft">${S.products.filter((p) => p.stock === 0).length} esgotado(s)</span></a>
        <a class="card kpi" href="#/avaliacoes" style="text-decoration:none"><span>Avaliações para moderar</span><b>${pendRev}</b><span class="soft">Aguardando aprovação</span></a>
      </div>
      <div class="grid-2">
        <section class="card card-pad">
          <div class="head"><h2>Vendas por dia</h2><span class="soft">Receita em R$ (pedidos pagos)</span></div>
          <div class="chart" role="img" aria-label="Receita diária dos últimos ${days} dias">${series.map((v, i) => `<div style="height:${Math.max(2, Math.round((v / max) * 100))}%" title="${fmtDay(days - 1 - i)}: ${brl(v)}"></div>`).join("")}</div>
          <div class="chart-axis"><span>${fmtDay(days - 1)}</span><span>${fmtDay(Math.floor(days / 2))}</span><span>${fmtDay(0)}</span></div>
        </section>
        <section class="card card-pad stack">
          <div class="head"><h2>Mais vendidos</h2><a class="soft" href="#/relatorios">Relatórios</a></div>
          ${top.map((t) => `<div class="hbar"><span class="cell-prod" style="min-width:0"><img class="thumb" src="${t.p.img}" alt=""><b style="font-size:13px">${e(t.p.title)}</b></span><span class="r num"><b>${brl0(t.rev)}</b><br><small class="soft">${t.qty} un.</small></span><div class="track"><i style="width:${(t.rev / topMax) * 100}%"></i></div></div>`).join("")}
        </section>
      </div>
      <div class="grid-2">
        <section class="card">
          <div class="card-head"><h2>Pedidos recentes</h2><a href="#/pedidos">Ver todos</a></div>
          <div class="table-box"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th class="r">Total</th></tr></thead><tbody>
          ${S.orders.slice(0, 7).map((o) => `<tr class="row-link" data-go="#/pedidos/${o.id}"><td><b>#${o.id}</b><br><small class="soft">${dt(o.at)}</small></td><td>${e(o.client)}<br><small class="soft">${e(o.channel)}</small></td><td>${ost(o.status)}</td><td class="r num"><b>${brl(o.total)}</b></td></tr>`).join("")}
          </tbody></table></div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Estoque baixo</h2><a href="#/estoque">Abrir estoque</a></div>
          <div class="list-plain">${low.map((p) => `<div><img class="thumb" src="${p.img}" alt=""><a class="grow" href="#/produtos/${p.id}" style="text-decoration:none;font-weight:600">${e(p.title)}</a>${stockSt(p)}<b class="num">${p.stock} un.</b></div>`).join("") || `<p class="empty">Todo o estoque está acima do mínimo.</p>`}</div>
        </section>
      </div>
      <section class="card"><div class="card-head"><h2>Atividade da equipe</h2><a href="#/config?tab=atividade">Ver tudo</a></div>
        <ul class="timeline">${S.activity.slice(0, 5).map((a) => `<li><div><b>${e(a.who)}</b> ${e(a.text.charAt(0).toLowerCase() + a.text.slice(1))}<small>${dt(a.at)}</small></div></li>`).join("")}</ul></section>`;
  };

  function topProducts(days) {
    const m = {};
    S.orders.filter((o) => valid(o) && daysAgo(o.at) < days).forEach((o) => o.items.forEach((it) => {
      m[it.pid] = m[it.pid] || { qty: 0, rev: 0 };
      m[it.pid].qty += it.qty; m[it.pid].rev += it.qty * it.price;
    }));
    return Object.keys(m).map((id) => ({ p: prod(id), ...m[id] })).filter((x) => x.p).sort((a, b) => b.rev - a.rev);
  }

  // Pedidos
  V.pedidos = (id, q) => {
    if (id) return orderDetail(+id);
    const f = { s: q.get("s") || "Todos", c: q.get("c") || "Todos", t: q.get("t") || "" };
    const sts = ["Todos", "Aguardando pagamento", "Pago", "Em separação", "Enviado", "Entregue", "Cancelado"];
    let list = S.orders.filter((o) => (f.s === "Todos" || o.status === f.s) && (f.c === "Todos" || o.channel === f.c));
    if (f.t) { const t = f.t.toLowerCase(); list = list.filter((o) => String(o.id).includes(t) || o.client.toLowerCase().includes(t) || o.items.some((i) => i.title.toLowerCase().includes(t))); }
    const shown = list.slice(0, 60);
    return head("Pedidos", `${S.orders.length} pedidos no total, ${list.length} neste filtro`, `<button class="btn" type="button" data-act="csv-orders">Exportar CSV</button>`) +
      `<div class="chips">${sts.map((s) => `<a class="chip${f.s === s ? " on" : ""}" href="${qs("pedidos", { ...f, s })}">${s}<span class="n">${s === "Todos" ? S.orders.length : S.orders.filter((o) => o.status === s).length}</span></a>`).join("")}</div>
      <section class="card">
        <form class="toolbar" data-form="filter-orders">
          <div class="search-global">${ico("search")}<label class="sr" for="ot">Buscar pedidos</label><input id="ot" name="t" type="search" value="${e(f.t)}" placeholder="Número, cliente ou produto"></div>
          <label class="sr" for="oc">Canal</label>
          <select id="oc" name="c" class="input" style="width:auto">${["Todos", "Site", "Mercado Livre", "WhatsApp"].map((c) => `<option${f.c === c ? " selected" : ""}>${c}</option>`).join("")}</select>
          <input type="hidden" name="s" value="${e(f.s)}">
          <button class="btn" type="submit">Filtrar</button>
        </form>
        <div class="bulk" id="bulk-orders" hidden><span id="bulk-n">0 selecionados</span>
          <button class="btn btn--sm" type="button" data-act="bulk-order" data-v="Em separação">Marcar em separação</button>
          <button class="btn btn--sm" type="button" data-act="bulk-order" data-v="Enviado">Marcar enviados</button>
          <button class="btn btn--sm" type="button" data-act="print-labels">Imprimir etiquetas</button>
        </div>
        <div class="table-box"><table><thead><tr><th><input class="check" type="checkbox" data-all="orders" aria-label="Selecionar todos"></th><th>Pedido</th><th>Data</th><th>Cliente</th><th>Itens</th><th>Canal</th><th>Pagamento</th><th>Status</th><th class="r">Total</th></tr></thead><tbody>
        ${shown.map((o) => `<tr class="row-link" data-go="#/pedidos/${o.id}"><td><input class="check" type="checkbox" data-sel="orders" value="${o.id}" aria-label="Selecionar pedido ${o.id}"></td><td><b>#${o.id}</b></td><td class="muted">${dt(o.at)}</td><td>${e(o.client)}</td><td class="muted">${o.items.reduce((s, i) => s + i.qty, 0)} item(ns)</td><td>${e(o.channel)}</td><td class="muted">${e(o.payment)}</td><td>${ost(o.status)}</td><td class="r num"><b>${brl(o.total)}</b></td></tr>`).join("") || `<tr><td colspan="9" class="empty">Nenhum pedido encontrado.</td></tr>`}
        </tbody></table></div>
        ${list.length > shown.length ? `<p class="empty">Mostrando os 60 mais recentes de ${list.length}. Use os filtros para refinar.</p>` : ""}
      </section>`;
  };

  function orderDetail(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return notFound();
    const c = cust(o.cid);
    const next = NEXT[o.status];
    return head("Pedido #" + o.id, `${dt(o.at)} · ${e(o.channel)} · ${ost(o.status)}`,
      `${next ? `<button class="btn btn--accent" type="button" data-act="order-status" data-id="${o.id}" data-v="${next}">Marcar como ${next.toLowerCase()}</button>` : ""}
       <button class="btn" type="button" data-act="print">${ico("print")}Imprimir</button>
       ${o.status !== "Cancelado" && o.status !== "Entregue" ? `<button class="btn btn--danger" type="button" data-act="order-status" data-id="${o.id}" data-v="Cancelado">Cancelar</button>` : ""}`, ["#/pedidos", "Pedidos"]) +
      `<div class="grid-form">
        <div class="stack">
          <section class="card"><div class="card-head"><h2>Itens</h2></div>
            <div class="table-box"><table><tbody>${o.items.map((it) => `<tr><td><span class="cell-prod"><img class="thumb" src="${it.img}" alt=""><span><b>${e(it.title)}</b><small>${e(it.sku)}</small></span></span></td><td class="num">${it.qty} × ${brl(it.price)}</td><td class="r num"><b>${brl(it.qty * it.price)}</b></td></tr>`).join("")}
              <tr><td colspan="2" class="muted">Subtotal</td><td class="r num">${brl(o.subtotal)}</td></tr>
              <tr><td colspan="2" class="muted">Frete (${e(o.carrier)})</td><td class="r num">${o.shipping ? brl(o.shipping) : "Grátis"}</td></tr>
              ${o.discount ? `<tr><td colspan="2" class="muted">Desconto ${o.coupon ? "(cupom " + e(o.coupon) + ")" : ""}</td><td class="r num">− ${brl(o.discount)}</td></tr>` : ""}
              <tr><td colspan="2"><b>Total</b></td><td class="r num"><b style="font-size:17px">${brl(o.total)}</b></td></tr>
            </tbody></table></div></section>
          <section class="card card-pad"><form class="form" data-form="tracking" data-id="${o.id}">
            <h2>Envio</h2>
            <div class="row">
              <div class="field"><label for="carrier">Transportadora</label><select id="carrier" name="carrier" class="input">${["Correios PAC", "Correios SEDEX", "Mercado Envios", "Jadlog", "Retirada em Goiânia"].map((x) => `<option${o.carrier === x ? " selected" : ""}>${x}</option>`).join("")}</select></div>
              <div class="field"><label for="tracking">Código de rastreio</label><input id="tracking" name="tracking" class="input" value="${e(o.tracking)}" placeholder="BR000000000OX"></div>
            </div>
            <div><button class="btn btn--dark" type="submit">Salvar envio</button></div>
          </form></section>
          <section class="card"><div class="card-head"><h2>Histórico</h2></div>
            <ul class="timeline">${o.history.slice().reverse().map((h) => `<li><div>${e(h.text)}<small>${dt(h.at)}</small></div></li>`).join("")}</ul>
            <form class="toolbar" data-form="order-note" data-id="${o.id}" style="border-top:1px solid var(--line)"><label class="sr" for="note">Nota interna</label><input id="note" name="note" class="input" style="flex:1;min-width:200px" placeholder="Adicionar nota interna (só a equipe vê)" required><button class="btn" type="submit">Adicionar</button></form>
          </section>
        </div>
        <div class="stack">
          <section class="card card-pad stack">
            <h2>Cliente</h2>
            <div class="me"><span class="avatar">${initials(o.client)}</span><div><a href="#/clientes/${o.cid}" style="font-weight:700">${e(o.client)}</a><small>${c ? S.orders.filter((x) => x.cid === c.id).length + " pedidos" : ""}</small></div></div>
            ${c ? `<div><span class="label">Contato</span><br>${e(c.email)}<br>${e(c.phone)}</div>` : ""}
            <div><span class="label">Endereço de entrega</span><br>${e(o.address)}</div>
          </section>
          <section class="card card-pad stack">
            <h2>Pagamento</h2>
            <div><span class="label">Forma</span><br>${e(o.payment)}</div>
            <div><span class="label">Situação</span><br>${o.status === "Aguardando pagamento" ? st("Pendente", "warn") : o.status === "Cancelado" ? st("Não pago", "bad") : st("Aprovado", "ok")}</div>
          </section>
          <section class="card card-pad stack">
            <label class="label" for="ostatus">Alterar status manualmente</label>
            <select id="ostatus" class="input" data-change="order-status" data-id="${o.id}">${Object.keys(ORDER_ST).map((s) => `<option${o.status === s ? " selected" : ""}>${s}</option>`).join("")}</select>
            <small class="hint">O cliente recebe um e-mail quando o pedido é pago e quando é enviado.</small>
          </section>
        </div>
      </div>`;
  }

  // Produtos
  V.produtos = (id, q) => {
    if (id) return productForm(id === "novo" ? null : prod(id), id);
    const f = { c: q.get("c") || "todas", s: q.get("s") || "todos", t: q.get("t") || "" };
    let list = S.products.filter((p) => (f.c === "todas" || p.cat === f.c) && (f.s === "todos" || p.status === f.s));
    if (f.t) { const t = f.t.toLowerCase(); list = list.filter((p) => p.title.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)); }
    const sold = {}; topProducts(30).forEach((x) => (sold[x.p.id] = x.qty));
    return head("Produtos", `${S.products.length} produtos cadastrados`, `<button class="btn" type="button" data-act="csv-products">Exportar CSV</button><a class="btn btn--accent" href="#/produtos/novo">+ Novo produto</a>`) +
      `<section class="card">
        <form class="toolbar" data-form="filter-products">
          <div class="search-global">${ico("search")}<label class="sr" for="pt">Buscar produtos</label><input id="pt" name="t" type="search" value="${e(f.t)}" placeholder="Nome ou SKU"></div>
          <label class="sr" for="pc">Categoria</label><select id="pc" name="c" class="input" style="width:auto"><option value="todas">Todas as categorias</option>${S.categories.map((c) => `<option value="${c.id}"${f.c === c.id ? " selected" : ""}>${e(c.name)}</option>`).join("")}</select>
          <label class="sr" for="ps">Status</label><select id="ps" name="s" class="input" style="width:auto">${[["todos", "Todos os status"], ["ativo", "Ativos"], ["rascunho", "Rascunhos"], ["inativo", "Inativos"]].map(([v, l]) => `<option value="${v}"${f.s === v ? " selected" : ""}>${l}</option>`).join("")}</select>
          <button class="btn" type="submit">Filtrar</button>
        </form>
        <div class="bulk" id="bulk-products" hidden><span id="bulk-n">0 selecionados</span>
          <button class="btn btn--sm" type="button" data-act="bulk-product" data-v="ativo">Ativar</button>
          <button class="btn btn--sm" type="button" data-act="bulk-product" data-v="inativo">Desativar</button>
          <button class="btn btn--sm" type="button" data-act="bulk-price">Reajustar preço</button>
        </div>
        <div class="table-box"><table><thead><tr><th><input class="check" type="checkbox" data-all="products" aria-label="Selecionar todos"></th><th>Produto</th><th>Categoria</th><th class="r">Preço</th><th class="r">Estoque</th><th class="r">Vendas 30d</th><th>Status</th><th></th></tr></thead><tbody>
        ${list.map((p) => `<tr class="row-link" data-go="#/produtos/${p.id}"><td><input class="check" type="checkbox" data-sel="products" value="${p.id}" aria-label="Selecionar ${e(p.title)}"></td>
          <td><span class="cell-prod"><img class="thumb" src="${e(p.img)}" alt=""><span><b>${e(p.title)}</b><small>${e(p.sku)}${p.featured ? " · Destaque na home" : ""}</small></span></span></td>
          <td>${e(cat(p.cat) ? cat(p.cat).name : "-")}</td>
          <td class="r num"><b>${brl(p.price)}</b><br><small class="soft" style="text-decoration:line-through">${brl(p.old)}</small></td>
          <td class="r num">${p.stock} ${p.stock < p.min ? stockSt(p) : ""}</td>
          <td class="r num">${sold[p.id] || 0}</td>
          <td>${st(p.status, p.status === "ativo" ? "ok" : p.status === "rascunho" ? "warn" : "neutral")}</td>
          <td class="r"><button class="btn btn--sm" type="button" data-act="dup-product" data-id="${p.id}">Duplicar</button></td></tr>`).join("") || `<tr><td colspan="8" class="empty">Nenhum produto encontrado.</td></tr>`}
        </tbody></table></div>
      </section>`;
  };

  function productForm(p, id) {
    if (id !== "novo" && !p) return notFound();
    const isNew = !p;
    p = p || { id: 0, sku: "", cat: "suportes", img: "img/p5.webp", title: "", old: 0, price: 0, cost: 0, stock: 0, min: 5, weight: 0, dims: "", status: "rascunho", slug: "", description: "", seoTitle: "", seoDescription: "", featured: false, variants: [], url: "", tag: "" };
    const margin = p.price ? ((p.price - p.cost) / p.price) * 100 : 0;
    const imgs = S.products.map((x) => x.img).filter((v, i, a) => a.indexOf(v) === i);
    return head(isNew ? "Novo produto" : p.title, isNew ? "Preencha os dados e salve como rascunho ou publique." : `${e(p.sku)} · criado no catálogo OrbitX`,
      `${!isNew ? `<button class="btn btn--danger" type="button" data-act="del-product" data-id="${p.id}">${ico("trash")}Excluir</button>` : ""}<button class="btn btn--accent" type="submit" form="pform">Salvar produto</button>`, ["#/produtos", "Produtos"]) +
      `<form id="pform" class="grid-form" data-form="product" data-id="${p.id}">
        <div class="stack">
          <section class="card card-pad form">
            <div class="field"><label for="title">Nome do produto</label><input id="title" name="title" class="input" value="${e(p.title)}" required data-slug="#slug"></div>
            <div class="field"><label for="description">Descrição</label><textarea id="description" name="description" class="input" rows="5">${e(p.description)}</textarea></div>
            <div class="field"><label for="tag">Selo no card (opcional)</label><input id="tag" name="tag" class="input" value="${e(p.tag || "")}" placeholder="Ex.: Mais vendido, Kit, Lançamento"></div>
          </section>
          <section class="card card-pad form">
            <h2>Imagem</h2>
            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><img id="pimg" class="thumb" src="${e(p.img)}" alt="" style="width:96px;height:96px">
              <div class="field" style="flex:1;min-width:200px"><label for="img">Imagem principal</label><select id="img" name="img" class="input" data-preview="#pimg">${imgs.map((src) => `<option value="${src}"${p.img === src ? " selected" : ""}>${src.replace("img/", "")}</option>`).join("")}</select><small>Na versão real, aqui entra o upload de fotos (arrastar e soltar, reordenar, texto alternativo).</small></div></div>
          </section>
          <section class="card card-pad form">
            <h2>Preço</h2>
            <div class="row">
              <div class="field"><label for="price">Preço de venda</label><div class="prefix"><span>R$</span><input id="price" name="price" class="input" type="number" step="0.01" min="0" value="${p.price}" required data-calc></div></div>
              <div class="field"><label for="old">Preço "de" (riscado)</label><div class="prefix"><span>R$</span><input id="old" name="old" class="input" type="number" step="0.01" min="0" value="${p.old}"></div></div>
              <div class="field"><label for="cost">Custo</label><div class="prefix"><span>R$</span><input id="cost" name="cost" class="input" type="number" step="0.01" min="0" value="${p.cost}" data-calc></div></div>
            </div>
            <p class="hint" id="margin">Margem: <b>${margin.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</b> · Lucro por unidade: <b>${brl(p.price - p.cost)}</b></p>
          </section>
          <section class="card card-pad form">
            <h2>Estoque e envio</h2>
            <div class="row">
              <div class="field"><label for="sku">SKU</label><input id="sku" name="sku" class="input" value="${e(p.sku)}" required></div>
              <div class="field"><label for="stock">Estoque atual</label><input id="stock" name="stock" class="input" type="number" min="0" value="${p.stock}"></div>
              <div class="field"><label for="min">Estoque mínimo</label><input id="min" name="min" class="input" type="number" min="0" value="${p.min}"><small>Abaixo disso, o painel avisa.</small></div>
            </div>
            <div class="row">
              <div class="field"><label for="weight">Peso (g)</label><input id="weight" name="weight" class="input" type="number" min="0" value="${p.weight}"></div>
              <div class="field"><label for="dims">Dimensões da embalagem</label><input id="dims" name="dims" class="input" value="${e(p.dims)}" placeholder="C × L × A cm"></div>
            </div>
          </section>
          <section class="card card-pad form">
            <div class="head"><h2>Variações</h2><button class="btn btn--sm" type="button" data-act="add-variant">+ Variação</button></div>
            <div id="variants" class="stack" style="gap:8px">${(p.variants || []).map(variantRow).join("") || `<p class="hint" data-empty>Sem variações. Adicione se o produto tiver cor, acabamento ou modelo.</p>`}</div>
          </section>
          <section class="card card-pad form">
            <h2>SEO e Mercado Livre</h2>
            <div class="field"><label for="slug">Endereço da página</label><div class="prefix"><span>/produto/</span><input id="slug" name="slug" class="input" value="${e(p.slug)}"></div></div>
            <div class="field"><label for="seoTitle">Título para o Google</label><input id="seoTitle" name="seoTitle" class="input" maxlength="70" value="${e(p.seoTitle)}" placeholder="${e(p.title)}" data-seo></div>
            <div class="field"><label for="seoDescription">Descrição para o Google</label><textarea id="seoDescription" name="seoDescription" class="input" maxlength="160" rows="2" data-seo placeholder="Até 160 caracteres">${e(p.seoDescription)}</textarea></div>
            <div class="seo-preview" id="seo"><span>orbitx.duckdns.org › produto › ${e(p.slug || "novo-produto")}</span><b>${e(p.seoTitle || p.title || "Título do produto")}</b><p>${e(p.seoDescription || p.description.slice(0, 150))}</p></div>
            <div class="field"><label for="url">Link do anúncio no Mercado Livre</label><input id="url" name="url" class="input" type="url" value="${e(p.url)}" placeholder="https://www.mercadolivre.com.br/..."></div>
          </section>
        </div>
        <div class="stack">
          <section class="card card-pad form">
            <h2>Publicação</h2>
            <div class="field"><label for="status">Status</label><select id="status" name="status" class="input">${[["ativo", "Ativo (visível na loja)"], ["rascunho", "Rascunho"], ["inativo", "Inativo (oculto)"]].map(([v, l]) => `<option value="${v}"${p.status === v ? " selected" : ""}>${l}</option>`).join("")}</select></div>
            ${sw('name="featured"', p.featured, "Destaque na home")}
          </section>
          <section class="card card-pad form">
            <h2>Organização</h2>
            <div class="field"><label for="cat">Categoria</label><select id="cat" name="cat" class="input">${S.categories.map((c) => `<option value="${c.id}"${p.cat === c.id ? " selected" : ""}>${e(c.name)}</option>`).join("")}</select></div>
          </section>
          ${!isNew ? `<section class="card card-pad stack"><h2>Desempenho (30 dias)</h2>${(() => { const t = topProducts(30).find((x) => x.p.id === p.id); return `<div><span class="soft">Unidades vendidas</span><br><b class="num" style="font-size:22px">${t ? t.qty : 0}</b></div><div><span class="soft">Receita</span><br><b class="num" style="font-size:22px">${brl(t ? t.rev : 0)}</b></div>`; })()}
            <div><span class="soft">Avaliação média</span><br>${(() => { const rs = S.reviews.filter((r) => r.pid === p.id && r.status === "aprovada"); return rs.length ? `<span class="stars">${stars(Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length))}</span> <span class="soft">(${rs.length})</span>` : `<span class="soft">Sem avaliações</span>`; })()}</div></section>` : ""}
        </div>
      </form>`;
  }
  const variantRow = (v) => `<div class="row" data-variant style="grid-template-columns:minmax(0,2fr) minmax(0,1fr) auto;align-items:end"><div class="field"><label>Nome da variação</label><input class="input" name="vname" value="${e(v.name)}"></div><div class="field"><label>Estoque</label><input class="input" type="number" min="0" name="vstock" value="${v.stock}"></div><button class="btn btn--icon" type="button" data-act="del-variant" aria-label="Remover variação">${ico("x")}</button></div>`;

  // Estoque
  V.estoque = () => {
    const total = S.products.reduce((s, p) => s + p.stock, 0);
    const value = S.products.reduce((s, p) => s + p.stock * p.cost, 0);
    return head("Estoque", "Ajuste quantidades, registre entradas e acompanhe o histórico.", "") +
      `<div class="grid-kpi">
        <div class="card kpi"><span>Unidades em estoque</span><b>${total}</b></div>
        <div class="card kpi"><span>Valor em estoque (custo)</span><b>${brl0(value)}</b></div>
        <div class="card kpi"><span>Abaixo do mínimo</span><b>${S.products.filter((p) => p.stock < p.min && p.stock > 0).length}</b></div>
        <div class="card kpi"><span>Esgotados</span><b>${S.products.filter((p) => p.stock === 0).length}</b></div>
      </div>
      <section class="card"><div class="table-box"><table><thead><tr><th>Produto</th><th>Situação</th><th class="r">Mínimo</th><th class="r">Atual</th><th>Ajuste</th></tr></thead><tbody>
      ${S.products.slice().sort((a, b) => a.stock / (a.min || 1) - b.stock / (b.min || 1)).map((p) => `<tr><td><span class="cell-prod"><img class="thumb" src="${p.img}" alt=""><span><b>${e(p.title)}</b><small>${e(p.sku)}</small></span></span></td><td>${stockSt(p)}</td><td class="r num">${p.min}</td><td class="r num"><b style="font-size:16px">${p.stock}</b></td>
        <td><form class="chips" data-form="stock" data-id="${p.id}" style="flex-wrap:nowrap"><label class="sr" for="sq${p.id}">Quantidade</label><input id="sq${p.id}" name="qty" class="input" type="number" value="10" style="width:80px"><label class="sr" for="sr${p.id}">Motivo</label><select id="sr${p.id}" name="reason" class="input" style="width:auto"><option>Entrada de fornecedor</option><option>Ajuste de inventário</option><option>Avaria</option><option>Devolução</option></select><button class="btn btn--sm" name="dir" value="1" type="submit">Entrada</button><button class="btn btn--sm" name="dir" value="-1" type="submit">Saída</button></form></td></tr>`).join("")}
      </tbody></table></div></section>
      <section class="card"><div class="card-head"><h2>Movimentações</h2></div><div class="table-box"><table><thead><tr><th>Data</th><th>Produto</th><th>Motivo</th><th>Responsável</th><th class="r">Qtd.</th></tr></thead><tbody>
      ${S.stockMoves.slice(0, 30).map((m) => `<tr><td class="muted">${dt(m.at)}</td><td>${e(prod(m.pid) ? prod(m.pid).title : "-")}</td><td>${e(m.reason)}</td><td class="muted">${e(m.who)}</td><td class="r num"><b class="${m.qty > 0 ? "delta up" : "delta down"}">${m.qty > 0 ? "+" : ""}${m.qty}</b></td></tr>`).join("")}
      </tbody></table></div></section>`;
  };

  // Categorias
  V.categorias = () => head("Categorias", "Organize o catálogo e o menu da loja.", `<button class="btn btn--accent" type="button" data-act="edit-cat">+ Nova categoria</button>`) +
    `<section class="card"><div class="table-box"><table><thead><tr><th>Categoria</th><th>Endereço</th><th class="r">Produtos</th><th>Visível na loja</th><th></th></tr></thead><tbody>
    ${S.categories.map((c) => `<tr><td><b>${e(c.name)}</b><br><small class="soft">${e(c.description)}</small></td><td class="muted">/categoria/${e(c.slug)}</td><td class="r num">${S.products.filter((p) => p.cat === c.id).length}</td><td>${sw(`data-change="cat-visible" data-id="${c.id}" aria-label="Visível"`, c.visible)}</td><td class="r"><button class="btn btn--sm" type="button" data-act="edit-cat" data-id="${c.id}">Editar</button> <button class="btn btn--sm btn--danger" type="button" data-act="del-cat" data-id="${c.id}">Excluir</button></td></tr>`).join("")}
    </tbody></table></div></section>`;

  // Clientes
  V.clientes = (id, q) => {
    if (id) return customerDetail(+id);
    const t = (q.get("t") || "").toLowerCase();
    const seg = q.get("g") || "todos";
    const stats = (c) => { const os = S.orders.filter((o) => o.cid === c.id && valid(o)); return { n: os.length, ltv: os.reduce((s, o) => s + o.total, 0), last: os[0] ? os[0].at : null }; };
    let list = S.customers.map((c) => ({ c, s: stats(c) }));
    if (t) list = list.filter(({ c }) => (c.name + c.email + c.city).toLowerCase().includes(t));
    if (seg === "vip") list = list.filter(({ c }) => c.tags.includes("VIP"));
    if (seg === "recorrentes") list = list.filter(({ s }) => s.n > 1);
    if (seg === "inativos") list = list.filter(({ s }) => !s.last || daysAgo(s.last) > 60);
    if (seg === "newsletter") list = list.filter(({ c }) => c.newsletter);
    list.sort((a, b) => b.s.ltv - a.s.ltv);
    return head("Clientes", `${S.customers.length} clientes cadastrados`, `<button class="btn" type="button" data-act="csv-customers">Exportar CSV</button>`) +
      `<div class="chips">${[["todos", "Todos"], ["vip", "VIP"], ["recorrentes", "Compraram mais de 1 vez"], ["inativos", "Sem compra há 60 dias"], ["newsletter", "Aceitam e-mail"]].map(([v, l]) => `<a class="chip${seg === v ? " on" : ""}" href="${qs("clientes", { g: v, t })}">${l}</a>`).join("")}</div>
      <section class="card"><form class="toolbar" data-form="filter-customers"><div class="search-global">${ico("search")}<label class="sr" for="ct">Buscar clientes</label><input id="ct" name="t" type="search" value="${e(t)}" placeholder="Nome, e-mail ou cidade"></div><input type="hidden" name="g" value="${e(seg)}"><button class="btn" type="submit">Buscar</button></form>
      <div class="table-box"><table><thead><tr><th>Cliente</th><th>Cidade</th><th class="r">Pedidos</th><th class="r">Total gasto</th><th>Última compra</th><th>Marcadores</th></tr></thead><tbody>
      ${list.map(({ c, s }) => `<tr class="row-link" data-go="#/clientes/${c.id}"><td><span class="me"><span class="avatar">${initials(c.name)}</span><span><b>${e(c.name)}</b><br><small class="soft">${e(c.email)}</small></span></span></td><td>${e(c.city)}/${e(c.uf)}</td><td class="r num">${s.n}</td><td class="r num"><b>${brl(s.ltv)}</b></td><td class="muted">${s.last ? dfull(s.last) : "Nunca comprou"}</td><td>${c.tags.map((x) => st(x, "info")).join(" ")}</td></tr>`).join("") || `<tr><td colspan="6" class="empty">Nenhum cliente encontrado.</td></tr>`}
      </tbody></table></div></section>`;
  };

  function customerDetail(id) {
    const c = cust(id);
    if (!c) return notFound();
    const os = S.orders.filter((o) => o.cid === id);
    const ok = os.filter(valid);
    const ltv = ok.reduce((s, o) => s + o.total, 0);
    const isBanned = S.banned.some((b) => b.value === c.email);
    return head(c.name, `Cliente desde ${dfull(c.since)} · ${e(c.city)}/${e(c.uf)}${isBanned ? " · " + st("Banido", "bad") : ""}`, isBanned ? "" : `<button class="btn btn--danger" type="button" data-act="ban-customer" data-id="${c.id}">${ico("ban")}Banir cliente</button>`, ["#/clientes", "Clientes"]) +
      `<div class="grid-kpi"><div class="card kpi"><span>Pedidos</span><b>${os.length}</b></div><div class="card kpi"><span>Total gasto</span><b>${brl(ltv)}</b></div><div class="card kpi"><span>Ticket médio</span><b>${brl(ok.length ? ltv / ok.length : 0)}</b></div></div>
      <div class="grid-form"><section class="card"><div class="card-head"><h2>Pedidos</h2></div><div class="table-box"><table><tbody>
        ${os.map((o) => `<tr class="row-link" data-go="#/pedidos/${o.id}"><td><b>#${o.id}</b></td><td class="muted">${dt(o.at)}</td><td>${ost(o.status)}</td><td class="r num"><b>${brl(o.total)}</b></td></tr>`).join("") || `<tr><td class="empty">Sem pedidos.</td></tr>`}
      </tbody></table></div></section>
      <form class="card card-pad form" data-form="customer" data-id="${c.id}"><h2>Dados</h2>
        <div class="field"><label for="cname">Nome</label><input id="cname" name="name" class="input" value="${e(c.name)}"></div>
        <div class="field"><label for="cemail">E-mail</label><input id="cemail" name="email" type="email" class="input" value="${e(c.email)}"></div>
        <div class="field"><label for="cphone">Telefone</label><input id="cphone" name="phone" class="input" value="${e(c.phone)}"></div>
        <div class="field"><label for="caddr">Endereço</label><input id="caddr" name="address" class="input" value="${e(c.address)}"></div>
        <div class="field"><label for="ctags">Marcadores</label><input id="ctags" name="tags" class="input" value="${e(c.tags.join(", "))}" placeholder="VIP, Frotista"><small>Separe por vírgula.</small></div>
        <div class="field"><label for="cnotes">Observações internas</label><textarea id="cnotes" name="notes" class="input" rows="3">${e(c.notes)}</textarea></div>
        ${sw('name="newsletter"', c.newsletter, "Aceita receber e-mails")}
        <div><button class="btn btn--dark" type="submit">Salvar cliente</button></div>
      </form></div>`;
  }

  // Avaliações
  V.avaliacoes = (id, q) => {
    const f = q.get("s") || "pendente";
    const list = S.reviews.filter((r) => f === "todas" || r.status === f);
    const avg = S.reviews.filter((r) => r.status === "aprovada");
    return head("Avaliações", `Nota média publicada: <span class="stars">${stars(Math.round(avg.reduce((s, r) => s + r.rating, 0) / (avg.length || 1)))}</span> ${(avg.reduce((s, r) => s + r.rating, 0) / (avg.length || 1)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5`, "") +
      `<div class="chips">${[["pendente", "Pendentes"], ["aprovada", "Aprovadas"], ["rejeitada", "Rejeitadas"], ["todas", "Todas"]].map(([v, l]) => `<a class="chip${f === v ? " on" : ""}" href="#/avaliacoes?s=${v}">${l}<span class="n">${v === "todas" ? S.reviews.length : S.reviews.filter((r) => r.status === v).length}</span></a>`).join("")}</div>
      <section class="card">${list.map((r) => `<article class="review">
        <div class="head"><div><span class="stars" aria-label="${r.rating} de 5 estrelas">${stars(r.rating)}</span> <b>${e(r.title)}</b></div>${st(r.status, r.status === "aprovada" ? "ok" : r.status === "pendente" ? "warn" : "bad")}</div>
        <p style="margin:0">${e(r.text)}</p>
        <small class="soft">${e(r.client)} sobre <a href="#/produtos/${r.pid}">${e(r.product)}</a> · ${dfull(r.at)}</small>
        ${r.reply ? `<div class="review-reply"><b>Resposta da loja:</b> ${e(r.reply)}</div>` : ""}
        <div class="chips" style="margin-top:6px">
          ${r.status !== "aprovada" ? `<button class="btn btn--sm btn--accent" type="button" data-act="review" data-id="${r.id}" data-v="aprovada">Aprovar</button>` : ""}
          ${r.status !== "rejeitada" ? `<button class="btn btn--sm" type="button" data-act="review" data-id="${r.id}" data-v="rejeitada">Rejeitar</button>` : ""}
          <button class="btn btn--sm" type="button" data-act="reply-review" data-id="${r.id}">${r.reply ? "Editar resposta" : "Responder"}</button>
        </div></article>`).join("") || `<p class="empty">Nada por aqui.</p>`}</section>`;
  };

  // Cupons
  V.cupons = () => {
    const kind = (c) => c.type === "percent" ? c.value + "% off" : c.type === "fixed" ? brl(c.value) + " off" : "Frete grátis";
    const state = (c) => !c.active ? st("Inativo", "neutral") : c.ends && c.ends < S.today.slice(0, 10) ? st("Expirado", "neutral") : c.starts > S.today.slice(0, 10) ? st("Agendado", "info") : st("Ativo", "ok");
    return head("Cupons e promoções", "Crie códigos de desconto, frete grátis e campanhas com data marcada.", `<button class="btn btn--accent" type="button" data-act="edit-coupon">+ Novo cupom</button>`) +
      `<section class="card"><div class="table-box"><table><thead><tr><th>Código</th><th>Desconto</th><th>Pedido mínimo</th><th>Uso</th><th>Validade</th><th>Status</th><th></th></tr></thead><tbody>
      ${S.coupons.map((c) => `<tr><td><b style="font-family:var(--display);letter-spacing:.04em">${e(c.code)}</b><br><small class="soft">${e(c.desc)}</small></td><td>${kind(c)}</td><td>${c.min ? brl(c.min) : "Sem mínimo"}</td><td class="num">${c.uses}${c.limit ? " / " + c.limit : ""}</td><td class="muted">${c.starts ? new Date(c.starts + "T12:00").toLocaleDateString("pt-BR") : ""}${c.ends ? " até " + new Date(c.ends + "T12:00").toLocaleDateString("pt-BR") : " sem fim"}</td><td>${state(c)}</td><td class="r" style="white-space:nowrap">${sw(`data-change="coupon-active" data-id="${c.id}" aria-label="Ativo"`, c.active)} <button class="btn btn--sm" type="button" data-act="edit-coupon" data-id="${c.id}">Editar</button></td></tr>`).join("")}
      </tbody></table></div></section>`;
  };

  // Relatórios
  V.relatorios = (id, q) => {
    const r = +(q.get("d") || 90);
    const ok = S.orders.filter((o) => valid(o) && daysAgo(o.at) < r);
    const rev = ok.reduce((s, o) => s + o.total, 0);
    const cost = ok.reduce((s, o) => s + o.items.reduce((a, it) => a + it.qty * (prod(it.pid) ? prod(it.pid).cost : 0), 0), 0);
    const group = (fn) => { const m = {}; ok.forEach((o) => { const k = fn(o); m[k] = (m[k] || 0) + o.total; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const byCat = {}; ok.forEach((o) => o.items.forEach((it) => { const p = prod(it.pid); const k = p && cat(p.cat) ? cat(p.cat).name : "Outros"; byCat[k] = (byCat[k] || 0) + it.qty * it.price; }));
    const bars = (rows) => { const max = Math.max(...rows.map((x) => x[1]), 1); return rows.map(([k, v]) => `<div class="hbar"><span>${e(k)}</span><b class="r num">${brl0(v)}</b><div class="track"><i style="width:${(v / max) * 100}%"></i></div></div>`).join(""); };
    const byState = {}; ok.forEach((o) => { const c = cust(o.cid); const k = c ? c.uf : "-"; byState[k] = (byState[k] || 0) + o.total; });
    return head("Relatórios", "Vendas, margem e origem dos pedidos.", `<div class="chips">${[[30, "30 dias"], [90, "90 dias"], [120, "120 dias"]].map(([v, l]) => `<a class="chip${r === v ? " on" : ""}" href="#/relatorios?d=${v}">${l}</a>`).join("")}</div><button class="btn" type="button" data-act="csv-report" data-v="${r}">Exportar CSV</button>`) +
      `<div class="grid-kpi"><div class="card kpi"><span>Receita</span><b>${brl0(rev)}</b></div><div class="card kpi"><span>Custo dos produtos</span><b>${brl0(cost)}</b></div><div class="card kpi"><span>Margem bruta</span><b>${rev ? Math.round(((rev - cost) / rev) * 100) : 0}%</b></div><div class="card kpi"><span>Pedidos pagos</span><b>${ok.length}</b></div></div>
      <div class="grid-2">
        <section class="card card-pad stack"><h2>Por canal</h2>${bars(group((o) => o.channel))}</section>
        <section class="card card-pad stack"><h2>Por categoria</h2>${bars(Object.entries(byCat).sort((a, b) => b[1] - a[1]))}</section>
        <section class="card card-pad stack"><h2>Por forma de pagamento</h2>${bars(group((o) => o.payment))}</section>
        <section class="card card-pad stack"><h2>Por estado (UF)</h2>${bars(Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 8))}</section>
      </div>
      <section class="card"><div class="card-head"><h2>Produtos</h2></div><div class="table-box"><table><thead><tr><th>Produto</th><th class="r">Unidades</th><th class="r">Receita</th><th class="r">Margem</th></tr></thead><tbody>
      ${topProducts(r).map((t) => `<tr><td><span class="cell-prod"><img class="thumb" src="${t.p.img}" alt=""><b>${e(t.p.title)}</b></span></td><td class="r num">${t.qty}</td><td class="r num"><b>${brl(t.rev)}</b></td><td class="r num">${Math.round(((t.p.price - t.p.cost) / t.p.price) * 100)}%</td></tr>`).join("")}
      </tbody></table></div></section>`;
  };

  // Home e banners
  V.home = () => {
    const h = S.home;
    return head("Home e banners", "Edite o que aparece na página inicial da loja. A prévia ao lado mostra a ordem das seções.", `<button class="btn btn--accent" type="submit" form="hform">Publicar alterações</button>`) +
      `<div class="grid-form">
        <form id="hform" class="stack" data-form="home">
          <section class="card card-pad form"><div class="head"><h2>Barra de aviso</h2>${sw('name="topOn"', h.topbar.on, "Mostrar")}</div>
            <div class="field"><label for="topText">Texto</label><input id="topText" name="topText" class="input" value="${e(h.topbar.text)}" data-live="topbar"></div></section>
          <section class="card card-pad form"><h2>Destaque principal (hero)</h2>
            <div class="field"><label for="hk">Chamada pequena</label><input id="hk" name="kicker" class="input" value="${e(h.hero.kicker)}" data-live="kicker"></div>
            <div class="field"><label for="ht">Título</label><input id="ht" name="title" class="input" value="${e(h.hero.title)}" data-live="title"></div>
            <div class="field"><label for="hx">Texto</label><textarea id="hx" name="text" class="input" rows="3" data-live="text">${e(h.hero.text)}</textarea></div>
            <div class="row"><div class="field"><label for="hc">Texto do botão</label><input id="hc" name="cta" class="input" value="${e(h.hero.cta)}" data-live="cta"></div><div class="field"><label for="hl">Link do botão</label><input id="hl" name="ctaLink" class="input" value="${e(h.hero.ctaLink)}"></div></div>
            <div class="field"><label for="hi">Imagem do produto em destaque</label><select id="hi" name="img" class="input" data-preview="#mini-img">${S.products.map((p) => `<option value="${p.img}"${h.hero.img === p.img ? " selected" : ""}>${e(p.title)}</option>`).join("")}</select></div>
          </section>
          <section class="card"><div class="card-head"><h2>Seções da home</h2><span class="soft">Ligue, desligue e reordene</span></div>
            ${h.sections.map((s, i) => `<div class="sec-row"><span class="handle">${i + 1}</span><span class="grow">${e(s.name)}</span>${sw(`data-change="section-on" data-i="${i}" aria-label="Mostrar ${e(s.name)}"`, s.on)}<button class="btn btn--icon" type="button" data-act="sec-move" data-i="${i}" data-v="-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>${ico("up")}</button><button class="btn btn--icon" type="button" data-act="sec-move" data-i="${i}" data-v="1" aria-label="Descer"${i === h.sections.length - 1 ? " disabled" : ""}>${ico("down")}</button></div>`).join("")}
          </section>
          <section class="card"><div class="card-head"><h2>Banners rotativos</h2><button class="btn btn--sm" type="button" data-act="edit-banner">+ Banner</button></div>
            ${h.banners.map((b) => `<div class="sec-row"><img class="thumb" src="${b.img}" alt=""><span class="grow">${e(b.title)}<br><small class="soft">${e(b.link)}${b.ends ? " · até " + new Date(b.ends + "T12:00").toLocaleDateString("pt-BR") : ""}</small></span>${sw(`data-change="banner-on" data-id="${b.id}" aria-label="Ativo"`, b.on)}<button class="btn btn--sm" type="button" data-act="edit-banner" data-id="${b.id}">Editar</button></div>`).join("")}
          </section>
          <section class="card"><div class="card-head"><h2>Produtos em destaque</h2><span class="soft">Aparecem em Ofertas da semana</span></div>
            ${S.products.map((p) => `<div class="sec-row"><img class="thumb" src="${p.img}" alt=""><span class="grow">${e(p.title)}</span>${sw(`data-change="featured" data-id="${p.id}" aria-label="Destaque"`, p.featured)}</div>`).join("")}
          </section>
        </form>
        <aside class="stack" style="position:sticky;top:84px">
          <span class="label">Prévia</span>
          <div class="mini-site">
            ${h.topbar.on ? `<div class="mini-top" id="mini-topbar">${e(h.topbar.text)}</div>` : ""}
            <div class="mini-hero"><div><small id="mini-kicker">${e(h.hero.kicker)}</small><h3 id="mini-title">${e(h.hero.title)}</h3><p id="mini-text">${e(h.hero.text)}</p><span class="btn btn--accent btn--sm" id="mini-cta">${e(h.hero.cta)}</span></div><img id="mini-img" src="${h.hero.img}" alt=""></div>
            <div class="mini-secs">${h.sections.filter((s) => s.on).map((s) => `<span>${e(s.name)}</span>`).join("")}</div>
          </div>
        </aside>
      </div>`;
  };

  // Páginas
  V.paginas = (id) => {
    if (id) return pageEditor(id === "nova" ? null : S.pages.find((p) => p.id === +id), id);
    return head("Páginas", "Páginas institucionais da loja: sobre, políticas, ajuda.", `<a class="btn btn--accent" href="#/paginas/nova">+ Nova página</a>`) +
      `<section class="card"><div class="table-box"><table><thead><tr><th>Título</th><th>Endereço</th><th>Status</th><th>Atualizada</th></tr></thead><tbody>
      ${S.pages.map((p) => `<tr class="row-link" data-go="#/paginas/${p.id}"><td><b>${e(p.title)}</b></td><td class="muted">/pagina/${e(p.slug)}</td><td>${st(p.status, p.status === "publicada" ? "ok" : "warn")}</td><td class="muted">${dt(p.updated)}</td></tr>`).join("")}
      </tbody></table></div></section>`;
  };

  function pageEditor(p, id) {
    if (id !== "nova" && !p) return notFound();
    const isNew = !p;
    p = p || { id: 0, title: "", slug: "", status: "rascunho", seo: "", body: "<p></p>" };
    return head(isNew ? "Nova página" : p.title, isNew ? "" : `Última alteração em ${dt(p.updated)}`,
      `${!isNew ? `<button class="btn btn--danger" type="button" data-act="del-page" data-id="${p.id}">${ico("trash")}Excluir</button>` : ""}<button class="btn" type="submit" form="pgform" name="as" value="rascunho">Salvar rascunho</button><button class="btn btn--accent" type="submit" form="pgform" name="as" value="publicada">Publicar</button>`, ["#/paginas", "Páginas"]) +
      `<form id="pgform" class="grid-form" data-form="page" data-id="${p.id}">
        <div class="stack"><section class="card card-pad form">
          <div class="field"><label for="pgtitle">Título</label><input id="pgtitle" name="title" class="input" value="${e(p.title)}" required data-slug="#pgslug"></div>
          <div class="field"><span class="label" id="lbl-body">Conteúdo</span>
            <div class="rte"><div class="rte-bar" role="toolbar" aria-label="Formatação">
              <button type="button" data-cmd="formatBlock" data-v="h2" title="Título">T1</button><button type="button" data-cmd="formatBlock" data-v="h3" title="Subtítulo">T2</button><button type="button" data-cmd="formatBlock" data-v="p" title="Parágrafo">¶</button>
              <button type="button" data-cmd="bold" title="Negrito"><b>N</b></button><button type="button" data-cmd="italic" title="Itálico"><i>I</i></button>
              <button type="button" data-cmd="insertUnorderedList" title="Lista">• Lista</button><button type="button" data-cmd="insertOrderedList" title="Lista numerada">1. Lista</button><button type="button" data-cmd="createLink" title="Link">Link</button>
            </div><div class="rte-body" id="pgbody" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="lbl-body">${p.body}</div></div></div>
        </section></div>
        <div class="stack"><section class="card card-pad form"><h2>Publicação</h2><div>${st(p.status, p.status === "publicada" ? "ok" : "warn")}</div>
          <div class="field"><label for="pgslug">Endereço</label><div class="prefix"><span>/pagina/</span><input id="pgslug" name="slug" class="input" value="${e(p.slug)}"></div></div>
          <div class="field"><label for="pgseo">Descrição para o Google</label><textarea id="pgseo" name="seo" class="input" rows="3" maxlength="160">${e(p.seo)}</textarea></div>
        </section></div>
      </form>`;
  }

  // Menu e rodapé
  V.menu = () => {
    const list = (key, title) => `<section class="card"><div class="card-head"><h2>${title}</h2><button class="btn btn--sm" type="button" data-act="menu-add" data-k="${key}">+ Link</button></div>
      ${S.menu[key].map((m, i) => `<div class="sec-row"><span class="handle">${i + 1}</span><label class="sr" for="${key}l${i}">Texto</label><input id="${key}l${i}" class="input" style="flex:1" value="${e(m.label)}" data-change="menu-edit" data-k="${key}" data-i="${i}" data-f="label"><label class="sr" for="${key}u${i}">Link</label><input id="${key}u${i}" class="input" style="flex:1" value="${e(m.link)}" data-change="menu-edit" data-k="${key}" data-i="${i}" data-f="link"><button class="btn btn--icon" type="button" data-act="menu-move" data-k="${key}" data-i="${i}" data-v="-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>${ico("up")}</button><button class="btn btn--icon" type="button" data-act="menu-move" data-k="${key}" data-i="${i}" data-v="1" aria-label="Descer"${i === S.menu[key].length - 1 ? " disabled" : ""}>${ico("down")}</button><button class="btn btn--icon btn--danger" type="button" data-act="menu-del" data-k="${key}" data-i="${i}" aria-label="Remover">${ico("trash")}</button></div>`).join("")}</section>`;
    return head("Menu e rodapé", "Links do topo da loja, do rodapé e redes sociais. Alterações salvam ao sair do campo.", "") +
      `<div class="grid-2">${list("header", "Menu principal")}${list("footer", "Rodapé")}</div>
      <form class="card card-pad form" data-form="social"><h2>Redes sociais e contato</h2><div class="row">
        <div class="field"><label for="ig">Instagram</label><input id="ig" name="instagram" class="input" value="${e(S.menu.social.instagram)}"></div>
        <div class="field"><label for="wa">WhatsApp</label><input id="wa" name="whatsapp" class="input" value="${e(S.menu.social.whatsapp)}"></div>
        <div class="field"><label for="yt">YouTube</label><input id="yt" name="youtube" class="input" value="${e(S.menu.social.youtube)}" placeholder="Canal (opcional)"></div>
      </div><div><button class="btn btn--dark" type="submit">Salvar</button></div></form>`;
  };

  // Aparência
  V.aparencia = () => head("Aparência", "Cores e identidade da loja e do painel.", "") +
    `<form class="grid-2" data-form="look">
      <section class="card card-pad form"><h2>Cor de destaque</h2>
        <div class="chips">${["#8be41c", "#22c3a6", "#3b82f6", "#f59e0b"].map((c) => `<label class="chip${S.store.accent === c ? " on" : ""}"><input type="radio" name="accent" value="${c}" class="sr"${S.store.accent === c ? " checked" : ""}><span style="width:16px;height:16px;border-radius:50%;background:${c};display:inline-block"></span>${c}</label>`).join("")}</div>
        <p class="hint">O verde #8be41c é o da marca OrbitX. As outras opções servem para campanhas.</p>
        <div class="field"><label for="tdef">Tema padrão</label><select id="tdef" name="themeDefault" class="input"><option value="claro"${S.store.themeDefault === "claro" ? " selected" : ""}>Claro</option><option value="escuro"${S.store.themeDefault === "escuro" ? " selected" : ""}>Escuro</option></select><small>O visitante pode trocar pelo botão Claro/Escuro.</small></div>
        <div><button class="btn btn--dark" type="submit">Salvar aparência</button></div>
      </section>
      <section class="card card-pad stack"><h2>Logotipo</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div style="background:#f9f5ee;border-radius:12px;padding:20px;border:1px solid var(--line)"><img src="img/logo-claro.svg" alt="Logo para fundo claro"></div><div style="background:#0f1110;border-radius:12px;padding:20px"><img src="img/logo-escuro.svg" alt="Logo para fundo escuro"></div></div>
        <p class="hint">Versões vetoriais (SVG) para fundo claro e escuro. Na versão real, aqui entra o envio de um novo arquivo e do favicon.</p>
        <div class="field"><span class="label">Modo manutenção</span>${sw('data-change="maintenance"', S.store.maintenance, "Mostrar página de manutenção aos visitantes")}</div>
      </section>
    </form>`;

  // Frete
  V.frete = () => head("Frete", "Formas de envio e regra de frete grátis.", `<button class="btn btn--accent" type="button" data-act="edit-ship">+ Forma de envio</button>`) +
    `<form class="card card-pad form" data-form="freeship"><h2>Frete grátis</h2><div class="row" style="align-items:end"><div class="field"><label for="fsmin">Pedidos a partir de</label><div class="prefix"><span>R$</span><input id="fsmin" name="min" class="input" type="number" step="1" min="0" value="${S.freeShippingMin}"></div><small>Use 0 para desativar.</small></div><div><button class="btn btn--dark" type="submit">Salvar</button></div></div></form>
    <section class="card"><div class="table-box"><table><thead><tr><th>Forma de envio</th><th>Região</th><th>Preço</th><th>Prazo</th><th>Ativa</th><th></th></tr></thead><tbody>
    ${S.shipping.map((s) => `<tr><td><b>${e(s.name)}</b></td><td>${e(s.region)}</td><td>${e(s.price)}</td><td class="muted">${e(s.days)}</td><td>${sw(`data-change="ship-on" data-id="${s.id}" aria-label="Ativa"`, s.on)}</td><td class="r"><button class="btn btn--sm" type="button" data-act="edit-ship" data-id="${s.id}">Editar</button></td></tr>`).join("")}
    </tbody></table></div></section>`;

  // Pagamentos
  V.pagamentos = () => head("Pagamentos", "Formas de pagamento aceitas no checkout.", "") +
    `<section class="card"><div class="list-plain">${S.paymentMethods.map((m) => `<div><span class="avatar">${ico("card")}</span><span class="grow"><b>${e(m.name)}</b><br><small class="soft">${e(m.detail)}</small></span>${sw(`data-change="pay-on" data-id="${m.id}" aria-label="Ativa"`, m.on)}</div>`).join("")}</div></section>
    <section class="card card-pad"><h2>Parcelamento</h2><p class="muted" style="margin:6px 0 0">Até 3x sem juros no cartão. Parcela mínima de R$ 20,00. Na versão real, aqui entram as chaves do gateway (Mercado Pago, Pagar.me, Stripe) em modo protegido.</p></section>`;

  // Loja e equipe
  V.config = (id, q) => {
    const tab = q.get("tab") || "loja";
    const tabs = [["loja", "Dados da loja"], ["equipe", "Equipe e permissões"], ["emails", "E-mails automáticos"], ["atividade", "Registro de atividade"]];
    let body = "";
    if (tab === "loja") body = `<form class="card card-pad form" data-form="store"><div class="row">
      ${[["name", "Nome da loja"], ["legal", "Razão social"], ["cnpj", "CNPJ"], ["email", "E-mail de contato"], ["phone", "Telefone"], ["city", "Cidade"]].map(([k, l]) => `<div class="field"><label for="s-${k}">${l}</label><input id="s-${k}" name="${k}" class="input" value="${e(S.store[k])}"></div>`).join("")}
      </div><div class="field"><label for="s-ml">Loja no Mercado Livre</label><input id="s-ml" name="mlStore" class="input" type="url" value="${e(S.store.mlStore)}"></div><div><button class="btn btn--dark" type="submit">Salvar</button></div></form>`;
    if (tab === "equipe") body = `<section class="card"><div class="card-head"><h2>Usuários</h2><button class="btn btn--sm btn--accent" type="button" data-act="invite">+ Convidar</button></div><div class="table-box"><table><thead><tr><th>Nome</th><th>Função</th><th>Último acesso</th><th>Ativo</th></tr></thead><tbody>
      ${S.team.map((u) => `<tr><td><span class="me"><span class="avatar">${initials(u.name)}</span><span><b>${e(u.name)}</b><br><small class="soft">${e(u.email)}</small></span></span></td><td><label class="sr" for="role${u.id}">Função</label><select id="role${u.id}" class="input" style="width:auto" data-change="role" data-id="${u.id}">${Object.keys(S.roles).map((r) => `<option${u.role === r ? " selected" : ""}>${r}</option>`).join("")}</select></td><td class="muted">${u.last ? dt(u.last) : "Convite pendente"}</td><td>${sw(`data-change="user-on" data-id="${u.id}" aria-label="Ativo"`, u.on)}</td></tr>`).join("")}
      </tbody></table></div></section>
      <section class="card"><div class="card-head"><h2>Permissões por função</h2></div><div class="table-box"><table><thead><tr><th>Função</th>${["Pedidos", "Produtos", "Clientes", "Marketing", "Site", "Relatórios", "Configurações"].map((a) => `<th>${a}</th>`).join("")}</tr></thead><tbody>
      ${Object.entries(S.roles).map(([r, perms]) => `<tr><td><b>${e(r)}</b></td>${["Pedidos", "Produtos", "Clientes", "Marketing", "Site", "Relatórios", "Configurações"].map((a) => `<td><input class="check" type="checkbox" data-change="perm" data-r="${e(r)}" data-a="${a}" aria-label="${e(r)}: ${a}"${perms.includes(a) ? " checked" : ""}${r === "Administradora" ? " disabled" : ""}></td>`).join("")}</tr>`).join("")}
      </tbody></table></div></section>`;
    if (tab === "emails") body = `<section class="card"><div class="list-plain">${S.store.emails.map((m) => `<div><span class="grow"><b>${e(m.name)}</b></span>${sw(`data-change="email-on" data-id="${m.id}" aria-label="Ativo"`, m.on)}<button class="btn btn--sm" type="button" data-act="email-preview" data-id="${m.id}">Ver modelo</button></div>`).join("")}</div></section>`;
    if (tab === "atividade") body = `<section class="card"><ul class="timeline" style="padding-top:18px">${S.activity.map((a) => `<li><div><b>${e(a.who)}</b> ${e(a.text.charAt(0).toLowerCase() + a.text.slice(1))}<small>${dt(a.at)}</small></div></li>`).join("")}</ul></section>`;
    return head("Loja e equipe", "", "") + `<div class="chips">${tabs.map(([v, l]) => `<a class="chip${tab === v ? " on" : ""}" href="#/config?tab=${v}">${l}</a>`).join("")}</div>` + body;
  };


  // Galeria
  const kb = (n) => n > 1024 * 1024 ? (n / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
  V.galeria = (id, q) => {
    const f = q.get("p") || "Todas";
    const folders = ["Todas", ...new Set(S.gallery.map((g) => g.folder))];
    const list = S.gallery.filter((g) => f === "Todas" || g.folder === f);
    const total = S.gallery.reduce((s, g) => s + g.size, 0);
    return head("Galeria", `${S.gallery.length} arquivos · ${kb(total)} usados de 1 GB`, `<label class="btn btn--accent" for="up">${ico("upload")}Enviar imagens</label><input id="up" class="sr" type="file" accept="image/*" multiple data-change="upload">`) +
      `<div class="chips">${folders.map((x) => `<a class="chip${f === x ? " on" : ""}" href="#/galeria?p=${encodeURIComponent(x)}">${e(x)}<span class="n">${x === "Todas" ? S.gallery.length : S.gallery.filter((g) => g.folder === x).length}</span></a>`).join("")}</div>
      <div class="gallery">${list.map((g) => `<button type="button" class="card media" data-act="media" data-id="${g.id}"><span class="media-img"><img src="${e(g.src)}" alt="${e(g.alt)}" loading="lazy"></span><span class="media-cap"><b>${e(g.name)}</b><small class="soft">${kb(g.size)} · ${e(g.folder)}</small></span></button>`).join("") || `<p class="empty">Nenhuma imagem nesta pasta.</p>`}</div>`;
  };

  // Afiliados
  V.afiliados = (id, q) => {
    const f = q.get("s") || "todos";
    const comm = (a) => {
      const avg = 98;
      return a.sales * avg * (a.rate / 100);
    };
    const list = S.affiliates.filter((a) => f === "todos" || a.status === f);
    const act = S.affiliates.filter((a) => a.status === "ativo");
    const due = act.reduce((s, a) => s + Math.max(0, comm(a) - a.paid), 0);
    return head("Afiliados", "Parceiros que divulgam a loja com link ou cupom próprio e ganham comissão por venda.", `<button class="btn" type="button" data-act="pay-affiliates">Pagar comissões</button><button class="btn btn--accent" type="button" data-act="edit-affiliate">+ Novo afiliado</button>`) +
      `<div class="grid-kpi">
        <div class="card kpi"><span>Afiliados ativos</span><b>${act.length}</b></div>
        <div class="card kpi"><span>Cliques no mês</span><b>${act.reduce((s, a) => s + a.clicks, 0).toLocaleString("pt-BR")}</b></div>
        <div class="card kpi"><span>Vendas por afiliados</span><b>${act.reduce((s, a) => s + a.sales, 0)}</b></div>
        <div class="card kpi"><span>Comissão a pagar</span><b>${brl(due)}</b></div>
      </div>
      <div class="chips">${[["todos", "Todos"], ["ativo", "Ativos"], ["pendente", "Aguardando aprovação"], ["suspenso", "Suspensos"]].map(([v, l]) => `<a class="chip${f === v ? " on" : ""}" href="#/afiliados?s=${v}">${l}<span class="n">${v === "todos" ? S.affiliates.length : S.affiliates.filter((a) => a.status === v).length}</span></a>`).join("")}</div>
      <section class="card"><div class="table-box"><table><thead><tr><th>Afiliado</th><th>Cupom / link</th><th class="r">Comissão</th><th class="r">Cliques</th><th class="r">Vendas</th><th class="r">Conversão</th><th class="r">A pagar</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map((a) => `<tr><td><span class="me"><span class="avatar">${initials(a.name)}</span><span><b>${e(a.name)}</b><br><small class="soft">${e(a.type)} · ${e(a.email)}</small></span></span></td>
        <td><span style="display:inline-flex;align-items:center;gap:6px"><b style="font-family:var(--display);letter-spacing:.04em">${e(a.code)}</b><button class="btn btn--icon btn--sm" type="button" data-act="copy-link" data-v="https://orbitax.duckdns.org/?ref=${e(a.code.toLowerCase())}" aria-label="Copiar link de ${e(a.name)}" title="Copiar link">${ico("copy")}</button></span></td>
        <td class="r num">${a.rate}%</td><td class="r num">${a.clicks.toLocaleString("pt-BR")}</td><td class="r num">${a.sales}</td><td class="r num">${a.clicks ? ((a.sales / a.clicks) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : 0}%</td>
        <td class="r num"><b>${brl(Math.max(0, comm(a) - a.paid))}</b></td>
        <td>${st({ ativo: "Ativo", pendente: "Pendente", suspenso: "Suspenso" }[a.status], a.status === "ativo" ? "ok" : a.status === "pendente" ? "warn" : "bad")}</td>
        <td class="r" style="white-space:nowrap">${a.status === "pendente" ? `<button class="btn btn--sm btn--accent" type="button" data-act="aff-status" data-id="${a.id}" data-v="ativo">Aprovar</button> ` : ""}${a.status === "ativo" ? `<button class="btn btn--sm" type="button" data-act="aff-status" data-id="${a.id}" data-v="suspenso">Suspender</button> ` : ""}${a.status === "suspenso" ? `<button class="btn btn--sm" type="button" data-act="aff-status" data-id="${a.id}" data-v="ativo">Reativar</button> ` : ""}<button class="btn btn--sm" type="button" data-act="edit-affiliate" data-id="${a.id}">Editar</button></td></tr>`).join("") || `<tr><td colspan="9" class="empty">Nenhum afiliado aqui.</td></tr>`}
      </tbody></table></div></section>
      <section class="card card-pad"><h2>Regras do programa</h2><p class="muted" style="margin:6px 0 0">Comissão paga sobre pedidos entregues, 30 dias após a entrega. Cupons de afiliado não acumulam com outros cupons. O cálculo usa ticket médio de R$ 98,00 nesta demonstração.</p></section>`;
  };

  // Banidos
  V.banidos = () => head("Banidos", "Bloqueie e-mails, CPFs, telefones e IPs ligados a fraude ou abuso. Quem está aqui não consegue finalizar compra no site.", `<button class="btn btn--accent" type="button" data-act="edit-ban">+ Bloquear</button>`) +
    `<div class="grid-kpi">${["E-mail", "CPF", "Telefone", "IP"].map((k) => `<div class="card kpi"><span>${k}</span><b>${S.banned.filter((b) => b.kind === k).length}</b></div>`).join("")}</div>
    <section class="card"><div class="table-box"><table><thead><tr><th>Tipo</th><th>Valor bloqueado</th><th>Motivo</th><th>Quando</th><th>Por</th><th></th></tr></thead><tbody>
    ${S.banned.map((b) => `<tr><td>${st(b.kind, "bad")}</td><td><b>${e(b.value)}</b></td><td>${e(b.reason)}</td><td class="muted">${dt(b.at)}</td><td class="muted">${e(b.who)}</td><td class="r"><button class="btn btn--sm" type="button" data-act="unban" data-id="${b.id}">Desbloquear</button></td></tr>`).join("") || `<tr><td colspan="6" class="empty">Ninguém bloqueado.</td></tr>`}
    </tbody></table></div></section>
    <section class="card card-pad"><h2>Proteção automática</h2><div class="stack" style="margin-top:12px">
      ${sw('data-change="antifraud" data-k="cards"', S.store.antifraudCards !== false, "Bloquear IP após 10 pagamentos recusados em 1 hora")}
      ${sw('data-change="antifraud" data-k="temp"', S.store.antifraudTemp !== false, "Recusar e-mails descartáveis")}
      ${sw('data-change="antifraud" data-k="coupon"', !!S.store.antifraudCoupon, "Limitar cupom de primeira compra a um por CPF")}
    </div></section>`;

  // Plugins
  V.plugins = (id, q) => {
    const f = q.get("c") || "Todos";
    const cats = ["Todos", ...new Set(S.plugins.map((p) => p.cat))];
    const list = S.plugins.filter((p) => f === "Todos" || p.cat === f);
    return head("Plugins", `${S.plugins.filter((p) => p.on).length} de ${S.plugins.length} instalados. Recursos extras que você liga e desliga sem mexer no código.`, "") +
      `<div class="chips">${cats.map((c) => `<a class="chip${f === c ? " on" : ""}" href="#/plugins?c=${encodeURIComponent(c)}">${e(c)}</a>`).join("")}</div>
      <div class="grid-cards">${list.map((p) => `<article class="card card-pad stack" style="gap:10px"><div class="head" style="align-items:center"><span class="avatar">${ico("puzzle")}</span>${p.on ? st("Instalado", "ok") : st(p.price, "neutral")}</div><div><h3>${e(p.name)}</h3><small class="soft">${e(p.by)} · ${e(p.cat)}</small></div><p class="muted" style="margin:0;flex:1">${e(p.desc)}</p><div class="head" style="align-items:center">${sw(`data-change="plugin-on" data-id="${p.id}" aria-label="Ativar ${e(p.name)}"`, p.on, p.on ? "Ativo" : "Desligado")}${p.on ? `<button class="btn btn--sm" type="button" data-act="plugin-config" data-id="${p.id}">Configurar</button>` : ""}</div></article>`).join("")}</div>`;
  };

  // Integrações
  V.integracoes = () => head("Integrações", "Conecte a loja a marketplaces, ferramentas de anúncio, logística e ERP.", "") +
    `<div class="grid-cards">${S.integrations.map((i) => `<article class="card card-pad stack" style="gap:10px"><div class="head" style="align-items:center"><h3>${e(i.name)}</h3>${i.on ? st("Conectado", "ok") : st("Desconectado", "neutral")}</div><p class="muted" style="margin:0;flex:1">${e(i.desc)}</p>${i.on ? `<small class="soft">${e(i.account)}${i.last ? " · sincronizado " + dt(i.last) : ""}</small>` : ""}<div class="chips">${i.on ? `<button class="btn btn--sm" type="button" data-act="sync" data-id="${i.id}">Sincronizar agora</button><button class="btn btn--sm btn--danger" type="button" data-act="integration" data-id="${i.id}">Desconectar</button>` : `<button class="btn btn--sm btn--accent" type="button" data-act="integration" data-id="${i.id}">Conectar</button>`}</div></article>`).join("")}</div>
    <section class="card"><div class="card-head"><h2>Chaves de API</h2><button class="btn btn--sm" type="button" data-act="new-key">+ Nova chave</button></div><div class="table-box"><table><thead><tr><th>Nome</th><th>Chave</th><th>Criada</th><th>Último uso</th><th></th></tr></thead><tbody>
    ${S.apiKeys.map((k) => `<tr><td><b>${e(k.name)}</b></td><td><code>${e(k.key)}</code></td><td class="muted">${new Date(k.created + "T12:00").toLocaleDateString("pt-BR")}</td><td class="muted">${k.last ? dt(k.last) : "Nunca"}</td><td class="r"><button class="btn btn--sm btn--danger" type="button" data-act="revoke-key" data-id="${k.id}">Revogar</button></td></tr>`).join("") || `<tr><td colspan="5" class="empty">Nenhuma chave.</td></tr>`}
    </tbody></table></div></section>
    <section class="card"><div class="card-head"><h2>Webhooks</h2><button class="btn btn--sm" type="button" data-act="new-hook">+ Webhook</button></div><div class="list-plain">${S.webhooks.map((w) => `<div><span class="grow"><b>${e(w.event)}</b><br><small class="soft">${e(w.url)}</small></span>${sw(`data-change="hook-on" data-id="${w.id}" aria-label="Ativo"`, w.on)}</div>`).join("")}</div></section>`;

  // Domínios
  V.dominios = () => head("Domínios", "Endereços que abrem a loja. O principal é o que aparece para o cliente; os outros redirecionam para ele.", `<button class="btn btn--accent" type="button" data-act="add-domain">+ Conectar domínio</button>`) +
    `<section class="card"><div class="table-box"><table><thead><tr><th>Domínio</th><th>DNS</th><th>Certificado SSL</th><th>Adicionado</th><th></th></tr></thead><tbody>
    ${S.domains.map((d) => `<tr><td><b>${e(d.host)}</b> ${d.primary ? st("Principal", "info") : ""}</td><td>${st(d.dns, d.dns === "Verificado" ? "ok" : "warn")}</td><td>${st(d.ssl, d.ssl === "Ativo" ? "ok" : "warn")}</td><td class="muted">${new Date(d.added + "T12:00").toLocaleDateString("pt-BR")}</td><td class="r" style="white-space:nowrap">${d.dns !== "Verificado" ? `<button class="btn btn--sm" type="button" data-act="verify-domain" data-id="${d.id}">Verificar</button> ` : ""}${!d.primary && d.dns === "Verificado" ? `<button class="btn btn--sm" type="button" data-act="primary-domain" data-id="${d.id}">Tornar principal</button> ` : ""}${!d.primary ? `<button class="btn btn--sm btn--danger" type="button" data-act="del-domain" data-id="${d.id}">Remover</button>` : ""}</td></tr>`).join("")}
    </tbody></table></div></section>
    <section class="card card-pad stack"><h2>Como apontar o domínio</h2><p class="muted" style="margin:0">No painel onde o domínio foi registrado (Registro.br, por exemplo), crie estes registros. A verificação costuma levar alguns minutos.</p>
      <div class="table-box"><table><thead><tr><th>Tipo</th><th>Nome</th><th>Valor</th></tr></thead><tbody><tr><td>A</td><td>@</td><td><code>203.0.113.10</code> (exemplo)</td></tr><tr><td>CNAME</td><td>www</td><td><code>orbitax.duckdns.org</code></td></tr></tbody></table></div></section>`;

  // Templates
  V.templates = () => head("Templates", `Escolha o visual da loja. ${st("Beta", "warn")} Os templates novos ainda estão em teste.`, "") +
    `<div class="grid-cards">${S.templates.map((t) => `<article class="card" style="overflow:hidden;display:flex;flex-direction:column">
      <div class="tpl" style="background:${t.colors[1]};color:${t.colors[2]}"><span class="tpl-bar" style="background:${t.colors[0]}"></span><span class="tpl-h" style="background:${t.colors[2]}"></span><span class="tpl-p" style="background:${t.colors[2]}"></span><span class="tpl-grid">${"<i></i>".repeat(4)}</span><span class="tpl-btn" style="background:${t.colors[0]}"></span></div>
      <div class="card-pad stack" style="gap:8px;flex:1"><div class="head" style="align-items:center"><h3>${e(t.name)}</h3>${t.active ? st("Em uso", "ok") : ""}</div><p class="muted" style="margin:0;flex:1">${e(t.desc)}</p>
      <div class="chips">${t.active ? `<button class="btn btn--sm" type="button" data-act="customize-tpl">Personalizar</button>` : `<button class="btn btn--sm btn--accent" type="button" data-act="apply-tpl" data-id="${t.id}">Aplicar</button><button class="btn btn--sm" type="button" data-act="preview-tpl" data-id="${t.id}">Pré-visualizar</button>`}</div></div></article>`).join("")}</div>`;

  const notFound = () => head("Não encontrado", "Esse item não existe ou foi excluído.", `<a class="btn" href="#/painel">Voltar ao painel</a>`);

  function login() {
    return `<div class="login"><div class="login-art"><img src="img/logo-escuro.svg" alt="OrbitX Technology" style="height:44px;width:auto"><div><h2>Toda a loja <span>em um painel só.</span></h2><p>Pedidos, estoque, produtos, páginas e campanhas da OrbitX. Esta é uma demonstração com dados fictícios.</p></div><small style="color:#8d948a">Painel OrbitX · demonstração</small></div>
      <div class="login-form"><form class="form" data-form="login"><h1>Entrar no painel</h1><p class="muted" style="margin:0">Use os dados já preenchidos. Qualquer senha funciona na demonstração.</p>
        <div class="field"><label for="le">E-mail</label><input id="le" class="input" type="email" value="marina@orbitx.com.br" required autocomplete="username"></div>
        <div class="field"><label for="lp">Senha</label><input id="lp" class="input" type="password" value="demonstracao" required autocomplete="current-password"></div>
        <button class="btn btn--accent" type="submit" style="min-height:46px">Entrar</button></form></div></div>`;
  }

  // ---------- roteador ----------
  const qs = (section, params) => "#/" + section + "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
  function route() {
    applyTheme();
    const app = $("#app");
    if (!S.logged) { app.innerHTML = login(); document.title = "Entrar · OrbitX Admin"; return; }
    const hash = location.hash.replace(/^#\/?/, "") || "painel";
    const [path, query] = hash.split("?");
    const [section, id] = path.split("/");
    const view = V[section] || V.painel;
    const sec = V[section] ? section : "painel";
    app.innerHTML = shell(sec, view(id, new URLSearchParams(query || "")));
    const h1 = $("h1", app);
    document.title = (h1 ? h1.textContent + " · " : "") + "OrbitX Admin";
    window.scrollTo(0, 0);
  }
  const rerender = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };

  // ---------- modal e aviso ----------
  let toastTimer;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }
  function modal(title, bodyHtml, onSubmit, submitLabel) {
    closeModal();
    const o = document.createElement("div");
    o.className = "overlay"; o.id = "overlay";
    o.innerHTML = `<form class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><header><h2 id="mt">${e(title)}</h2><button class="btn btn--icon" type="button" data-act="close" aria-label="Fechar">${ico("x")}</button></header><div class="body form">${bodyHtml}</div><footer><button class="btn" type="button" data-act="close">Cancelar</button>${onSubmit ? `<button class="btn btn--accent" type="submit">${submitLabel || "Salvar"}</button>` : ""}</footer></form>`;
    document.body.appendChild(o);
    const f = $("form", o);
    f.addEventListener("submit", (ev) => { ev.preventDefault(); if (onSubmit(new FormData(f), f) !== false) { closeModal(); save(); rerender(); } });
    o.addEventListener("click", (ev) => { if (ev.target === o) closeModal(); });
    const first = $("input, select, textarea, button[type=submit]", f); if (first) first.focus();
  }
  function closeModal() { const o = $("#overlay"); if (o) o.remove(); }
  const fld = (name, label, value, type, extra) => `<div class="field"><label for="m-${name}">${label}</label><input id="m-${name}" name="${name}" class="input" type="${type || "text"}" value="${e(value == null ? "" : value)}" ${extra || ""}></div>`;

  function download(name, rows) {
    const csv = rows.map((r) => r.map((v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"').join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    toast("Arquivo " + name + " gerado");
  }

  // ---------- ações ----------
  const selected = (kind) => [...document.querySelectorAll(`[data-sel="${kind}"]:checked`)].map((x) => +x.value);
  const setOrderStatus = (o, s) => { if (o.status === s) return; o.status = s; o.history.push({ at: nowIso(), text: "Status alterado para " + s + " por Marina Souza" }); };

  const ACT = {
    menu: () => $("#side").classList.toggle("open"),
    theme: (el) => { S.theme = el.dataset.v; save(); rerender(); },
    logout: () => { S.logged = false; save(); route(); },
    reset: () => { if (confirm("Restaurar todos os dados de demonstração? As alterações feitas neste navegador serão perdidas.")) { store.del(KEY); S = Object.assign({ version: 2, theme: S.theme, logged: true }, clone(window.ORBITX_SEED)); save(); route(); toast("Dados de demonstração restaurados"); } },
    range: (el) => { S.ui = { range: +el.dataset.v }; save(); rerender(); },
    close: closeModal,
    print: () => window.print(),
    "order-status": (el) => { const o = S.orders.find((x) => x.id === +el.dataset.id); setOrderStatus(o, el.dataset.v); log(`Marcou o pedido #${o.id} como ${el.dataset.v.toLowerCase()}`); save(); rerender(); toast("Pedido #" + o.id + ": " + el.dataset.v); },
    "bulk-order": (el) => { const ids = selected("orders"); ids.forEach((id) => setOrderStatus(S.orders.find((o) => o.id === id), el.dataset.v)); log(`Marcou ${ids.length} pedido(s) como ${el.dataset.v.toLowerCase()}`); save(); rerender(); toast(ids.length + " pedido(s) atualizados"); },
    "print-labels": () => toast("Etiquetas de " + selected("orders").length + " pedido(s) enviadas para impressão"),
    "csv-orders": () => download("pedidos-orbitx.csv", [["Pedido", "Data", "Cliente", "Canal", "Pagamento", "Status", "Total"], ...S.orders.map((o) => [o.id, dt(o.at), o.client, o.channel, o.payment, o.status, o.total.toFixed(2).replace(".", ",")])]),
    "csv-products": () => download("produtos-orbitx.csv", [["SKU", "Produto", "Categoria", "Preço", "Custo", "Estoque", "Status"], ...S.products.map((p) => [p.sku, p.title, p.cat, p.price.toFixed(2).replace(".", ","), p.cost.toFixed(2).replace(".", ","), p.stock, p.status])]),
    "csv-customers": () => download("clientes-orbitx.csv", [["Nome", "E-mail", "Telefone", "Cidade", "UF"], ...S.customers.map((c) => [c.name, c.email, c.phone, c.city, c.uf])]),
    "csv-report": (el) => download("relatorio-produtos-orbitx.csv", [["Produto", "Unidades", "Receita"], ...topProducts(+el.dataset.v).map((t) => [t.p.title, t.qty, t.rev.toFixed(2).replace(".", ",")])]),
    "dup-product": (el) => { const p = clone(prod(el.dataset.id)); p.id = Math.max(...S.products.map((x) => x.id)) + 1; p.title += " (cópia)"; p.sku += "-C"; p.slug += "-copia"; p.status = "rascunho"; p.stock = 0; S.products.push(p); log("Duplicou o produto " + p.title); save(); location.hash = "#/produtos/" + p.id; toast("Produto duplicado como rascunho"); },
    "del-product": (el) => { const p = prod(el.dataset.id); if (!confirm(`Excluir "${p.title}"? Esta ação não pode ser desfeita.`)) return; S.products = S.products.filter((x) => x !== p); log("Excluiu o produto " + p.title); save(); location.hash = "#/produtos"; toast("Produto excluído"); },
    "bulk-product": (el) => { const ids = selected("products"); S.products.forEach((p) => { if (ids.includes(p.id)) p.status = el.dataset.v; }); save(); rerender(); toast(ids.length + " produto(s) atualizados"); },
    "bulk-price": () => { const ids = selected("products"); modal("Reajustar preço de " + ids.length + " produto(s)", fld("pct", "Percentual de reajuste", 10, "number", 'step="0.1" required') + `<small class="hint">Use valor negativo para baixar o preço. Ex.: -5</small>`, (fd) => { const k = 1 + (+fd.get("pct")) / 100; S.products.forEach((p) => { if (ids.includes(p.id)) p.price = Math.round(p.price * k * 100) / 100; }); log(`Reajustou o preço de ${ids.length} produto(s) em ${fd.get("pct")}%`); toast("Preços reajustados"); }, "Aplicar"); },
    "add-variant": () => { const box = $("#variants"); const empty = $("[data-empty]", box); if (empty) empty.remove(); box.insertAdjacentHTML("beforeend", variantRow({ name: "", stock: 0 })); $("[data-variant]:last-child input", box).focus(); },
    "del-variant": (el) => el.closest("[data-variant]").remove(),
    "edit-cat": (el) => { const c = el.dataset.id ? cat(el.dataset.id) : null; modal(c ? "Editar categoria" : "Nova categoria", fld("name", "Nome", c && c.name, "text", "required") + fld("slug", "Endereço (/categoria/…)", c && c.slug) + `<div class="field"><label for="m-desc">Descrição</label><textarea id="m-desc" name="desc" class="input" rows="3">${e(c ? c.description : "")}</textarea></div>`, (fd) => { const name = fd.get("name").trim(); const slug = slugify(fd.get("slug") || name); if (c) Object.assign(c, { name, slug, description: fd.get("desc") }); else S.categories.push({ id: slug, name, slug, description: fd.get("desc"), visible: true }); log((c ? "Editou" : "Criou") + " a categoria " + name); toast("Categoria salva"); }); },
    "del-cat": (el) => { const c = cat(el.dataset.id); const n = S.products.filter((p) => p.cat === c.id).length; if (n) { toast(`Mova os ${n} produto(s) de ${c.name} antes de excluir`); return; } if (!confirm("Excluir a categoria " + c.name + "?")) return; S.categories = S.categories.filter((x) => x !== c); save(); rerender(); toast("Categoria excluída"); },
    review: (el) => { const r = S.reviews.find((x) => x.id === +el.dataset.id); r.status = el.dataset.v; log((el.dataset.v === "aprovada" ? "Aprovou" : "Rejeitou") + " uma avaliação de " + r.client); save(); rerender(); toast("Avaliação " + el.dataset.v); },
    "reply-review": (el) => { const r = S.reviews.find((x) => x.id === +el.dataset.id); modal("Responder " + r.client, `<blockquote style="margin:0;padding:10px 12px;border-radius:10px;background:var(--paper)">${e(r.text)}</blockquote><div class="field"><label for="m-reply">Resposta pública da loja</label><textarea id="m-reply" name="reply" class="input" rows="4" required>${e(r.reply)}</textarea></div>`, (fd) => { r.reply = fd.get("reply"); toast("Resposta publicada"); }, "Publicar resposta"); },
    "edit-coupon": (el) => {
      const c = el.dataset.id ? S.coupons.find((x) => x.id === +el.dataset.id) : null;
      modal(c ? "Editar cupom " + c.code : "Novo cupom",
        fld("code", "Código", c ? c.code : "", "text", 'required style="text-transform:uppercase"') + fld("desc", "Descrição interna", c && c.desc) +
        `<div class="row"><div class="field"><label for="m-type">Tipo</label><select id="m-type" name="type" class="input">${[["percent", "Percentual"], ["fixed", "Valor fixo"], ["shipping", "Frete grátis"]].map(([v, l]) => `<option value="${v}"${c && c.type === v ? " selected" : ""}>${l}</option>`).join("")}</select></div>${fld("value", "Valor", c ? c.value : 10, "number", 'step="0.01" min="0"')}</div>` +
        `<div class="row">${fld("min", "Pedido mínimo (R$)", c ? c.min : 0, "number", 'min="0"')}${fld("limit", "Limite de usos (0 = sem limite)", c ? c.limit : 0, "number", 'min="0"')}</div>` +
        `<div class="row">${fld("starts", "Início", c ? c.starts : S.today.slice(0, 10), "date")}${fld("ends", "Fim", c && c.ends, "date")}</div>`,
        (fd) => { const data = { code: fd.get("code").toUpperCase().replace(/\s+/g, ""), desc: fd.get("desc"), type: fd.get("type"), value: +fd.get("value"), min: +fd.get("min"), limit: +fd.get("limit"), starts: fd.get("starts"), ends: fd.get("ends") }; if (S.coupons.some((x) => x.code === data.code && x !== c)) { toast("Já existe um cupom " + data.code); return false; } if (c) Object.assign(c, data); else S.coupons.unshift({ id: Date.now(), uses: 0, active: true, ...data }); log((c ? "Editou" : "Criou") + " o cupom " + data.code); toast("Cupom " + data.code + " salvo"); });
    },
    "sec-move": (el) => { const a = S.home.sections, i = +el.dataset.i, j = i + +el.dataset.v; [a[i], a[j]] = [a[j], a[i]]; save(); rerender(); },
    "edit-banner": (el) => { const b = el.dataset.id ? S.home.banners.find((x) => x.id === +el.dataset.id) : null; modal(b ? "Editar banner" : "Novo banner", fld("title", "Título", b && b.title, "text", "required") + fld("link", "Link", b ? b.link : "/") + `<div class="field"><label for="m-img">Imagem</label><select id="m-img" name="img" class="input">${S.products.map((p) => `<option value="${p.img}"${b && b.img === p.img ? " selected" : ""}>${e(p.title)}</option>`).join("")}</select></div>` + fld("ends", "Exibir até (opcional)", b && b.ends, "date"), (fd) => { const d = { title: fd.get("title"), link: fd.get("link"), img: fd.get("img"), ends: fd.get("ends") }; if (b) Object.assign(b, d); else S.home.banners.push({ id: Date.now(), on: true, ...d }); log((b ? "Editou" : "Criou") + " o banner " + d.title); toast("Banner salvo"); }); },
    "del-page": (el) => { const p = S.pages.find((x) => x.id === +el.dataset.id); if (!confirm("Excluir a página " + p.title + "?")) return; S.pages = S.pages.filter((x) => x !== p); log("Excluiu a página " + p.title); save(); location.hash = "#/paginas"; toast("Página excluída"); },
    "menu-add": (el) => { S.menu[el.dataset.k].push({ label: "Novo link", link: "/" }); save(); rerender(); },
    "menu-del": (el) => { S.menu[el.dataset.k].splice(+el.dataset.i, 1); save(); rerender(); toast("Link removido"); },
    "menu-move": (el) => { const a = S.menu[el.dataset.k], i = +el.dataset.i, j = i + +el.dataset.v; [a[i], a[j]] = [a[j], a[i]]; save(); rerender(); },
    "edit-ship": (el) => { const s = el.dataset.id ? S.shipping.find((x) => x.id === +el.dataset.id) : null; modal(s ? "Editar " + s.name : "Nova forma de envio", fld("name", "Nome", s && s.name, "text", "required") + fld("region", "Região atendida", s ? s.region : "Brasil") + `<div class="row">${fld("price", "Preço", s ? s.price : "R$ 0,00")}${fld("days", "Prazo", s ? s.days : "")}</div>`, (fd) => { const d = { name: fd.get("name"), region: fd.get("region"), price: fd.get("price"), days: fd.get("days") }; if (s) Object.assign(s, d); else S.shipping.push({ id: Date.now(), on: true, ...d }); toast("Forma de envio salva"); }); },
    invite: () => modal("Convidar para a equipe", fld("name", "Nome", "", "text", "required") + fld("email", "E-mail", "", "email", "required") + `<div class="field"><label for="m-role">Função</label><select id="m-role" name="role" class="input">${Object.keys(S.roles).map((r) => `<option>${r}</option>`).join("")}</select></div>`, (fd) => { S.team.push({ id: Date.now(), name: fd.get("name"), email: fd.get("email"), role: fd.get("role"), last: "", on: true }); log("Convidou " + fd.get("name") + " como " + fd.get("role")); toast("Convite enviado (simulado)"); }, "Enviar convite"),

    "ban-customer": (el) => { const c = cust(el.dataset.id); if (!confirm(`Banir ${c.name}? O e-mail ${c.email} não conseguirá mais comprar no site.`)) return; S.banned.unshift({ id: Date.now(), kind: "E-mail", value: c.email, reason: "Banido pelo cadastro do cliente", at: nowIso(), who: "Marina Souza" }); log("Baniu o cliente " + c.name); save(); rerender(); toast(c.name + " banido"); },
    "edit-ban": () => modal("Bloquear", `<div class="field"><label for="m-kind">Tipo</label><select id="m-kind" name="kind" class="input"><option>E-mail</option><option>CPF</option><option>Telefone</option><option>IP</option></select></div>` + fld("value", "Valor", "", "text", "required") + fld("reason", "Motivo", "", "text", "required"), (fd) => { S.banned.unshift({ id: Date.now(), kind: fd.get("kind"), value: fd.get("value").trim(), reason: fd.get("reason"), at: nowIso(), who: "Marina Souza" }); log("Bloqueou " + fd.get("kind").toLowerCase() + " " + fd.get("value")); toast("Bloqueio adicionado"); }, "Bloquear"),
    unban: (el) => { const b = S.banned.find((x) => x.id === +el.dataset.id); if (!confirm("Desbloquear " + b.value + "?")) return; S.banned = S.banned.filter((x) => x !== b); log("Desbloqueou " + b.value); save(); rerender(); toast("Desbloqueado"); },
    media: (el) => { const g = S.gallery.find((x) => x.id === +el.dataset.id); modal(g.name, `<img src="${e(g.src)}" alt="${e(g.alt)}" style="max-height:260px;margin:0 auto;background:#fff;border-radius:12px;padding:10px;border:1px solid var(--line)"><div class="row"><div><span class="label">Tamanho</span><br>${kb(g.size)}</div><div><span class="label">Dimensões</span><br>${g.w} × ${g.h} px</div><div><span class="label">Enviada</span><br>${dfull(g.at)}</div></div>` + fld("alt", "Texto alternativo (acessibilidade e Google)", g.alt) + `<div class="field"><label for="m-folder">Pasta</label><select id="m-folder" name="folder" class="input">${["Produtos", "Banners", "Marca", "Páginas"].map((x) => `<option${g.folder === x ? " selected" : ""}>${x}</option>`).join("")}</select></div><div><span class="label">Usada em</span><br>${e(g.used.join(", ") || "Nenhum lugar")}</div><div><button class="btn btn--sm btn--danger" type="button" data-act="del-media" data-id="${g.id}">${ico("trash")}Excluir imagem</button></div>`, (fd) => { g.alt = fd.get("alt"); g.folder = fd.get("folder"); toast("Imagem atualizada"); }); },
    "del-media": (el) => { const g = S.gallery.find((x) => x.id === +el.dataset.id); if (g.used.length && !confirm(`${g.name} está em uso (${g.used.join(", ")}). Excluir mesmo assim?`)) return; S.gallery = S.gallery.filter((x) => x !== g); closeModal(); save(); rerender(); toast("Imagem excluída"); },
    "edit-affiliate": (el) => { const a = el.dataset.id ? S.affiliates.find((x) => x.id === +el.dataset.id) : null; modal(a ? "Editar " + a.name : "Novo afiliado", fld("name", "Nome ou canal", a && a.name, "text", "required") + `<div class="row">${fld("type", "Tipo", a ? a.type : "Instagram")}${fld("email", "E-mail", a && a.email, "email", "required")}</div><div class="row">${fld("code", "Cupom / código", a && a.code, "text", 'required style="text-transform:uppercase"')}${fld("rate", "Comissão (%)", a ? a.rate : 8, "number", 'min="0" max="50" step="0.5"')}</div>`, (fd) => { const d = { name: fd.get("name"), type: fd.get("type"), email: fd.get("email"), code: fd.get("code").toUpperCase().replace(/\s+/g, ""), rate: +fd.get("rate") }; if (S.affiliates.some((x) => x.code === d.code && x !== a)) { toast("Código " + d.code + " já em uso"); return false; } if (a) Object.assign(a, d); else S.affiliates.unshift({ id: Date.now(), clicks: 0, sales: 0, status: "ativo", paid: 0, since: S.today.slice(0, 10), ...d }); log((a ? "Editou" : "Cadastrou") + " o afiliado " + d.name); toast("Afiliado salvo"); }); },
    "aff-status": (el) => { const a = S.affiliates.find((x) => x.id === +el.dataset.id); a.status = el.dataset.v; log((el.dataset.v === "ativo" ? "Ativou" : "Suspendeu") + " o afiliado " + a.name); save(); rerender(); toast(a.name + ": " + el.dataset.v); },
    "pay-affiliates": () => { let n = 0; S.affiliates.filter((a) => a.status === "ativo").forEach((a) => { const c = a.sales * 98 * (a.rate / 100); if (c > a.paid) { a.paid = c; n++; } }); log("Pagou comissões de " + n + " afiliado(s)"); save(); rerender(); toast(n ? "Comissões de " + n + " afiliado(s) marcadas como pagas" : "Nada a pagar agora"); },
    "copy-link": (el) => { try { navigator.clipboard.writeText(el.dataset.v); } catch (_) { /* sem área de transferência */ } toast("Link copiado: " + el.dataset.v); },
    "plugin-config": (el) => { const p = S.plugins.find((x) => x.id === el.dataset.id); modal(p.name, `<p class="muted" style="margin:0">${e(p.desc)}</p>` + fld("opt", "Texto exibido", p.id === "whatsapp" ? "Fale com a OrbitX" : "Padrão") + sw('name="mobile" checked', true, "Mostrar também no celular"), () => toast("Plugin configurado")); },
    integration: (el) => { const i = S.integrations.find((x) => x.id === el.dataset.id); if (i.on) { if (!confirm("Desconectar " + i.name + "?")) return; i.on = false; log("Desconectou " + i.name); save(); rerender(); toast(i.name + " desconectado"); return; } modal("Conectar " + i.name, `<p class="muted" style="margin:0">Na versão real, aqui abre o login de ${e(i.name)} para autorizar o acesso. Na demonstração, basta informar a conta.</p>` + fld("account", "Conta ou ID", "", "text", "required"), (fd) => { i.on = true; i.account = fd.get("account"); i.last = nowIso(); log("Conectou " + i.name); toast(i.name + " conectado"); }, "Conectar"); },
    sync: (el) => { const i = S.integrations.find((x) => x.id === el.dataset.id); i.last = nowIso(); save(); rerender(); toast(i.name + " sincronizado"); },
    "new-key": () => modal("Nova chave de API", fld("name", "Para que serve", "", "text", "required"), (fd) => { const k = "ox_live_" + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10); S.apiKeys.push({ id: Date.now(), name: fd.get("name"), key: k.slice(0, 8) + "••••••••" + k.slice(-4), created: S.today.slice(0, 10), last: "" }); log("Criou a chave de API " + fd.get("name")); setTimeout(() => toast("Chave criada: " + k + " (copie agora, ela não aparece de novo)"), 50); }, "Criar chave"),
    "revoke-key": (el) => { const k = S.apiKeys.find((x) => x.id === +el.dataset.id); if (!confirm("Revogar a chave " + k.name + "? Quem usa essa chave perde o acesso.")) return; S.apiKeys = S.apiKeys.filter((x) => x !== k); log("Revogou a chave " + k.name); save(); rerender(); toast("Chave revogada"); },
    "new-hook": () => modal("Novo webhook", `<div class="field"><label for="m-ev">Evento</label><select id="m-ev" name="event" class="input">${["Pedido criado", "Pedido pago", "Pedido enviado", "Estoque baixo", "Novo cliente", "Nova avaliação"].map((x) => `<option>${x}</option>`).join("")}</select></div>` + fld("url", "URL que recebe o aviso", "https://", "url", "required"), (fd) => { S.webhooks.push({ id: Date.now(), event: fd.get("event"), url: fd.get("url"), on: true }); toast("Webhook criado"); }),
    "add-domain": () => modal("Conectar domínio", fld("host", "Domínio", "", "text", 'required placeholder="www.minhaloja.com.br"'), (fd) => { const host = fd.get("host").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""); if (S.domains.some((d) => d.host === host)) { toast(host + " já está conectado"); return false; } S.domains.push({ id: Date.now(), host, primary: false, ssl: "Aguardando DNS", dns: "Pendente", added: S.today.slice(0, 10) }); log("Adicionou o domínio " + host); toast("Domínio adicionado. Configure o DNS abaixo."); }, "Adicionar"),
    "verify-domain": (el) => { const d = S.domains.find((x) => x.id === +el.dataset.id); d.dns = "Verificado"; d.ssl = "Ativo"; save(); rerender(); toast(d.host + " verificado e com SSL ativo"); },
    "primary-domain": (el) => { S.domains.forEach((d) => (d.primary = d.id === +el.dataset.id)); const d = S.domains.find((x) => x.primary); log("Definiu " + d.host + " como domínio principal"); save(); rerender(); toast(d.host + " agora é o principal"); },
    "del-domain": (el) => { const d = S.domains.find((x) => x.id === +el.dataset.id); if (!confirm("Remover " + d.host + "?")) return; S.domains = S.domains.filter((x) => x !== d); save(); rerender(); toast("Domínio removido"); },
    "apply-tpl": (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); if (!confirm(`Aplicar o template ${t.name}? O conteúdo (produtos, páginas, banners) continua igual; só o visual muda.`)) return; S.templates.forEach((x) => (x.active = x === t)); log("Aplicou o template " + t.name); save(); rerender(); toast("Template " + t.name + " aplicado"); },
    "preview-tpl": (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); modal("Prévia: " + t.name, `<div class="tpl tpl--big" style="background:${t.colors[1]};color:${t.colors[2]}"><span class="tpl-bar" style="background:${t.colors[0]}"></span><span class="tpl-h" style="background:${t.colors[2]}"></span><span class="tpl-p" style="background:${t.colors[2]}"></span><span class="tpl-grid">${"<i></i>".repeat(4)}</span><span class="tpl-btn" style="background:${t.colors[0]}"></span></div><p class="muted" style="margin:0">${e(t.desc)}</p>`, null); },
    "customize-tpl": () => { location.hash = "#/aparencia"; },
    "email-preview": (el) => { const m = S.store.emails.find((x) => x.id === el.dataset.id); modal(m.name, `<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="background:#121514;padding:16px"><img src="img/logo-escuro.svg" alt="OrbitX" style="height:28px;width:auto"></div><div style="padding:18px"><p style="margin-top:0"><b>Olá, Rafael!</b></p><p>${m.id === "envio" ? "Seu pedido #10482 saiu para entrega. Código de rastreio: BR123456789OX." : m.id === "carrinho" ? "Você deixou itens no carrinho. Que tal finalizar? Use o cupom BEMVINDO10." : m.id === "avaliacao" ? "Seu pedido chegou? Conte o que achou do produto e ajude outros motoristas." : "Recebemos o seu pedido #10482 no valor de R$ 176,28. Assim que o pagamento for aprovado, avisamos por aqui."}</p><span class="btn btn--accent btn--sm">Ver pedido</span></div></div>`, null); }
  };

  const CHANGE = {
    "order-status": (el) => ACT["order-status"]({ dataset: { id: el.dataset.id, v: el.value } }),
    "cat-visible": (el) => { cat(el.dataset.id).visible = el.checked; toast("Categoria " + (el.checked ? "visível" : "oculta")); },
    "coupon-active": (el) => { S.coupons.find((x) => x.id === +el.dataset.id).active = el.checked; return true; },
    "section-on": (el) => { S.home.sections[+el.dataset.i].on = el.checked; return true; },
    "banner-on": (el) => { S.home.banners.find((x) => x.id === +el.dataset.id).on = el.checked; toast("Banner " + (el.checked ? "ativado" : "desativado")); },
    featured: (el) => { prod(el.dataset.id).featured = el.checked; toast(el.checked ? "Produto em destaque" : "Removido dos destaques"); },
    "menu-edit": (el) => { S.menu[el.dataset.k][+el.dataset.i][el.dataset.f] = el.value; toast("Menu salvo"); },
    maintenance: (el) => { S.store.maintenance = el.checked; toast(el.checked ? "Loja em manutenção (simulado)" : "Loja no ar"); },
    "ship-on": (el) => { S.shipping.find((x) => x.id === +el.dataset.id).on = el.checked; },
    "pay-on": (el) => { S.paymentMethods.find((x) => x.id === el.dataset.id).on = el.checked; toast(el.closest("div").querySelector("b").textContent + (el.checked ? " ativado" : " desativado")); },
    role: (el) => { S.team.find((x) => x.id === +el.dataset.id).role = el.value; toast("Função alterada"); },
    "user-on": (el) => { S.team.find((x) => x.id === +el.dataset.id).on = el.checked; },
    perm: (el) => { const a = S.roles[el.dataset.r]; if (el.checked) a.push(el.dataset.a); else a.splice(a.indexOf(el.dataset.a), 1); },

    upload: (el) => {
      const files = [...el.files];
      files.forEach((file) => {
        if (file.size > 400 * 1024) { toast(file.name + " passa de 400 KB, o limite desta demonstração"); return; }
        const r = new FileReader();
        r.onload = () => { const img = new Image(); img.onload = () => { S.gallery.unshift({ id: Date.now() + Math.random(), src: r.result, name: file.name, alt: file.name.replace(/\.[^.]+$/, ""), size: file.size, w: img.width, h: img.height, folder: "Produtos", at: nowIso(), used: [] }); save(); rerender(); toast(file.name + " enviada"); }; img.src = r.result; };
        r.readAsDataURL(file);
      });
    },
    antifraud: (el) => { S.store["antifraud" + el.dataset.k.charAt(0).toUpperCase() + el.dataset.k.slice(1)] = el.checked; toast("Proteção " + (el.checked ? "ativada" : "desativada")); },
    "plugin-on": (el) => { const p = S.plugins.find((x) => x.id === el.dataset.id); p.on = el.checked; log((el.checked ? "Ativou" : "Desativou") + " o plugin " + p.name); toast(p.name + (el.checked ? " ativado" : " desativado")); },
    "hook-on": (el) => { S.webhooks.find((x) => x.id === +el.dataset.id).on = el.checked; },
    "email-on": (el) => { S.store.emails.find((x) => x.id === el.dataset.id).on = el.checked; }
  };

  const FORM = {
    login: () => { S.logged = true; save(); location.hash = "#/painel"; route(); },
    "filter-orders": (f, fd) => (location.hash = qs("pedidos", { s: fd.get("s") === "Todos" ? "" : fd.get("s"), c: fd.get("c") === "Todos" ? "" : fd.get("c"), t: fd.get("t") })),
    "filter-products": (f, fd) => (location.hash = qs("produtos", { c: fd.get("c"), s: fd.get("s"), t: fd.get("t") })),
    "filter-customers": (f, fd) => (location.hash = qs("clientes", { g: fd.get("g"), t: fd.get("t") })),
    tracking: (f, fd) => { const o = S.orders.find((x) => x.id === +f.dataset.id); o.carrier = fd.get("carrier"); o.tracking = fd.get("tracking").trim(); if (o.tracking) o.history.push({ at: nowIso(), text: "Rastreio " + o.tracking + " (" + o.carrier + ")" }); return "Envio salvo"; },
    "order-note": (f, fd) => { const o = S.orders.find((x) => x.id === +f.dataset.id); o.history.push({ at: nowIso(), text: "Nota: " + fd.get("note") }); return "Nota adicionada"; },
    product: (f, fd) => {
      const id = +f.dataset.id;
      const variants = [...f.querySelectorAll("[data-variant]")].map((r) => ({ name: $("[name=vname]", r).value.trim(), stock: +$("[name=vstock]", r).value || 0 })).filter((v) => v.name);
      const d = { title: fd.get("title").trim(), description: fd.get("description"), tag: fd.get("tag").trim(), img: fd.get("img"), price: +fd.get("price"), old: +fd.get("old"), cost: +fd.get("cost"), sku: fd.get("sku").trim(), stock: +fd.get("stock"), min: +fd.get("min"), weight: +fd.get("weight"), dims: fd.get("dims"), slug: slugify(fd.get("slug") || fd.get("title")), seoTitle: fd.get("seoTitle"), seoDescription: fd.get("seoDescription"), url: fd.get("url"), status: fd.get("status"), cat: fd.get("cat"), featured: fd.get("featured") === "on", variants };
      if (S.products.some((p) => p.sku === d.sku && p.id !== id)) { toast("Já existe um produto com o SKU " + d.sku); return false; }
      if (id) { Object.assign(prod(id), d); log("Editou o produto " + d.title); return "Produto salvo"; }
      const nid = Math.max(0, ...S.products.map((p) => p.id)) + 1;
      S.products.push({ id: nid, ...d }); log("Criou o produto " + d.title); save(); location.hash = "#/produtos/" + nid; toast("Produto criado"); return false;
    },
    stock: (f, fd, ev) => { const p = prod(f.dataset.id); const dir = +(ev.submitter ? ev.submitter.value : 1); const q = Math.abs(+fd.get("qty") || 0) * dir; if (!q) return false; p.stock = Math.max(0, p.stock + q); S.stockMoves.unshift({ at: nowIso(), pid: p.id, qty: q, reason: fd.get("reason"), who: "Marina Souza" }); log(`${q > 0 ? "Entrada" : "Saída"} de ${Math.abs(q)} un. de ${p.title}`); return `Estoque de ${p.sku}: ${p.stock} un.`; },
    customer: (f, fd) => { const c = cust(f.dataset.id); Object.assign(c, { name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), address: fd.get("address"), notes: fd.get("notes"), newsletter: fd.get("newsletter") === "on", tags: fd.get("tags").split(",").map((x) => x.trim()).filter(Boolean) }); return "Cliente salvo"; },
    home: (f, fd) => { const h = S.home; h.topbar = { on: fd.get("topOn") === "on", text: fd.get("topText") }; Object.assign(h.hero, { kicker: fd.get("kicker"), title: fd.get("title"), text: fd.get("text"), cta: fd.get("cta"), ctaLink: fd.get("ctaLink"), img: fd.get("img") }); log("Publicou alterações na home"); return "Home publicada"; },
    page: (f, fd, ev) => {
      const id = +f.dataset.id; const as = ev.submitter ? ev.submitter.value : "rascunho";
      const d = { title: fd.get("title").trim(), slug: slugify(fd.get("slug") || fd.get("title")), seo: fd.get("seo"), body: $("#pgbody").innerHTML, status: as, updated: nowIso() };
      if (id) { Object.assign(S.pages.find((p) => p.id === id), d); log((as === "publicada" ? "Publicou" : "Salvou o rascunho de") + " a página " + d.title); return as === "publicada" ? "Página publicada" : "Rascunho salvo"; }
      const nid = Math.max(0, ...S.pages.map((p) => p.id)) + 1; S.pages.push({ id: nid, ...d }); log("Criou a página " + d.title); save(); location.hash = "#/paginas/" + nid; toast("Página criada"); return false;
    },
    social: (f, fd) => { Object.assign(S.menu.social, { instagram: fd.get("instagram"), whatsapp: fd.get("whatsapp"), youtube: fd.get("youtube") }); return "Redes sociais salvas"; },
    look: (f, fd) => { S.store.accent = fd.get("accent") || S.store.accent; S.store.themeDefault = fd.get("themeDefault"); S.theme = null; log("Alterou a aparência da loja"); return "Aparência salva"; },
    freeship: (f, fd) => { S.freeShippingMin = +fd.get("min"); return +fd.get("min") ? "Frete grátis a partir de " + brl(+fd.get("min")) : "Frete grátis desativado"; },
    store: (f, fd) => { ["name", "legal", "cnpj", "email", "phone", "city", "mlStore"].forEach((k) => (S.store[k] = fd.get(k))); return "Dados da loja salvos"; }
  };

  // ---------- eventos ----------
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("[data-act]");
    if (a) { ev.preventDefault(); const fn = ACT[a.dataset.act]; if (fn) fn(a, ev); return; }
    const cmd = ev.target.closest("[data-cmd]");
    if (cmd) { ev.preventDefault(); const v = cmd.dataset.cmd === "createLink" ? prompt("Endereço do link:", "https://") : cmd.dataset.v || null; if (cmd.dataset.cmd !== "createLink" || v) document.execCommand(cmd.dataset.cmd, false, v); $("#pgbody").focus(); return; }
    if (ev.target.closest("input, button, a, select, label")) return;
    const row = ev.target.closest("[data-go]");
    if (row) location.hash = row.dataset.go;
    const side = $("#side"); if (side && side.classList.contains("open") && !ev.target.closest("#side")) side.classList.remove("open");
  });

  document.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.dataset.all) { document.querySelectorAll(`[data-sel="${el.dataset.all}"]`).forEach((x) => (x.checked = el.checked)); }
    if (el.dataset.sel || el.dataset.all) {
      const kind = el.dataset.sel || el.dataset.all; const n = selected(kind).length; const bar = $("#bulk-" + kind);
      if (bar) { bar.hidden = !n; $("#bulk-n", bar).textContent = n + " selecionado(s)"; }
      return;
    }
    if (el.dataset.change && CHANGE[el.dataset.change]) { CHANGE[el.dataset.change](el); save(); if (["section-on", "coupon-active", "cat-visible", "plugin-on"].includes(el.dataset.change)) rerender(); return; }
    if (el.dataset.preview) { const img = $(el.dataset.preview); if (img) img.src = el.value; }
  });

  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.id === "q") return globalSearch(el.value);
    if (el.dataset.live) { const t = $("#mini-" + el.dataset.live); if (t) t.textContent = el.value; }
    if (el.dataset.slug) { const s = $(el.dataset.slug); if (s && !s.dataset.touched) s.value = slugify(el.value); }
    if (el.id === "slug" || el.id === "pgslug") el.dataset.touched = "1";
    if (el.hasAttribute("data-calc")) { const p = +$("#price").value, c = +$("#cost").value; $("#margin").innerHTML = `Margem: <b>${p ? ((p - c) / p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : 0}%</b> · Lucro por unidade: <b>${brl(p - c)}</b>`; }
    if (el.hasAttribute("data-seo") || el.id === "title" || el.id === "slug") { const box = $("#seo"); if (box) box.innerHTML = `<span>orbitx.duckdns.org › produto › ${e($("#slug").value || "novo-produto")}</span><b>${e($("#seoTitle").value || $("#title").value || "Título do produto")}</b><p>${e($("#seoDescription").value || $("#description").value.slice(0, 150))}</p>`; }
  });

  document.addEventListener("submit", (ev) => {
    const f = ev.target.closest("[data-form]");
    if (!f) return;
    ev.preventDefault();
    const fn = FORM[f.dataset.form];
    if (!fn) return;
    const msg = fn(f, new FormData(f, ev.submitter), ev);
    if (msg === false || msg === undefined) return;
    save(); rerender(); toast(msg);
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { closeModal(); const r = $("#qres"); if (r) r.hidden = true; }
    if (ev.key === "/" && !ev.target.closest("input, textarea, [contenteditable]")) { const q = $("#q"); if (q) { ev.preventDefault(); q.focus(); } }
  });

  function globalSearch(v) {
    const box = $("#qres"); if (!box) return;
    const t = v.trim().toLowerCase();
    if (t.length < 2) { box.hidden = true; return; }
    const res = [
      ...S.orders.filter((o) => String(o.id).includes(t) || o.client.toLowerCase().includes(t)).slice(0, 4).map((o) => [`#/pedidos/${o.id}`, `Pedido #${o.id} · ${o.client}`, brl(o.total)]),
      ...S.products.filter((p) => (p.title + p.sku).toLowerCase().includes(t)).slice(0, 4).map((p) => [`#/produtos/${p.id}`, p.title, p.sku]),
      ...S.customers.filter((c) => (c.name + c.email).toLowerCase().includes(t)).slice(0, 4).map((c) => [`#/clientes/${c.id}`, c.name, "Cliente"]),
      ...S.pages.filter((p) => p.title.toLowerCase().includes(t)).slice(0, 2).map((p) => [`#/paginas/${p.id}`, p.title, "Página"])
    ];
    box.innerHTML = res.map(([h, l, s]) => `<a href="${h}"><span>${e(l)}</span><small class="soft">${e(s)}</small></a>`).join("") || `<p class="empty" style="padding:14px">Nada encontrado para "${e(v)}".</p>`;
    box.hidden = false;
  }

  window.addEventListener("hashchange", () => { closeModal(); route(); });
  route();
})();
