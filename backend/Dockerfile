FROM python:3.12-slim

# Variáveis de ambiente
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir poetry

RUN poetry config installer.max-workers 10

RUN poetry install --no-interaction --no-ansi --no-root

COPY . .

EXPOSE 8080

# Executa o servidor Daphne
CMD ["sh", "-c", "daphne -b 0.0.0.0 -p 8080 core.asgi:application"]
