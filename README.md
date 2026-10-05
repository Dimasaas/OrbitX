# OrbitX

Site de demonstração da loja **OrbitX Technology** (películas antirreflexo e suportes para Starlink Mini), que hoje vende no Mercado Livre. São duas partes: a loja virtual e o painel administrativo.

![Loja virtual e painel de gestão OrbitX](docs/mockups/capa.jpg)

**Ver no ar:** [loja](https://orbitax.duckdns.org) · [painel administrativo](https://orbitax.duckdns.org/admin/)

> Versão de apresentação: na loja só a página inicial navega (o resto aparece como "em construção") e no painel só Painel e Produtos funcionam.

## Loja virtual

- Vitrine com os 10 produtos da loja, filtro por categoria e preços consultados no Mercado Livre.
- Modo claro e escuro, escolhido no topo da página e salvo no navegador.
- Layout pensado para o celular primeiro.

![Modo claro e escuro](docs/mockups/temas.jpg)

## Painel administrativo

- Indicadores de receita, pedidos, ticket médio e produtos ativos.
- Cadastro e lista de produtos com busca e filtros.
- Mesmo visual da loja, também com modo claro e escuro.

![Painel administrativo](docs/mockups/admin.jpg)

## No celular

![Loja e painel no celular](docs/mockups/celulares.jpg)

## Onde está o código

| Parte | Pasta | Branch |
| --- | --- | --- |
| Loja | `site/` | [`site-demo`](https://github.com/Dimasaas/OrbitX/tree/site-demo) (PR #1) |
| Painel | `admin/` | [`claude/admin-panel-cljgk1`](https://github.com/Dimasaas/OrbitX/tree/claude/admin-panel-cljgk1) (PR #2) |

HTML, CSS e JavaScript puros, sem dependências. A loja roda em um container nginx (`site/Dockerfile`).

Para abrir localmente:

```sh
cd site && python3 -m http.server 8080   # loja em http://localhost:8080
cd admin && python3 -m http.server 8081  # painel em http://localhost:8081
```

---

Starlink é marca de seus respectivos titulares e aparece aqui só para indicar compatibilidade.
