// Dados de demonstração do painel OrbitX.
// Os 10 produtos e preços são os da loja real no Mercado Livre; estoque, pedidos,
// clientes, avaliações, cupons e equipe são fictícios e gerados de forma determinística.
(function () {
  const TODAY = new Date("2026-10-02T23:00:00-03:00");

  // Gerador pseudoaleatório com semente fixa: os mesmos dados a cada carga.
  let seed = 20261002;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const ML = "https://www.mercadolivre.com.br/";

  const categories = [
    { id: "peliculas", name: "Películas", slug: "peliculas", description: "Películas antirreflexo para a Starlink Mini.", visible: true },
    { id: "suportes", name: "Suportes", slug: "suportes", description: "Suportes de painel com ventosas, sem furos.", visible: true },
    { id: "acessorios", name: "Acessórios", slug: "acessorios", description: "Ventosas de reposição e organizadores.", visible: true },
    { id: "kits", name: "Kits", slug: "kits", description: "Combinações de suporte e película com desconto.", visible: false }
  ];

  const products = [
    { id: 1, sku: "OX-PEL-001", cat: "peliculas", img: "img/p1.webp", title: "Película Adesiva Antirreflexo Orbitx para Starlink Mini", old: 98, price: 38.8, cost: 9.4, stock: 38, min: 10, weight: 60, tag: "Oferta imperdível", url: ML + "pelicula-adesiva-antirreflexo-orbitx-para-starlink-mini/up/MLBU4223658498" },
    { id: 2, sku: "OX-PEL-002", cat: "peliculas", img: "img/p2.webp", title: "Película Anti Reflexo Orbitx Starlink Mini G5 (5ª geração)", old: 60, price: 41, cost: 10.1, stock: 9, min: 10, weight: 60, url: ML + "pelicula-anti-reflexo-orbitx-starlink-mini-g5--5-geracao/up/MLBU3664631268" },
    { id: 3, sku: "OX-PEL-003", cat: "peliculas", img: "img/p3.webp", title: "Película Anti Reflexo Orbitx Starlink Mini Adesivo Completo", old: 89, price: 39, cost: 9.8, stock: 52, min: 10, weight: 70, url: ML + "pelicula-anti-reflexo-orbitx-starlink-mini-adesivo-completo/up/MLBU4223122766" },
    { id: 4, sku: "OX-PEL-004", cat: "peliculas", img: "img/p4.webp", title: "Película Antirreflexo Premium para Starlink Mini", old: 49, price: 41.2, cost: 12.3, stock: 27, min: 8, weight: 60, url: ML + "pelicula-antirreflexo-premium-para-starlink-mini-qualidade/up/MLBU4231899550" },
    { id: 5, sku: "OX-SUP-005", cat: "suportes", img: "img/p5.webp", title: "Suporte de Painel Starlink Mini com Ventosas (Painel Curto e Longo)", old: 150, price: 88, cost: 31.5, stock: 4, min: 12, weight: 640, tag: "Mais vendido", url: ML + "suporte-de-painel-starlink-mini-ventosas-painel-curto-longo/up/MLBU4685500013" },
    { id: 6, sku: "OX-ACE-006", cat: "acessorios", img: "img/p6.webp", title: "Ventosas Orbitx Starlink Mini para Painel, Alta Sucção", old: 298, price: 90.21, cost: 28.9, stock: 6, min: 8, weight: 420, url: ML + "ventosas-orbitx-starlink-mini-para-painel-alta-succao/up/MLBU3752712871" },
    { id: 7, sku: "OX-SUP-007", cat: "suportes", img: "img/p7.webp", title: "Suporte de Painel Starlink Mini com Ventosas (Hilux, Creta)", old: 150, price: 88.27, cost: 32.2, stock: 21, min: 8, weight: 650, url: ML + "suporte-de-painel-starlink-mini-ventosas-hilux-creta/up/MLBU4693485067" },
    { id: 8, sku: "OX-SUP-008", cat: "suportes", img: "img/p8.webp", title: "Suporte de Painel Starlink Mini com Ventosas Antimulta", old: 130, price: 86.28, cost: 30.7, stock: 17, min: 8, weight: 630, url: ML + "suporte-de-painel-starlink-mini-com-ventosas-antimulta/up/MLBU3752695733" },
    { id: 9, sku: "OX-KIT-009", cat: "suportes", img: "img/p9.webp", title: "Kit Suporte de Painel Starlink Mini + Adesivo Antirreflexo", old: 255, price: 89, cost: 38.4, stock: 14, min: 6, weight: 720, tag: "Kit", url: ML + "suporte-painel-antena-starlink-mini--adesivo-antivo-reflexo/up/MLBU3758677061" },
    { id: 10, sku: "OX-ACE-010", cat: "acessorios", img: "img/p10.webp", title: "Organizador Suporte de Cabo para Carregador de Carro Elétrico (Wallbox)", old: 199, price: 89.24, cost: 27.6, stock: 0, min: 5, weight: 380, url: ML + "organizador-suporte-cabo-carregador-carro-eletrico-wallbox/up/MLBU4503158528" }
  ].map((p) => ({
    status: "ativo",
    slug: p.title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: "Produto oficial OrbitX para Starlink Mini. Instalação simples, sem ferramentas, com garantia de 90 dias.",
    seoTitle: "", seoDescription: "",
    dims: p.weight > 300 ? "28 × 22 × 8 cm" : "32 × 24 × 1 cm",
    featured: [1, 5, 9].includes(p.id),
    variants: p.cat === "peliculas" ? [{ name: "Fosca", stock: Math.ceil(p.stock / 2) }, { name: "Fosca extra", stock: Math.floor(p.stock / 2) }] : [],
    ...p
  }));

  const firstNames = ["Rafael", "Juliana", "Carlos", "Patrícia", "Thiago", "Fernanda", "Lucas", "Camila", "Bruno", "Aline", "Gustavo", "Mariana", "Diego", "Larissa", "Rodrigo", "Beatriz", "André", "Vanessa", "Felipe", "Renata", "Marcelo", "Tatiane", "Eduardo", "Priscila", "Leonardo", "Débora", "Vinícius", "Natália", "Henrique", "Simone"];
  const lastNames = ["Menezes", "Prado", "Lima", "Nogueira", "Albuquerque", "Barros", "Cardoso", "Teixeira", "Ribeiro", "Moura", "Farias", "Pacheco", "Rezende", "Campos", "Vieira", "Monteiro", "Siqueira", "Duarte", "Assis", "Freitas"];
  const cities = [["São Paulo", "SP"], ["Campinas", "SP"], ["Goiânia", "GO"], ["Cuiabá", "MT"], ["Campo Grande", "MS"], ["Belo Horizonte", "MG"], ["Uberlândia", "MG"], ["Curitiba", "PR"], ["Londrina", "PR"], ["Porto Alegre", "RS"], ["Florianópolis", "SC"], ["Brasília", "DF"], ["Palmas", "TO"], ["Rio Verde", "GO"], ["Sinop", "MT"], ["Ribeirão Preto", "SP"], ["Manaus", "AM"], ["Salvador", "BA"], ["Recife", "PE"], ["Fortaleza", "CE"]];
  const streets = ["Rua das Palmeiras", "Av. Brasil", "Rua XV de Novembro", "Av. Goiás", "Rua Sete de Setembro", "Rua dos Ipês", "Av. Paulista", "Rua Amazonas", "Av. Rio Branco", "Rua Tiradentes"];

  const customers = [];
  for (let i = 0; i < 64; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = pick(lastNames);
    const [city, uf] = pick(cities);
    const since = new Date(TODAY.getTime() - int(5, 420) * 864e5);
    customers.push({
      id: 3001 + i,
      name: fn + " " + ln,
      email: (fn + "." + ln).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + int(1, 99) + "@exemplo.com.br",
      phone: "(" + int(11, 99) + ") 9" + int(1000, 9999) + "-" + int(1000, 9999),
      cpf: int(100, 999) + ".***.***-" + int(10, 99),
      city, uf,
      address: pick(streets) + ", " + int(12, 2400) + " - " + city + "/" + uf,
      since: since.toISOString(),
      tags: rnd() < 0.18 ? ["VIP"] : rnd() < 0.2 ? ["Frotista"] : [],
      newsletter: rnd() < 0.55,
      notes: ""
    });
  }

  const statuses = ["Aguardando pagamento", "Pago", "Em separação", "Enviado", "Entregue", "Cancelado"];
  const channels = ["Site", "Mercado Livre", "Mercado Livre", "WhatsApp"];
  const payments = ["Pix", "Cartão de crédito", "Cartão de crédito", "Boleto", "Mercado Pago"];
  const carriers = ["Correios PAC", "Correios SEDEX", "Mercado Envios", "Jadlog"];
  const weights = [10, 5, 8, 6, 22, 9, 11, 8, 10, 4];

  const orders = [];
  let num = 10482;
  for (let d = 0; d < 120; d++) {
    const date = new Date(TODAY.getTime() - d * 864e5);
    const trend = 1 + (120 - d) / 160;
    const n = Math.max(0, Math.round((3 + rnd() * 6) * trend * (date.getDay() === 0 ? 0.6 : 1)));
    for (let k = 0; k < n; k++) {
      const c = pick(customers);
      const items = [];
      const lines = rnd() < 0.78 ? 1 : 2;
      for (let l = 0; l < lines; l++) {
        let idx = 0, r = rnd() * weights.reduce((a, b) => a + b, 0);
        while ((r -= weights[idx]) > 0) idx++;
        const p = products[idx];
        if (items.find((it) => it.pid === p.id)) continue;
        items.push({ pid: p.id, title: p.title, sku: p.sku, img: p.img, qty: rnd() < 0.85 ? 1 : 2, price: p.price });
      }
      const sub = items.reduce((s, it) => s + it.qty * it.price, 0);
      const ship = sub > 79 ? 0 : pick([18.9, 22.5, 24.9]);
      const disc = rnd() < 0.12 ? Math.round(sub * 0.1 * 100) / 100 : 0;
      let status;
      if (d === 0) status = pick(["Aguardando pagamento", "Pago", "Pago", "Em separação"]);
      else if (d < 3) status = pick(["Pago", "Em separação", "Enviado", "Enviado", "Aguardando pagamento"]);
      else if (d < 8) status = pick(["Enviado", "Enviado", "Entregue", "Entregue", "Cancelado"]);
      else status = rnd() < 0.06 ? "Cancelado" : "Entregue";
      const at = new Date(date.getTime() - int(0, 22) * 36e5 - int(0, 59) * 6e4);
      const carrier = pick(carriers);
      const history = [{ at: at.toISOString(), text: "Pedido criado" }];
      if (status !== "Aguardando pagamento" && status !== "Cancelado") history.push({ at: new Date(at.getTime() + 18 * 6e4).toISOString(), text: "Pagamento aprovado" });
      if (["Enviado", "Entregue"].includes(status)) history.push({ at: new Date(at.getTime() + 26 * 36e5).toISOString(), text: "Enviado por " + carrier });
      if (status === "Entregue") history.push({ at: new Date(at.getTime() + int(3, 7) * 864e5).toISOString(), text: "Entregue ao destinatário" });
      if (status === "Cancelado") history.push({ at: new Date(at.getTime() + 2 * 864e5).toISOString(), text: "Cancelado: pagamento não confirmado" });
      orders.push({
        id: num--,
        at: at.toISOString(),
        cid: c.id,
        client: c.name,
        channel: pick(channels),
        payment: pick(payments),
        status,
        items,
        subtotal: Math.round(sub * 100) / 100,
        shipping: ship,
        discount: disc,
        coupon: disc ? pick(["ESTRADA10", "BEMVINDO10"]) : "",
        total: Math.round((sub + ship - disc) * 100) / 100,
        carrier,
        tracking: ["Enviado", "Entregue"].includes(status) ? "BR" + int(100000000, 999999999) + "OX" : "",
        address: c.address,
        notes: [],
        history
      });
    }
  }
  orders.sort((a, b) => b.at.localeCompare(a.at));

  const reviewTexts = [
    [5, "Segurou firme na estrada de terra", "Fiz 600 km de chão batido e o suporte não mexeu. Recomendo."],
    [5, "Película resolveu o reflexo", "Antes eu não conseguia ver o app no sol. Agora ficou perfeito."],
    [4, "Bom, mas a ventosa pede limpeza", "Funciona muito bem, só precisa limpar o painel antes de instalar."],
    [5, "Chegou rápido", "Entrega em 3 dias e produto bem embalado."],
    [3, "Serviu, mas apertado na Hilux", "Na Hilux 2024 precisei ajustar a posição. Depois ficou ok."],
    [5, "Kit vale muito a pena", "Suporte e película juntos saíram bem mais barato."],
    [2, "Veio sem manual", "Produto bom, mas não veio instrução de instalação."],
    [5, "Qualidade excelente", "Material grosso, acabamento bonito. Comprei outro para o segundo carro."],
    [4, "Atendeu", "Faz o que promete. Achei o preço justo."],
    [1, "Ventosa soltou no calor", "No painel muito quente a ventosa soltou duas vezes."]
  ];
  const reviews = reviewTexts.map(([rating, title, text], i) => {
    const o = orders[8 + i * 7];
    return {
      id: 501 + i, pid: o.items[0].pid, product: o.items[0].title, client: o.client, rating, title, text,
      at: new Date(new Date(o.at).getTime() + 6 * 864e5).toISOString(),
      status: i < 3 ? "pendente" : i === 9 ? "rejeitada" : "aprovada",
      reply: i === 6 ? "Oi! Já colocamos o manual em PDF na página Como instalar. Obrigado pelo aviso." : ""
    };
  });

  const coupons = [
    { id: 1, code: "BEMVINDO10", type: "percent", value: 10, min: 0, uses: 128, limit: 0, starts: "2026-01-01", ends: "", active: true, desc: "Primeira compra no site" },
    { id: 2, code: "ESTRADA10", type: "percent", value: 10, min: 150, uses: 41, limit: 300, starts: "2026-09-01", ends: "2026-10-31", active: true, desc: "Campanha Pé na Estrada" },
    { id: 3, code: "FRETEGRATIS", type: "shipping", value: 0, min: 60, uses: 77, limit: 0, starts: "2026-08-15", ends: "2026-12-31", active: true, desc: "Frete grátis acima de R$ 60" },
    { id: 4, code: "KIT20", type: "fixed", value: 20, min: 89, uses: 12, limit: 100, starts: "2026-07-01", ends: "2026-09-30", active: false, desc: "R$ 20 off em kits (encerrado)" },
    { id: 5, code: "BLACKORBIT", type: "percent", value: 25, min: 0, uses: 0, limit: 500, starts: "2026-11-27", ends: "2026-11-30", active: true, desc: "Black Friday (agendado)" }
  ];

  const pages = [
    { id: 1, title: "Sobre a OrbitX", slug: "sobre", status: "publicada", updated: "2026-09-28T14:10:00-03:00", seo: "Conheça a OrbitX, fabricante de acessórios para Starlink Mini.", body: "<h2>Quem somos</h2><p>A OrbitX desenvolve acessórios para quem leva a Starlink Mini na estrada: películas antirreflexo, suportes de painel com ventosas e organizadores.</p><p>Todos os produtos são testados em estrada de terra e asfalto antes de chegar à loja.</p>" },
    { id: 2, title: "Como instalar", slug: "como-instalar", status: "publicada", updated: "2026-09-30T09:42:00-03:00", seo: "Passo a passo para instalar o suporte e a película.", body: "<h2>Suporte com ventosas</h2><ol><li>Limpe o painel com pano úmido.</li><li>Pressione as ventosas e trave.</li><li>Encaixe a Starlink Mini.</li></ol><h2>Película</h2><p>Aplique com a superfície seca, do centro para as bordas.</p>" },
    { id: 3, title: "Trocas e devoluções", slug: "trocas-e-devolucoes", status: "publicada", updated: "2026-08-12T17:05:00-03:00", seo: "Prazo de 7 dias para arrependimento e 90 dias de garantia.", body: "<p>Você pode desistir da compra em até <strong>7 dias</strong> após o recebimento. Defeitos de fabricação têm garantia de <strong>90 dias</strong>.</p>" },
    { id: 4, title: "Política de privacidade", slug: "privacidade", status: "publicada", updated: "2026-06-01T10:00:00-03:00", seo: "Como tratamos seus dados conforme a LGPD.", body: "<p>Coletamos apenas os dados necessários para processar seu pedido, conforme a LGPD.</p>" },
    { id: 5, title: "Perguntas frequentes", slug: "faq", status: "publicada", updated: "2026-09-21T11:20:00-03:00", seo: "Dúvidas sobre compra, frete e compatibilidade.", body: "<h3>Onde finalizo a compra?</h3><p>No Mercado Livre, com pagamento e frete protegidos.</p><h3>Preciso furar o painel?</h3><p>Não. Os suportes fixam com ventosas.</p>" },
    { id: 6, title: "Compatibilidade por veículo", slug: "compatibilidade", status: "rascunho", updated: "2026-10-01T18:33:00-03:00", seo: "", body: "<p>Tabela de compatibilidade em construção: Hilux, Creta, S10, Ranger, Compass…</p>" }
  ];

  const home = {
    topbar: { on: true, text: "Frete grátis em diversos produtos, com a compra protegida pelo Mercado Livre" },
    hero: { kicker: "Acessórios para Starlink Mini", title: "Sinal no céu. Starlink Mini firme no painel.", text: "Películas antirreflexo e suportes com ventosas para quem leva a internet via satélite na estrada.", cta: "Ver produtos", ctaLink: "#produtos", img: "img/p5.webp" },
    sections: [
      { id: "vantagens", name: "Faixa de vantagens", on: true },
      { id: "ofertas", name: "Ofertas da semana", on: true },
      { id: "uso", name: "Escolha pelo uso", on: true },
      { id: "instalar", name: "Como instalar", on: true },
      { id: "depoimentos", name: "Depoimentos", on: false },
      { id: "faq", name: "Perguntas frequentes", on: true },
      { id: "newsletter", name: "Newsletter", on: false }
    ],
    banners: [
      { id: 1, title: "Pé na Estrada: 10% off acima de R$ 150", link: "/cupom/ESTRADA10", img: "img/p9.webp", on: true, ends: "2026-10-31" },
      { id: 2, title: "Película para Starlink Mini G5", link: "/produto/2", img: "img/p2.webp", on: true, ends: "" },
      { id: 3, title: "Black Friday OrbitX", link: "/black-friday", img: "img/p6.webp", on: false, ends: "2026-11-30" }
    ]
  };

  const menu = {
    header: [
      { label: "Películas", link: "/categoria/peliculas" },
      { label: "Suportes", link: "/categoria/suportes" },
      { label: "Acessórios", link: "/categoria/acessorios" },
      { label: "Como instalar", link: "/pagina/como-instalar" }
    ],
    footer: [
      { label: "Sobre a OrbitX", link: "/pagina/sobre" },
      { label: "Trocas e devoluções", link: "/pagina/trocas-e-devolucoes" },
      { label: "Política de privacidade", link: "/pagina/privacidade" },
      { label: "Perguntas frequentes", link: "/pagina/faq" }
    ],
    social: { instagram: "@orbitx.tech", whatsapp: "(62) 99999-0000", youtube: "" }
  };

  const shipping = [
    { id: 1, name: "Mercado Envios", region: "Brasil", price: "Calculado pelo ML", days: "2 a 7 dias úteis", on: true },
    { id: 2, name: "Correios PAC", region: "Brasil", price: "Tabela Correios", days: "5 a 12 dias úteis", on: true },
    { id: 3, name: "Correios SEDEX", region: "Brasil", price: "Tabela Correios", days: "1 a 4 dias úteis", on: true },
    { id: 4, name: "Jadlog", region: "Sul, Sudeste e Centro-Oeste", price: "Tabela Jadlog", days: "3 a 6 dias úteis", on: false },
    { id: 5, name: "Retirada em Goiânia", region: "Goiânia/GO", price: "Grátis", days: "No mesmo dia", on: true }
  ];
  const freeShippingMin = 79;

  const paymentMethods = [
    { id: "pix", name: "Pix", detail: "5% de desconto à vista", on: true },
    { id: "cartao", name: "Cartão de crédito", detail: "Até 3x sem juros, 12x com juros", on: true },
    { id: "boleto", name: "Boleto bancário", detail: "Vence em 3 dias úteis", on: true },
    { id: "mp", name: "Mercado Pago", detail: "Checkout do Mercado Pago", on: true },
    { id: "ml", name: "Compra pelo Mercado Livre", detail: "Botão leva ao anúncio oficial", on: true }
  ];

  const team = [
    { id: 1, name: "Marina Souza", email: "marina@orbitx.com.br", role: "Administradora", last: "2026-10-02T22:51:00-03:00", on: true },
    { id: 2, name: "Paulo Henrique", email: "paulo@orbitx.com.br", role: "Expedição", last: "2026-10-02T17:20:00-03:00", on: true },
    { id: 3, name: "Letícia Amaral", email: "leticia@orbitx.com.br", role: "Marketing", last: "2026-10-01T15:03:00-03:00", on: true },
    { id: 4, name: "Sérgio Lopes", email: "sergio@orbitx.com.br", role: "Atendimento", last: "2026-09-29T10:44:00-03:00", on: false }
  ];
  const roles = {
    "Administradora": ["Pedidos", "Produtos", "Clientes", "Marketing", "Site", "Relatórios", "Configurações"],
    "Expedição": ["Pedidos", "Produtos"],
    "Marketing": ["Marketing", "Site", "Relatórios"],
    "Atendimento": ["Pedidos", "Clientes"]
  };

  const activity = [
    { at: "2026-10-02T22:51:00-03:00", who: "Marina Souza", text: "Publicou a página Como instalar" },
    { at: "2026-10-02T17:20:00-03:00", who: "Paulo Henrique", text: "Marcou 9 pedidos como enviados" },
    { at: "2026-10-02T11:08:00-03:00", who: "Letícia Amaral", text: "Ativou o banner Pé na Estrada" },
    { at: "2026-10-01T18:33:00-03:00", who: "Marina Souza", text: "Criou o rascunho Compatibilidade por veículo" },
    { at: "2026-10-01T09:12:00-03:00", who: "Paulo Henrique", text: "Entrada de 40 un. de Película Adesiva Antirreflexo" },
    { at: "2026-09-30T16:47:00-03:00", who: "Letícia Amaral", text: "Agendou o cupom BLACKORBIT" }
  ];

  const stockMoves = [
    { at: "2026-10-01T09:12:00-03:00", pid: 1, qty: 40, reason: "Entrada de fornecedor", who: "Paulo Henrique" },
    { at: "2026-09-29T14:30:00-03:00", pid: 5, qty: -2, reason: "Avaria", who: "Paulo Henrique" },
    { at: "2026-09-27T10:05:00-03:00", pid: 9, qty: 20, reason: "Entrada de fornecedor", who: "Paulo Henrique" },
    { at: "2026-09-25T15:41:00-03:00", pid: 10, qty: -1, reason: "Ajuste de inventário", who: "Marina Souza" }
  ];

  const store = {
    name: "OrbitX Technology", legal: "OrbitX Comércio de Acessórios Ltda. (fictício)", cnpj: "00.000.000/0001-00",
    email: "contato@orbitx.com.br", phone: "(62) 99999-0000", city: "Goiânia/GO",
    mlStore: ML + "pagina/stvi20240514220615",
    accent: "#8be41c", themeDefault: "claro", maintenance: false,
    emails: [
      { id: "confirmacao", name: "Pedido confirmado", on: true },
      { id: "pagamento", name: "Pagamento aprovado", on: true },
      { id: "envio", name: "Pedido enviado (com rastreio)", on: true },
      { id: "carrinho", name: "Carrinho abandonado", on: false },
      { id: "avaliacao", name: "Pedido de avaliação após entrega", on: true }
    ]
  };

  window.ORBITX_SEED = { today: TODAY.toISOString(), categories, products, customers, orders, reviews, coupons, pages, home, menu, shipping, freeShippingMin, paymentMethods, team, roles, activity, stockMoves, store };
})();
