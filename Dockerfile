FROM python:3.11-slim

WORKDIR /app

# Install dependencies (google-cloud-storage for persistent GCS user storage)
RUN pip install --no-cache-dir google-cloud-storage

# Copy all application files into container
COPY . /app

EXPOSE 8080

CMD ["python3", "server.py"]
