# syntax=docker/dockerfile:1
FROM python:3.12.2-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==1.8.3
RUN poetry config virtualenvs.create false

# Install dependencies first for caching
COPY pyproject.toml /app/
RUN poetry lock && poetry install --no-interaction --no-ansi --no-root

# Copy project
COPY . /app

EXPOSE 8000

CMD ["/bin/sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
