# Etapa Backend
FROM python:3.12-slim AS backend

ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY backend/pyproject.toml backend/poetry.lock /app/

# Instalar Poetry e dependências
RUN pip install --no-cache-dir poetry \
    && poetry config installer.max-workers 10 \
    && poetry install --no-interaction --no-ansi --no-root

# Copiar todo o backend agora que as dependências foram instaladas
COPY backend/ /app/

EXPOSE 8000

CMD ["poetry", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]

# Etapa Frontend
FROM node:18 AS frontend

WORKDIR /app

# Copiar arquivos de dependências do frontend
COPY frontend/package.json frontend/package-lock.json /app/

# Instalar dependências do frontend
RUN npm install

# Copiar todo o frontend
COPY frontend/ /app/

# Construir frontend
RUN npm run build

# Etapa Final
FROM python:3.12-slim AS final

WORKDIR /app

# Copiar backend já instalado da etapa anterior
COPY --from=backend /app /app

# Copiar o build do frontend para a pasta de staticfiles do backend
COPY --from=frontend /app/build /app/backend/staticfiles/

CMD ["poetry", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
