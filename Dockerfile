FROM nginx:alpine

# Remove default nginx config and replace with one that reads $PORT
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config that listens on the $PORT environment variable
# Cloud Run sets $PORT (default 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static app files into the nginx html directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
COPY manifest.json /usr/share/nginx/html/
COPY Olivia-Regular.ttf /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
