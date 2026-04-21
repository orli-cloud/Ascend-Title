FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/.gitignore
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
