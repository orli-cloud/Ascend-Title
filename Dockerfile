FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/.gitignore /usr/share/nginx/html/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
