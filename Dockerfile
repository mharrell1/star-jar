# Use a lightweight nginx image to serve static files

FROM nginx:alpine AS runtime

# Copy static assets into nginx's html directory
COPY . /usr/share/nginx/html

# Expose the port that Cloud Run expects (default $PORT but nginx listens on 80)
# Cloud Run will map the $PORT env var to the container's port – we use a simple trick via env substitution
ENV PORT 8080
EXPOSE 8080

# Override nginx config to listen on $PORT (optional, default 80 works as Cloud Run forwards)
# Here we just keep the default configuration which listens on 80.

# No extra commands needed – container will start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
