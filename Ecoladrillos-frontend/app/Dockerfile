# Pull official base image
FROM python:3.10-slim

# Set work directory
WORKDIR /usr/src/app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (nota: netcat reemplazado por netcat-openbsd)
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    dos2unix \
    netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python dependencies
COPY ./requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt --no-cache-dir

# Copy project files
COPY . .

# Convert script to Unix format and make it executable
RUN dos2unix --newfile docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Run entrypoint
ENTRYPOINT ["bash", "/usr/local/bin/docker-entrypoint.sh"]
