FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Tudo o que estiver no contexto vai para o ar, menos o que o .dockerignore tira.
# No deploy, a pasta admin/ (PR #2) entra ao lado e fica em /admin/.
COPY . /usr/share/nginx/html/
