# Painel administrativo OrbitX (demonstração)

Painel de gestão da loja com dados fictícios: pedidos, produtos, estoque, categorias, galeria,
clientes, avaliações, banidos, cupons, afiliados, relatórios, home e banners, páginas, menu,
templates, aparência, plugins, integrações, domínios, frete, pagamentos, equipe e e-mails. O design começou no Claude Design (artboard "Admin OrbitX" no canvas
OrbitX Loja) e segue as cores e fontes da loja, com modo claro e escuro.

- Sem backend e sem dependências: HTML, CSS e JavaScript puros.
- Os 10 produtos e preços são os reais da loja no Mercado Livre; o resto é inventado.
- As alterações ficam salvas no navegador (localStorage). "Restaurar dados" no menu volta ao início.
- Login de demonstração: qualquer senha.

## Modo prévia e modo completo

O arquivo `config.js` escolhe o modo:

- `modo: "previa"` (padrão agora): versão para apresentar à OrbitX. Só Painel e Produtos funcionam, sem
  nenhum dado; Home e banners, Templates e Aparência saem do menu; o resto aparece desativado como "Em breve".
- `modo: "completo"`: o painel inteiro com dados de demonstração.

Cada modo guarda o que for editado em um espaço separado do navegador.

Para abrir localmente:

```sh
cd admin && python3 -m http.server 8080
# http://localhost:8080
```

Para servir junto com a loja, basta copiar a pasta para `/usr/share/nginx/html/admin/`
no container do site. O botão "Ver loja" aponta para `../`.

A pesquisa sobre o que um admin de e-commerce costuma ter está em [PESQUISA.md](PESQUISA.md).
