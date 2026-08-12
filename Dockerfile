FROM python:3.11-slim

WORKDIR /app

# Copy all application files into container
COPY . /app

EXPOSE 8080

CMD ["python3", "server.py"]
